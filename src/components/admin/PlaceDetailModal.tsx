// src/components/admin/PlaceDetailModal.tsx
import { useState } from "react";
import { Place } from "@/types/places";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { PlacesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { REJECT_REASONS } from "@/types/places";
// Import des composants steps
import { GeneralStep } from "./place-steps/GeneralStep";
import { ImagesStep } from "./place-steps/ImagesStep";
import { UserStep } from "./place-steps/UserStep";
import { LocationStep } from "./place-steps/LocationStep";
import { PropertiesStep } from "./place-steps/PropertiesStep";
import { HistoryStep } from "./place-steps/HistoryStep";
import { ActionStep } from "./place-steps/ActionStep"; // Assurez-vous que l'import est correct

interface PlaceDetailModalProps {
  place: Place;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PlaceDetailModal({ place, open, onClose, onSuccess }: PlaceDetailModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");

  const { toast } = useToast();

  // Déterminer le nombre total d'étapes en fonction du statut
  const isPendingOrSync = place.validation_status === 'pending' || place.validation_status === 'synchronized';
  const totalSteps = isPendingOrSync ? 7 : 6; // Ajout de l'étape ActionStep si nécessaire

  // Inclure ActionStep dans le tableau
  const stepComponents = [
    GeneralStep,
    ImagesStep,
    UserStep,
    LocationStep,
    PropertiesStep,
    HistoryStep,
    ActionStep, // Étape 7
  ];

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

  // Fonction de validation passée à ActionStep
  const handleValidate = async (placeId: number) => {
    setLoading(true);
    try {
      await PlacesAPI.approvePlace(placeId, 2, "ip");
      toast({ 
        title: "Lieu validé", 
        description: `${place.name} a été validé avec succès` 
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Erreur de validation:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de valider le lieu", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction de rejet passée à ActionStep
  const handleReject = async (placeId: number, rejectReason: string, rejectComment: string) => {
    if (!rejectReason) {
      toast({ title: "Raison requise", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await PlacesAPI.rejectPlace(placeId, rejectReason, 2, "ip");
      toast({ 
        title: "Lieu rejeté", 
        description: `${place.name} a été rejeté` 
      });
      // Réinitialiser les champs locaux après un rejet réussi
      setReason("");
      setComment("");
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Erreur de rejet:", error);
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCurrentStep(1);
      setReason("");
      setComment("");
      onClose();
    }
  };

  // Obtenir le composant de l'étape courante
  const CurrentStepComponent = stepComponents[currentStep - 1];

  // Vérifier si l'étape courante est l'ActionStep
  const isOnActionStep = isPendingOrSync && currentStep === 7;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {place.name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge(place.validation_status)}
                <Badge variant="outline">ID: {place.id}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Étape {currentStep} sur {totalSteps}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {/* Boutons de navigation */}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} 
                  disabled={currentStep === 1 || loading} // Désactiver pendant le chargement
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))} 
                  disabled={currentStep === totalSteps || loading} // Désactiver pendant le chargement
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="min-h-[400px]">
            {/* Rendu conditionnel du composant d'étape */}
            {CurrentStepComponent ? (
              // Si c'est l'ActionStep, passer les props nécessaires
              isOnActionStep && CurrentStepComponent === ActionStep ? (
                <ActionStep
                  place={place}
                  onValidate={handleValidate}
                  onReject={handleReject}
                  loading={loading}
                  onBack={() => setCurrentStep(Math.max(1, currentStep - 1))} // Optionnel si ActionStep gère son propre retour
                />
              ) : (
                // Pour les autres étapes, passer uniquement `place`
                <CurrentStepComponent place={place} />
              )
            ) : (
              <div>Étape non trouvée</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}