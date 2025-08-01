import { Place } from "@/types/places";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface PropertiesStepProps {
  place: Place;
}

export function PropertiesStep({ place }: PropertiesStepProps) {
  return (
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
            {place.properties_attraction && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Attraction</label>
                <p className="capitalize">{place.properties_attraction}</p>
              </div>
            )}
            
            {place.properties_wikidata && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Wikidata</label>
                <a 
                  href={`https://www.wikidata.org/wiki/${place.properties_wikidata}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {place.properties_wikidata}
                </a>
              </div>
            )}
            
            {place.properties_wikipedia && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Wikipedia</label>
                <a 
                  href={place.properties_wikipedia} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {place.properties_wikipedia}
                </a>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Rue</label>
              <p>{place.address_street || 'Non disponible'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Numéro</label>
              <p>{place.address_number || 'Non disponible'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Quartier</label>
              <p>{place.address_neighbourhood || 'Non disponible'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Comté</label>
              <p>{place.address_county || 'Non disponible'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}