import { useState } from "react";
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
  X
} from "lucide-react";
import { ValidateModal } from "./ValidateModal";
import { RejectModal } from "./RejectModal";

interface PlaceDetailModalProps {
  place: Place;
  open: boolean;
  onClose: () => void;
}

export function PlaceDetailModal({ place, open, onClose }: PlaceDetailModalProps) {
  const [modalType, setModalType] = useState<'validate' | 'reject' | null>(null);

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
                  {getStatusBadge(place.status)}
                  <Badge variant="outline">ID: {place.id}</Badge>
                </div>
              </div>
              
              {place.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => openActionModal('validate')}
                    className="bg-success hover:bg-success/90 text-success-foreground"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Valider
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openActionModal('reject')}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Rejeter
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="location">Localisation</TabsTrigger>
              <TabsTrigger value="properties">Propriétés</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
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
                    <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                      <iframe
                        title="Carte de localisation"
                        width="100%"
                        height="100%"
                        style={{ border: 0, borderRadius: '0.5rem', minHeight: '16rem' }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${place.centroid_lon-0.005}%2C${place.centroid_lat-0.005}%2C${place.centroid_lon+0.005}%2C${place.centroid_lat+0.005}&layer=mapnik&marker=${place.centroid_lat}%2C${place.centroid_lon}`}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
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
            </TabsContent>

            <TabsContent value="properties" className="space-y-4">
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
                      <p className="capitalize">{place.status}</p>
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
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Historique des modifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="border-l-2 border-primary pl-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Création</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(place.create_date).toLocaleString('fr-FR')}
                      </p>
                      <p className="text-sm">
                        Par {place.create_uid?.[0]?.name || 'Utilisateur inconnu'}
                      </p>
                    </div>

                    <div className="border-l-2 border-muted pl-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Dernière modification</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(place.write_date).toLocaleString('fr-FR')}
                      </p>
                      <p className="text-sm">
                        Par {place.write_uid?.[0]?.name || 'Utilisateur inconnu'}
                      </p>
                    </div>

                    <div className="border-l-2 border-accent pl-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Date d'ajout</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(place.date_added).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
    </>
  );
}