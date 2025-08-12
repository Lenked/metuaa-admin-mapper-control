import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { Settings as SettingsIcon, RefreshCw, Loader2, User, Mail, Phone, Hash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PlacesAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

export default function Settings() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("idle");
  const [lastRunStart, setLastRunStart] = useState<string | null>(null);
  const [lastRunEnd, setLastRunEnd] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [startingSync, setStartingSync] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  const statusVariant = useMemo(() => {
    switch (status) {
      case "success":
        return "default" as const; // using default styled badge as success color is defined in design system
      case "error":
        return "destructive" as const;
      case "running":
        return "secondary" as const; // visual neutral while running
      default:
        return "outline" as const;
    }
  }, [status]);

  useEffect(() => {
    document.title = "Paramètres | METUA'A MAPPERS";
  }, []);

  const clearPolling = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await PlacesAPI.getSyncStatus();
      setStatus(res.status || "idle");
      setLastRunStart(res.last_run_start || null);
      setLastRunEnd(res.last_run_end || null);
      setErrorMessage(res.error_message || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Start polling if already running
    const startIfRunning = async () => {
      try {
        const res = await PlacesAPI.getSyncStatus();
        if (res.status === "running" && !intervalRef.current) {
          intervalRef.current = window.setInterval(fetchStatus, 5000);
        }
      } catch {}
    };
    startIfRunning();
    return () => clearPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "running") {
      clearPolling();
    } else if (!intervalRef.current) {
      intervalRef.current = window.setInterval(fetchStatus, 5000);
    }
  }, [status]);

  const handleStartSync = async () => {
    setStartingSync(true);
    try {
      await PlacesAPI.syncPoisFromOdoo();
      toast({ title: "Synchronisation lancée", description: "La synchronisation Odoo a démarré en arrière-plan." });
      setStatus("running");
      intervalRef.current = window.setInterval(fetchStatus, 5000);
    } catch (e: any) {
      toast({ title: "Échec du démarrage", description: e?.message || "Impossible de lancer la synchronisation.", variant: "destructive" });
    } finally {
      setStartingSync(false);
    }
  };

  return (
    <AdminLayout>
      <main className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Configurez le système et consultez vos informations.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profil utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2"><User className="w-4 h-4" /><span className="font-medium">{user.name}</span></div>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span className="text-sm text-muted-foreground">{user.email || '-'}</span></div>
                  <div className="flex items-center gap-2"><Hash className="w-4 h-4" /><span className="text-sm text-muted-foreground">Matricule: {user.matricule || '-'}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span className="text-sm text-muted-foreground">{user.phone || '-'}</span></div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Aucun utilisateur connecté.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Synchronisation Odoo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Statut:</span>
                {loadingStatus ? (
                  <span className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
                  </span>
                ) : (
                  <Badge variant={statusVariant}>{status}</Badge>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div>Dernier démarrage: {lastRunStart ? new Date(lastRunStart).toLocaleString('fr-FR') : '-'}</div>
                <div>Dernière fin: {lastRunEnd ? new Date(lastRunEnd).toLocaleString('fr-FR') : '-'}</div>
              </div>
              {errorMessage && (
                <p className="text-destructive text-sm">Erreur: {errorMessage}</p>
              )}
              <div className="flex gap-2">
                <Button onClick={handleStartSync} disabled={startingSync || status === 'running'}>
                  {startingSync ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Lancer la synchronisation
                </Button>
                <Button variant="outline" onClick={fetchStatus} disabled={loadingStatus}>
                  Actualiser le statut
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </AdminLayout>
  );
}
