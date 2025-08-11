import { AdminLayout } from "@/components/admin/AdminLayout";
import { PendingPlacesList } from "@/components/admin/PendingPlacesList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";

export default function PendingPlaces() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lieux en attente</h1>
            <p className="text-muted-foreground">
              Gérez les propositions de lieux soumises par les utilisateurs
            </p>
          </div>
          <div className="flex items-center gap-2 text-warning">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Validation requise</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Propositions en attente de validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PendingPlacesList />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}