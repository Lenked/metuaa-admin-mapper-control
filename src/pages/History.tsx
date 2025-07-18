import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History as HistoryIcon } from "lucide-react";

export default function History() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Historique</h1>
          <p className="text-muted-foreground">
            Consultez l'historique des actions de modération
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-primary" />
              Historique des actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <HistoryIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fonctionnalité en développement</h3>
              <p className="text-muted-foreground">
                L'historique des actions de modération sera bientôt disponible
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}