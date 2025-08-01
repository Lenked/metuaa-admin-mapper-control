import { useState, useEffect } from "react";
import { Place } from "@/types/places";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone } from "lucide-react";
import { OdooAPI } from "@/services/odoo";

interface UserStepProps {
  place: Place;
}

export function UserStep({ place }: UserStepProps) {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (place.source_id) {
        setLoadingUser(true);
        try {
          const response = await OdooAPI.getUserInfo(place.source_id);
          if (response.success && response.data && response.data.length > 0) {
            setUserInfo(response.data[0]);
          }
        } catch (error) {
          setUserInfo(null);
        } finally {
          setLoadingUser(false);
        }
      }
    };
    fetchUserInfo();
  }, [place.source_id]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Utilisateur</h3>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations de l'utilisateur créateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUser ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Chargement des informations utilisateur...</p>
            </div>
          ) : userInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                  <p className="font-medium">{userInfo.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Matricule</label>
                  <p className="font-mono text-sm">{userInfo.matricule}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {userInfo.email || 'Non disponible'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {userInfo.mobile || userInfo.phone || 'Non disponible'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type de partenaire</label>
                  <p className="capitalize">{userInfo.partner_type || 'Non spécifié'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Statut</label>
                  <Badge variant={userInfo.user_status === 'approved' ? 'default' : 'secondary'}>
                    {userInfo.user_status === 'approved' ? 'Approuvé' : userInfo.user_status}
                  </Badge>
                </div>
              </div>
              
              {userInfo.function && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fonction</label>
                  <p>{userInfo.function}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date de création</label>
                  <p>{new Date(userInfo.create_date).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dernière modification</label>
                  <p>{new Date(userInfo.write_date).toLocaleString('fr-FR')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Informations utilisateur non disponibles</p>
              <p className="text-sm text-muted-foreground mt-1">
                Matricule: {place.source_id}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}