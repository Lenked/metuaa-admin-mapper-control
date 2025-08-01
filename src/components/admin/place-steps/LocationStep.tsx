import { Place } from "@/types/places";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";

interface LocationStepProps {
  place: Place;
}

export function LocationStep({ place }: LocationStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Localisation</h3>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Adresse et coordonnées
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Adresse complète</label>
              <p className="font-medium">{place.address_name || 'Non disponible'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ville</label>
                <p>{place.address_locality || 'Non disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Code plus</label>
                <p>{place.address_plus_code || 'Non disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Région</label>
                <p>{place.address_region || 'Non disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pays</label>
                <p>{place.address_country || 'Non disponible'}</p>
              </div>
            </div>
          </div>
          
          {(place.centroid_lat && place.centroid_lon) && (
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4" />
                Coordonnées GPS (Centroïde)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Latitude</label>
                  <p className="font-mono text-sm">{place.centroid_lat}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Longitude</label>
                  <p className="font-mono text-sm">{place.centroid_lon}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="text-xs text-muted-foreground">Zone de délimitation</label>
                <div className="text-xs text-muted-foreground mt-1">
                  <p>Min: {place.bounding_box_min_lat}, {place.bounding_box_min_lon}</p>
                  <p>Max: {place.bounding_box_max_lat}, {place.bounding_box_max_lon}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}