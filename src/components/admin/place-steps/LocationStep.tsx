import { useState } from "react";
import { Place } from "@/types/places";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";

interface LocationStepProps {
  place: Place;
}

export function LocationStep({ place }: LocationStepProps) {
  const [mapError, setMapError] = useState(false);
  const [showMapPopup, setShowMapPopup] = useState(false); // État pour la popup

  const handleMapError = () => {
    setMapError(true);
  };

  // Vérification des coordonnées
  const hasCoordinates = place.centroid_lat && place.centroid_lon;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Localisation</h3>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
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

          {/* Conteneur pour la carte ou le fallback */}
          <div className="mt-4">
            {hasCoordinates ? (
              <>
                {!mapError ? (
                  <div className="bg-muted rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
                    {/* Iframe avec un zoom plus important */}
                    <iframe
                      key={`map-${place.id}`}
                      title="Carte de localisation"
                      width="100%"
                      height="100%"
                      style={{ border: 0, borderRadius: '0.5rem', minHeight: '16rem' }}
                      // Réduction de la marge pour un zoom plus proche
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${place.centroid_lon-0.001}%2C${place.centroid_lat-0.001}%2C${place.centroid_lon+0.001}%2C${place.centroid_lat+0.001}&layer=mapnik&marker=${place.centroid_lat}%2C${place.centroid_lon}`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      onError={handleMapError}
                    ></iframe>
                    
                    {/* Marqueur personnalisé cliquable */}
                    <button
                      type="button"
                      className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ background: 'none', border: 'none', outline: 'none' }}
                      onClick={(e) => {
                        e.preventDefault(); // Empêche le déclenchement d'autres événements
                        setShowMapPopup(true);
                      }}
                      aria-label="Afficher les détails du point"
                    >
                      {/* SVG du marqueur (identique à celui du modal) */}
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="12" fill="#2563eb" stroke="#fff" strokeWidth="3" />
                        <circle cx="16" cy="16" r="5" fill="#fff" />
                      </svg>
                    </button>

                    {/* Popup avec les détails du lieu (identique à celle du modal) */}
                    {showMapPopup && (
                      <div
                        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-16 bg-white rounded-lg shadow-lg p-4 min-w-[220px] border border-border animate-fade-in"
                        style={{ minWidth: 220 }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-primary">{place.name}</span>
                          <button
                            className="ml-2 text-gray-400 hover:text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation(); // Empêche la propagation du clic
                              setShowMapPopup(false);
                            }}
                            aria-label="Fermer la popup"
                          >
                            ×
                          </button>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {place.address_name || place.address_locality}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Lat: {place.centroid_lat}<br />
                          Lon: {place.centroid_lon}<br />
                          {place.address_plus_code && `Postcode: ${place.address_plus_code}`}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg p-4 border border-dashed border-border">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">{place.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {place.address_name || place.address_locality}
                        </p>
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          <p>Lat: {place.centroid_lat}</p>
                          <p>Lon: {place.centroid_lon}</p>
                          {place.address_plus_code && <p>Postcode: {place.address_plus_code}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-muted rounded-lg h-64 flex flex-col items-center justify-center text-center p-4">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Coordonnées GPS non disponibles</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Impossible d'afficher la carte.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}