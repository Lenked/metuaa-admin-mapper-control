import { Place } from "@/types/places";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";

interface ImagesStepProps {
  place: Place;
}

export function ImagesStep({ place }: ImagesStepProps) {
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        Images {images.length > 0 && <span className="ml-1 text-xs">({images.length})</span>}
      </h3>
      
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
  );
}