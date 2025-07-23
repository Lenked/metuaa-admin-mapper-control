import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlacesAPI } from "@/services/api";
import { Place } from "@/types/places";
import { MapPin, Clock, CheckCircle, XCircle } from "lucide-react";

export function DashboardStats() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    validated: 0,
    rejected: 0,
    loading: true
  });
  const [recentPlaces, setRecentPlaces] = useState<Place[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await PlacesAPI.syncPoisFromOdoo();
        const places = response || [];
        
        setStats({
          total: places.length,
          pending: places.filter(p => p.status === 'pending' || p.status === 'synchronized').length,
          validated: places.filter(p => p.status === 'accepted').length,
          rejected: places.filter(p => p.status === 'rejected').length,
          loading: false
        });

        // Get recent places (last 5)
        const recent = places
          .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
          .slice(0, 5);
        setRecentPlaces(recent);
      } catch (error) {
        console.error('Error loading stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'synchronized':
        return <Badge variant="secondary">En attente</Badge>;
      case 'accepted':
        return <Badge className="bg-success text-success-foreground">Validé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="w-24 h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="w-16 h-8 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              Total des lieux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Tous les lieux dans la base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-warning" />
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une validation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="w-4 h-4 text-success" />
              Validés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.validated}</div>
            <p className="text-xs text-muted-foreground">
              Publiés dans l'app
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <XCircle className="w-4 h-4 text-destructive" />
              Rejetés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">
              Non conformes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Places */}
      <Card>
        <CardHeader>
          <CardTitle>Lieux récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPlaces.map((place) => (
              <div key={place.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{place.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {place.address_locality} • {new Date(place.date_added).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                {getStatusBadge(place.status)}
              </div>
            ))}
            {recentPlaces.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p>Aucun lieu récent</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}