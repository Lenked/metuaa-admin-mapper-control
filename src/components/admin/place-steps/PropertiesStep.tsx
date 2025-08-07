import { Place } from "@/types/places";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Link, MapPin, Hash, Navigation } from "lucide-react"; // Ajout d'icônes

interface PropertiesStepProps {
  place: Place;
}

export function PropertiesStep({ place }: PropertiesStepProps) {
  // Fonction utilitaire pour afficher une valeur ou 'Non disponible'
  const displayValue = (value: string | undefined | null) => value || 'Non disponible';

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Propriétés du lieu</h3>

      {/* Liens externes */}
      {(place.properties_wikidata || place.properties_wikipedia) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              Liens externes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {place.properties_wikidata && (
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex-shrink-0">
                  Wikidata
                </div>
                <a 
                  href={`https://www.wikidata.org/wiki/${place.properties_wikidata}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all text-sm"
                >
                  {place.properties_wikidata}
                </a>
              </div>
            )}
            
            {place.properties_wikipedia && (
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex-shrink-0">
                  Wikipedia
                </div>
                <a 
                  href={place.properties_wikipedia} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all text-sm"
                >
                  {place.properties_wikipedia}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Adresse détaillée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Adresse détaillée
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase">Rue</label>
              <p className="text-sm">{displayValue(place.address_street)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase">Numéro</label>
              <p className="text-sm">{displayValue(place.address_number)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase">Quartier</label>
              <p className="text-sm">{displayValue(place.address_neighbourhood)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase">Comté</label>
              <p className="text-sm">{displayValue(place.address_county)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}