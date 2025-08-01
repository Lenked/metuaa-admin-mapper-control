import { Place } from "@/types/places";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

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

  return (
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
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Statut actuel</label>
              <div className="mt-1">
                {getStatusBadge(place.validation_status)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date d'ajout</label>
                <p>{place.date_added ? new Date(place.date_added).toLocaleString('fr-FR') : 'Non disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID Odoo</label>
                <p>{place.odoo_id || 'Non disponible'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Source</label>
                <p className="capitalize">{place.source || 'Non spécifiée'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Couche</label>
                <p>{place.layer || 'Non spécifiée'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}