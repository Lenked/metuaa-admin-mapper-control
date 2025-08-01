import { Place } from "@/types/places";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

interface GeneralStepProps {
  place: Place;
}

export function GeneralStep({ place }: GeneralStepProps) {
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

  return (
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
  );
}