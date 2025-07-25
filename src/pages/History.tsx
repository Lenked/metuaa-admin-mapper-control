import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History as HistoryIcon, Check, X, Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { PlacesAPI } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OdooAPI } from "@/services/odoo";
import { REJECT_REASONS } from "@/types/places";

function getRejectLabel(reason) {
  const found = REJECT_REASONS.find(r => r.value === reason);
  return found ? found.label : reason || '-';
}

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);
  const [userInfos, setUserInfos] = useState<Record<number, any>>({});
  const [loadingUsers, setLoadingUsers] = useState<Record<number, boolean>>({});
  const [moderatorInfos, setModeratorInfos] = useState<Record<number|string, any>>({});
  const [loadingModerators, setLoadingModerators] = useState<Record<number|string, boolean>>({});

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PlacesAPI.getValidationHistory(skip, limit);
      setHistory(data);
      // Précharger les infos utilisateur pour chaque POI unique
      const ids = Array.from(new Set(data.map(item => item.poi_id)));
      const newUserInfos: Record<number, any> = { ...userInfos };
      const newLoadingUsers: Record<number, boolean> = { ...loadingUsers };
      await Promise.all(ids.map(async (id) => {
        if (!newUserInfos[id]) {
          newLoadingUsers[id] = true;
          try {
            const res = await OdooAPI.getUserInfoWithId(id);
            if (res && res.data && res.data.length > 0) {
              newUserInfos[id] = res.data[0];
            } else {
              newUserInfos[id] = null;
            }
          } catch {
            newUserInfos[id] = null;
          } finally {
            newLoadingUsers[id] = false;
          }
        }
      }));
      setUserInfos(newUserInfos);
      setLoadingUsers(newLoadingUsers);

      // Précharger les infos modérateur pour chaque performed_by unique
      const moderatorIds = Array.from(new Set(data.map(item => item.performed_by)));
      const newModeratorInfos: Record<number|string, any> = { ...moderatorInfos };
      const newLoadingModerators: Record<number|string, boolean> = { ...loadingModerators };
      await Promise.all(moderatorIds.map(async (id) => {
        if (id && !newModeratorInfos[id]) {
          newLoadingModerators[id] = true;
          try {
            const res = await OdooAPI.getUserInfoWithId(id);
            if (res && res.data && res.data.length > 0) {
              newModeratorInfos[id] = res.data[0];
            } else {
              newModeratorInfos[id] = null;
            }
          } catch {
            newModeratorInfos[id] = null;
          } finally {
            newLoadingModerators[id] = false;
          }
        }
      }));
      setModeratorInfos(newModeratorInfos);
      setLoadingModerators(newLoadingModerators);
    } catch (e) {
      setError("Erreur lors du chargement de l'historique.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, [skip]);

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
            {loading ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Chargement de l'historique...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                <p>{error}</p>
                <Button variant="outline" onClick={fetchHistory} className="mt-4">Réessayer</Button>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <HistoryIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune action trouvée</h3>
                <p className="text-muted-foreground">
                  Aucun historique de validation ou de rejet pour le moment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Action</th>
                      {/* <th className="px-3 py-2 text-left">POI</th> */}
                      <th className="px-3 py-2 text-left">Raison</th>
                      <th className="px-3 py-2 text-left">Modérateur</th>
                      <th className="px-3 py-2 text-left">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="px-3 py-2 whitespace-nowrap">{new Date(item.action_date).toLocaleString('fr-FR')}</td>
                        <td className="px-3 py-2">
                          {item.action === 'validate' ? (
                            <Badge className="bg-success text-success-foreground"><Check className="w-4 h-4 inline mr-1" />Validé</Badge>
                          ) : item.action === 'reject' ? (
                            <Badge variant="destructive"><X className="w-4 h-4 inline mr-1" />Rejeté</Badge>
                          ) : (
                            <Badge variant="outline">{item.action}</Badge>
                          )}
                        </td>
                        {/* <td className="px-3 py-2">
                          {loadingUsers[item.poi_id] ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground inline" />
                          ) : userInfos[item.poi_id] ? (
                            <div>
                              <span className="font-semibold">{userInfos[item.poi_id].name}</span>
                              <div className="text-xs text-muted-foreground">{userInfos[item.poi_id].email || userInfos[item.poi_id].matricule || ''}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />Inconnu</span>
                          )}
                        </td> */}
                        <td className="px-3 py-2">{getRejectLabel(item.rejection_reason)}</td>
                        <td className="px-3 py-2">
                          {loadingModerators[item.performed_by] ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground inline" />
                          ) : moderatorInfos[item.performed_by] ? (
                            <span className="font-semibold">{moderatorInfos[item.performed_by].name}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />Inconnu</span>
                          )}
                        </td>
                        <td className="px-3 py-2">{item.ip_address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between items-center mt-4">
                  <Button variant="outline" size="sm" onClick={() => setSkip(Math.max(0, skip - limit))} disabled={skip === 0}>Précédent</Button>
                  <span className="text-xs text-muted-foreground">Page {Math.floor(skip / limit) + 1}</span>
                  <Button variant="outline" size="sm" onClick={() => setSkip(skip + limit)} disabled={history.length < limit}>Suivant</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}