import { useState, useEffect } from "react";
import { Place } from "@/types/places";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Calendar,
  User,
  Tag,
  Building,
  Navigation,
  Check,
  X,
  Image as ImageIcon,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { PlacesAPI } from "@/services/api";
import { OdooAPI } from "@/services/odoo";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { REJECT_REASONS } from "@/types/places";

interface PlaceDetailModalProps {
  place: Place;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PlaceDetailModal({ place, open, onClose, onSuccess }: PlaceDetailModalProps) {
  const [view, setView] = useState<'detail' | 'validate' | 'reject' | 'success'>('detail');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) setView('detail');
  }, [open]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'synchronized':
        return <Badge variant="secondary">En attente</Badge>;
      case 'validated':
        return <Badge className="bg-success text-success-foreground">Validé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'university': 'Université',
      'school': 'École',
      'restaurant': 'Restaurant',
      'hospital': 'Hôpital',
      'hotel': 'Hôtel',
      'park': 'Parc',
      'museum': 'Musée',
      'shopping': 'Commerce',
    };
    return categories[category] || category;
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (place.source_id && open) {
        setLoadingUser(true);
        try {
          const response = await OdooAPI.getUserInfo(place.source_id);
          if (response.success && response.data && response.data.length > 0) {
            setUserInfo(response.data[0]);
          }
        } catch (error) {
          setUserInfo(null);
        } finally {
          setLoadingUser(false);
        }
      }
    };
    fetchUserInfo();
  }, [place.source_id, open]);

  const parseImages = (imageData: string): string[] => {
    try {
      if (!imageData || imageData === '[]' || imageData === '"[]"') {
        return [];
      }
      let parsed = imageData;
      if (typeof imageData === 'string' && imageData.startsWith('"[') && imageData.endsWith(']"')) {
        parsed = JSON.parse(imageData);
      }
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const images = parseImages(place.properties_image);

  // Validation
  const handleValidate = async () => {
    setLoading(true);
    try {
      await PlacesAPI.approvePlace(place.id, 2, "ip");
      setView("success");
      toast({ title: "Lieu validé", description: `${place.name} a été validé avec succès` });
      setTimeout(() => {
        setView("detail");
        onClose();
        onSuccess?.();
      }, 1200);
    } catch {
      toast({ title: "Erreur", description: "Impossible de valider le lieu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Rejet amélioré avec raison/commentaire
  const handleReject = async () => {
    if (!reason) {
      toast({
        title: "Raison requise",
        description: "Veuillez sélectionner une raison de rejet",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await PlacesAPI.rejectPlace(place.id, reason, 2, "ip");
      setView("success");
      toast({ title: "Lieu rejeté", description: `${place.name} a été rejeté` });
      setTimeout(() => {
        setView("detail");
        onClose();
        onSuccess?.();
      }, 1200);
    } catch {
      toast({ title: "Erreur", description: "Impossible de rejeter le lieu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {view === "detail" && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <DialogTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {place.name}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(place.validation_status)}
                    <Badge variant="outline">ID: {place.id}</Badge>
                  </div>
                </div>
                {(place.validation_status === 'pending' || place.validation_status === 'synchronized') && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Étape {currentStep} sur {totalSteps}</span>
                      <div className="flex gap-1">
                        {Array.from({ length: totalSteps }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))} disabled={currentStep === totalSteps}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogHeader>
            <div className="space-y-6">
              {/* Step Content */}
              <div className="min-h-[400px]">
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Général</h3>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="w-5 h-5" />
                          Informations générales
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Nom</label>
                            <p className="font-medium">{place.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Type</label>
                            <p className="capitalize">{place.type}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Catégorie</label>
                            <p>{getCategoryLabel(place.properties_category)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Sous-catégorie</label>
                            <p className="capitalize">{place.properties_subcategory}</p>
                          </div>
                        </div>
                        
                        {place.properties_description && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                            <p className="mt-1">{place.properties_description}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Images {images.length > 0 && <span className="ml-1 text-xs">({images.length})</span>}</h3>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5" />
                          Images du lieu
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {images.length > 0 ? (
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              {images.length} image{images.length > 1 ? 's' : ''} disponible{images.length > 1 ? 's' : ''}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {images.map((imageBase64, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="relative group">
                                    <img
                                      src={`data:image/jpeg;base64,${imageBase64}`}
                                      alt={`Image ${index + 1} de ${place.name}`}
                                      className="w-full h-48 object-cover rounded-lg border border-border"
                                      onError={(e) => {
                                        e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==";
                                      }}
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg" />
                                  </div>
                                  <p className="text-xs text-muted-foreground text-center">
                                    Image {index + 1}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Aucune image disponible pour ce lieu</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Utilisateur</h3>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Informations de l'utilisateur créateur
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                      {loadingUser ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">Chargement des informations utilisateur...</p>
                      </div>
                    ) : userInfo ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                            <p className="font-medium">{userInfo.name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Matricule</label>
                            <p className="font-mono text-sm">{userInfo.matricule}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {userInfo.email || 'Non disponible'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                            <p className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {userInfo.mobile || userInfo.phone || 'Non disponible'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Type de partenaire</label>
                            <p className="capitalize">{userInfo.partner_type || 'Non spécifié'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Statut</label>
                            <Badge variant={userInfo.user_status === 'approved' ? 'default' : 'secondary'}>
                              {userInfo.user_status === 'approved' ? 'Approuvé' : userInfo.user_status}
                            </Badge>
                          </div>
                        </div>
                        
                        {userInfo.function && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Fonction</label>
                            <p>{userInfo.function}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Date de création</label>
                            <p>{new Date(userInfo.create_date).toLocaleString('fr-FR')}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Dernière modification</label>
                            <p>{new Date(userInfo.write_date).toLocaleString('fr-FR')}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Informations utilisateur non disponibles</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Matricule: {place.source_id}
                        </p>
                      </div>
                    )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Localisation</h3>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Navigation className="w-5 h-5" />
                          Informations de localisation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Latitude</label>
                        <p className="font-mono">{place.centroid_lat}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Longitude</label>
                        <p className="font-mono">{place.centroid_lon}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Adresse complète</label>
                      <div className="bg-muted p-3 rounded-lg space-y-1">
                        {place.address_name && <p>{place.address_name}</p>}
                        {place.address_street && <p>{place.address_street}</p>}
                        <p>
                          {place.address_locality}, {place.address_county}
                        </p>
                        <p>{place.address_region}, {place.address_country}</p>
                        {place.address_plus_code && (
                          <p className="text-xs text-muted-foreground">
                            Plus Code: {place.address_plus_code}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Carte de localisation ou fallback coordonnées */}
                    {place.centroid_lat && place.centroid_lon ? (
                      <div className="bg-muted rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
                        <iframe
                          title="Carte de localisation"
                          width="100%"
                          height="100%"
                          style={{ border: 0, borderRadius: '0.5rem', minHeight: '16rem' }}
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${place.centroid_lon-0.005}%2C${place.centroid_lat-0.005}%2C${place.centroid_lon+0.005}%2C${place.centroid_lat+0.005}&layer=mapnik&marker=${place.centroid_lat}%2C${place.centroid_lon}`}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          id="osm-map-iframe"
                        ></iframe>
                        {/* Marqueur custom en overlay + popup au clic */}
                        <button
                          type="button"
                          className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                          style={{ background: 'none', border: 'none', outline: 'none' }}
                          onClick={() => setShowMapPopup(true)}
                          aria-label="Afficher les détails du point"
                        >
                          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="12" fill="#2563eb" stroke="#fff" strokeWidth="3" />
                            <circle cx="16" cy="16" r="5" fill="#fff" />
                          </svg>
                        </button>
                        {showMapPopup && (
                          <div
                            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-16 bg-white rounded-lg shadow-lg p-4 min-w-[220px] border border-border animate-fade-in"
                            style={{ minWidth: 220 }}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-primary">{place.name}</span>
                              <button
                                className="ml-2 text-gray-400 hover:text-gray-700"
                                onClick={() => setShowMapPopup(false)}
                                aria-label="Fermer la popup"
                              >
                                ×
                              </button>
                            </div>
                            <div className="text-xs text-muted-foreground mb-1">{place.address_name || place.address_locality}</div>
                            <div className="text-xs text-muted-foreground">
                              Lat: {place.centroid_lat.toFixed(6)}<br />
                              Lon: {place.centroid_lon.toFixed(6)}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <MapPin className="w-8 h-8 mx-auto mb-2" />
                          <p>Carte de localisation non disponible</p>
                          <p className="text-xs">
                            {place.centroid_lat?.toFixed(6)}, {place.centroid_lon?.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                    </Card>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Propriétés</h3>
                    
                    <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Propriétés et métadonnées
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Layer</label>
                        <p className="capitalize">{place.layer}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Attraction</label>
                        <p>{place.properties_attraction ? 'Oui' : 'Non'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Source ID</label>
                        <p className="font-mono text-xs">{place.source_id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Statut</label>
                        <p className="capitalize">{place.validation_status}</p>
                      </div>
                    </div>

                    {place.properties_wikidata && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Wikidata</label>
                        <p className="font-mono text-xs">{place.properties_wikidata}</p>
                      </div>
                    )}

                    {place.properties_wikipedia && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Wikipedia</label>
                        <p className="text-xs">{place.properties_wikipedia}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Source</label>
                      <p className="text-xs break-all">{place.source}</p>
                    </div>
                  </CardContent>
                </Card>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Historique</h3>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Historique du lieu
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">Lieu ajouté</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(place.date_added).toLocaleString('fr-FR')}
                              </p>
                            </div>
                            <Badge variant="outline">Créé</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">Statut actuel</p>
                              <p className="text-sm text-muted-foreground">
                                En attente de validation
                              </p>
                            </div>
                            {getStatusBadge(place.validation_status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons - Only shown in step 6 for pending places */}
                    {(place.validation_status === 'pending' || place.validation_status === 'synchronized') && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            Actions de validation
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-center gap-4">
                            <Button
                              size="lg"
                              onClick={() => setView('validate')}
                              className="bg-success hover:bg-success/90 text-success-foreground"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Valider ce lieu
                            </Button>
                            <Button
                              size="lg"
                              variant="destructive"
                              onClick={() => setView('reject')}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Rejeter ce lieu
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground text-center mt-4">
                            Une fois validé ou rejeté, le statut du lieu sera mis à jour définitivement.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Étape {currentStep} sur {totalSteps}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                  disabled={currentStep === totalSteps}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        )}
        {view === "validate" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success" />
                Valider le lieu
              </DialogTitle>
              <DialogDescription>
                Vous êtes sur le point de valider ce lieu. Cette action ne peut pas être annulée.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-semibold">{place.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {place.properties_category && (
                        <span className="capitalize">{place.properties_category}</span>
                      )}
                      {place.properties_category && place.address_locality && ' • '}
                      {place.address_locality}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {place.address_name}
                    </p>
                    {place.properties_description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {place.properties_description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-success border border-success/20 p-4 rounded-lg">
                <p className="text-sm text-success-foreground">
                  <strong>Confirmer la validation :</strong> Ce lieu sera publié et visible par tous les utilisateurs de l'application.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setView('detail')} disabled={loading}>
                Annuler
              </Button>
              <Button 
                onClick={handleValidate} 
                disabled={loading}
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Validation...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Valider le lieu
                  </>
                )}
              </Button>
            </div>
          </>
        )}
        {view === "reject" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <X className="w-5 h-5 text-destructive" />
                Rejeter le lieu
              </DialogTitle>
              <DialogDescription>
                Indiquez la raison du rejet de ce lieu. L'utilisateur sera notifié.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-semibold">{place.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {place.properties_category && (
                        <span className="capitalize">{place.properties_category}</span>
                      )}
                      {place.properties_category && place.address_locality && ' • '}
                      {place.address_locality}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {place.address_name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">
                    Cette action rejetera définitivement le lieu. L'utilisateur sera notifié de ce rejet.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium">
                  Raison du rejet <span className="text-destructive">*</span>
                </Label>
                <Select onValueChange={setReason} value={reason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une raison" />
                  </SelectTrigger>
                  <SelectContent>
                    {REJECT_REASONS.map((reasonOption) => (
                      <SelectItem key={reasonOption.value} value={reasonOption.value}>
                        {reasonOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment" className="text-sm font-medium">
                  Commentaire additionnel (optionnel)
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Ajoutez des détails sur la raison du rejet..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => { setReason(""); setComment(""); setView('detail'); }} disabled={loading}>
                Annuler
              </Button>
              <Button 
                variant="destructive"
                onClick={handleReject} 
                disabled={loading || !reason}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Rejet...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Rejeter le lieu
                  </>
                )}
              </Button>
            </div>
          </>
        )}
        {view === "success" && (
          <div className="flex flex-col items-center justify-center py-16">
            <Check className="w-12 h-12 text-success mb-4" />
            <p className="text-lg font-semibold mb-2">Opération réussie !</p>
            <p className="text-muted-foreground">Le statut du lieu a été mis à jour.</p>
          </div>
        )}
      </DialogContent>
      <style>{`
  @keyframes fade-in {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in {
    animation: fade-in 0.25s cubic-bezier(0.4,0,0.2,1);
  }
`}</style>
    </Dialog>
  );
}