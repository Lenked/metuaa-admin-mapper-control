// src/components/admin/place-steps/ActionStep.tsx
import { useState } from "react";
import { Place } from "@/types/places";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REJECT_REASONS } from "@/types/places";
import { MapPin, Check, X, AlertTriangle, Loader } from "lucide-react";
import { PlacesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface ActionStepProps {
  place: Place;
  onValidate: (placeId: number) => Promise<void>; // Fonction de validation passée du parent
  onReject: (placeId: number, reason: string, comment: string) => Promise<void>; // Fonction de rejet passée du parent
  loading: boolean; // État de chargement géré par le parent
  onBack: () => void; // Fonction pour revenir à l'étape précédente
}

export function ActionStep({ place, onValidate, onReject, loading, onBack }: ActionStepProps) {
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [isConfirmingValidate, setIsConfirmingValidate] = useState(false);
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);

  const { toast } = useToast();

  const handleConfirmValidate = async () => {
    await onValidate(place.id);
    // Réinitialiser les états de confirmation après l'action
    setIsConfirmingValidate(false);
    setIsConfirmingReject(false);
  };

  const handleConfirmReject = async () => {
    if (!reason) {
      toast({ title: "Raison requise", variant: "destructive" });
      return;
    }
    await onReject(place.id, reason, comment);
    // Réinitialiser les états de confirmation après l'action
    setIsConfirmingValidate(false);
    setIsConfirmingReject(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Actions de validation</h3>

      {/* Vue de confirmation de validation */}
      {isConfirmingValidate && (
        <Card className="border-success/20 bg-success/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-success">
              <Check className="w-5 h-5" />
              Confirmer la validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vous êtes sur le point de valider définitivement ce lieu. Il sera publié et visible par tous les utilisateurs.
            </p>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">{place.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {place.address_name || place.address_locality}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsConfirmingValidate(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleConfirmValidate} 
                disabled={loading}
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Validation...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Valider définitivement
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vue de confirmation de rejet */}
      {isConfirmingReject && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <X className="w-5 h-5" />
              Confirmer le rejet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vous êtes sur le point de rejeter définitivement ce lieu. L'utilisateur créateur sera notifié.
            </p>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">{place.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {place.address_name || place.address_locality}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div>
                <Label htmlFor="reason-confirm">Raison du rejet <span className="text-destructive">*</span></Label>
                <Select value={reason} onValueChange={setReason} disabled={loading}>
                  <SelectTrigger id="reason-confirm">
                    <SelectValue placeholder="Choisir une raison" />
                  </SelectTrigger>
                  <SelectContent>
                    {REJECT_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="comment-confirm">Commentaire (optionnel)</Label>
                <Textarea
                  id="comment-confirm"
                  placeholder="Détails supplémentaires pour l'utilisateur..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-none"
                  rows={2}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsConfirmingReject(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button 
                variant="destructive"
                onClick={handleConfirmReject} 
                disabled={loading || !reason}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Rejet...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Rejeter définitivement
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vue principale de l'étape (choix initial) - affichée seulement si aucune confirmation n'est active */}
      {!isConfirmingValidate && !isConfirmingReject && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carte Validation */}
          <Card className="border border-input bg-background hover:bg-accent hover:border-accent transition-colors cursor-pointer"
                onClick={() => setIsConfirmingValidate(true)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-success">
                <Check className="w-5 h-5" />
                Valider le lieu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ce lieu sera publié et visible par tous les utilisateurs.
              </p>
              <div className="pt-4 flex justify-end">
                <Button 
                  variant="outline"
                  className="bg-success hover:bg-success/90 text-success-foreground border-success"
                  onClick={(e) => {
                    e.stopPropagation(); // Empêche le click sur le parent
                    setIsConfirmingValidate(true);
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Valider
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Carte Rejet */}
          <Card className="border border-input bg-background hover:bg-accent hover:border-accent transition-colors cursor-pointer"
                onClick={() => setIsConfirmingReject(true)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <X className="w-5 h-5" />
                Rejeter le lieu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">
                  Cette action est permanente et ne peut pas être annulée.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                L'utilisateur créateur sera notifié de ce rejet.
              </p>
              <div className="pt-4 flex justify-end">
                <Button 
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation(); // Empêche le click sur le parent
                    setIsConfirmingReject(true);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Rejeter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Message d'information en bas, affiché uniquement hors confirmation */}
      {!isConfirmingValidate && !isConfirmingReject && (
        <div className="text-center text-xs text-muted-foreground pt-2">
          <p>Choisissez une action ci-dessus pour procéder à la validation ou au rejet définitif de ce lieu.</p>
        </div>
      )}
    </div>
  );
}