import { useState, useEffect } from "react";
import { Place } from "@/types/places";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Calendar, 
  User, 
  Tag, 
  Globe, 
  Building,
  Navigation,
  Check,
  X,
  Image as ImageIcon,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { ValidateModal } from "./ValidateModal";
import { RejectModal } from "./RejectModal";
import { PlacesAPI } from "@/services/api";
import { OdooAPI } from "@/services/odoo";

interface PlaceDetailModalProps {
  place: Place;
  open: boolean;
  onClose: () => void;
}

export function PlaceDetailModal({ place, open, onClose }: PlaceDetailModalProps) {
  const [modalType, setModalType] = useState<'validate' | 'reject' | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'synchronized':
        return <Badge variant="secondary">En attente</Badge>;
      case 'accepted':
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

  const openActionModal = (type: 'validate' | 'reject') => {
    setModalType(type);
  };

  const closeActionModal = () => {
    setModalType(null);
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
          console.error('Error fetching user info:', error);
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
      
      // Try to parse as JSON if it's a string representation
      let parsed = imageData;
      if (typeof imageData === 'string' && imageData.startsWith('"[') && imageData.endsWith(']"')) {
        parsed = JSON.parse(imageData);
      }
      
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing images:', error);
      return [];
    }
  };

  const images = parseImages(place.properties_image);
  const listImages: { image_data: string }[] = [];

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                          className={`w-2 h-2 rounded-full ${
                            i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                      disabled={currentStep === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                      disabled={currentStep === totalSteps}
                    >
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
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Informations utilisateur non disponibles</p>
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
                          <p className="font-mono text-sm">{place.centroid_lat}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Longitude</label>
                          <p className="font-mono text-sm">{place.centroid_lon}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Localité</label>
                          <p>{place.address_locality}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Pays</label>
                          <p>{place.address_country}</p>
                        </div>
                      </div>
                      
                      {place.address_street && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Adresse complète</label>
                          <p className="mt-1">
                            {[place.address_number, place.address_street, place.address_locality, place.address_country]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
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
                        Propriétés du lieu
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Source</label>
                          <p className="capitalize">{place.source}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Layer</label>
                          <p>{place.layer}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Attraction</label>
                          <p>{place.properties_attraction}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Date d'ajout</label>
                          <p>{new Date(place.date_added).toLocaleString('fr-FR')}</p>
                        </div>
                      </div>
                      
                      {place.properties_wikidata && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Lien Wikidata</label>
                          <a 
                            href={place.properties_wikidata} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            <Globe className="w-4 h-4" />
                            {place.properties_wikidata}
                          </a>
                        </div>
                      )}
                      
                      {place.properties_wikipedia && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Lien Wikipedia</label>
                          <a 
                            href={place.properties_wikipedia} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            <Globe className="w-4 h-4" />
                            {place.properties_wikipedia}
                          </a>
                        </div>
                      )}
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
                            onClick={() => openActionModal('validate')}
                            className="bg-success hover:bg-success/90 text-success-foreground"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Valider ce lieu
                          </Button>
                          <Button
                            size="lg"
                            variant="destructive"
                            onClick={() => openActionModal('reject')}
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
        </DialogContent>
      </Dialog>

      {/* Action modals */}
      {modalType === 'validate' && (
        <ValidateModal
          place={place}
          open={true}
          onClose={closeActionModal}
          onSuccess={() => {
            closeActionModal();
            onClose(); // Close parent modal too
          }}
        />
      )}
      
      {modalType === 'reject' && (
        <RejectModal
          place={place}
          open={true}
          onClose={closeActionModal}
          onSuccess={() => {
            closeActionModal();
            onClose(); // Close parent modal too
          }}
        />
      )}
      <style>{`
  @keyframes fade-in {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fade-in {
    animation: fade-in 0.25s cubic-bezier(0.4,0,0.2,1);
  }
`}</style>
    </>
  );
}