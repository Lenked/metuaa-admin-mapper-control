import { Place } from "@/types/places";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Hash, Clock, Database, Layers, Tag } from "lucide-react"; // Ajout d'icônes

interface HistoryStepProps {
  place: Place;
}

export function HistoryStep({ place }: HistoryStepProps) {
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

  // Fonction utilitaire pour afficher une valeur ou 'Non disponible'
  const displayValue = (value: string | number | undefined | null) => value || 'Non disponible';

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Historique et métadonnées</h3>

      {/* Statut Actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Statut du lieu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Statut actuel</p>
              <div className="text-lg font-semibold">{getStatusBadge(place.validation_status)}</div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date d'ajout</p>
              <p className="font-medium">
                {place.date_added 
                  ? new Date(place.date_added).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) 
                  : 'Non disponible'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métadonnées Techniques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Métadonnées techniques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Source seule en haut */}
          <div className="flex items-start gap-3">
            <Database className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase">Source</label>
              <p className="text-sm break-all">{displayValue(place.source)}</p>
            </div>
          </div>

          {/* Couche et Type côte à côte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Layers className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase">Couche</label>
                <p className="text-sm">{displayValue(place.layer)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Tag className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase">Type</label>
                <p className="text-sm capitalize">{displayValue(place.type)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}