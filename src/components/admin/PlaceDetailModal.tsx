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
} from "lucide-react";
import { PlacesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
// Import des composants steps
import { GeneralStep } from "./place-steps/GeneralStep";
import { ImagesStep } from "./place-steps/ImagesStep";
import { UserStep } from "./place-steps/UserStep";
import { LocationStep } from "./place-steps/LocationStep";
import { PropertiesStep } from "./place-steps/PropertiesStep";
import { HistoryStep } from "./place-steps/HistoryStep";
import { ActionStep } from "./place-steps/ActionStep";
import ErrorBoundary from "../ErrorBoundary";

interface PlaceDetailModalProps {
  place: Place;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PlaceDetailModal({ place, open, onClose, onSuccess }: PlaceDetailModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  // Ajout de l'état de chargement spécifique pour l'ActionStep
  const [isActionLoading, setIsActionLoading] = useState(false);
  // Les états reason et comment ne semblent pas utilisés directement ici,
  // ils sont gérés dans ActionStep. On les retire d'ici.
  // const [reason, setReason] = useState("");
  // const [comment, setComment] = useState("");

  const { toast } = useToast();

  // Déterminer le nombre total d'étapes en fonction du statut
  const isPendingOrSync = place.validation_status === 'pending' || place.validation_status === 'synchronized';
  const totalSteps = isPendingOrSync ? 7 : 6;

  // Inclure ActionStep dans le tableau
  const stepComponents = [
    GeneralStep,
    ImagesStep,
    UserStep,
    LocationStep,
    PropertiesStep,
    HistoryStep,
    ActionStep,
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
    setIsActionLoading(true); // Utiliser l'état local pour l'ActionStep
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
      setIsActionLoading(false); // Utiliser l'état local pour l'ActionStep
    }
  };

  // Fonction de rejet passée à ActionStep
  // Note: reason et comment sont gérés par ActionStep, pas besoin de les passer ici
  const handleReject = async (placeId: number, rejectReason: string, rejectComment: string) => {
    if (!rejectReason) {
      toast({ title: "Raison requise", variant: "destructive" });
      return;
    }
    setIsActionLoading(true); // Utiliser l'état local pour l'ActionStep
    try {
      await PlacesAPI.rejectPlace(placeId, rejectReason, 2, "ip");
      toast({ 
        title: "Lieu rejeté", 
        description: `${place.name} a été rejeté` 
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Erreur de rejet:", error);
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setIsActionLoading(false); // Utiliser l'état local pour l'ActionStep
    }
  };

  // Fonction pour gérer le retour (nécessaire pour ActionStep)
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleClose = () => {
    // Utiliser l'état local isActionLoading pour vérifier le chargement
    if (!isActionLoading) { 
      setCurrentStep(1);
      // setReason(""); // Non nécessaire ici
      // setComment(""); // Non nécessaire ici
      onClose();
    }
  };

  // Obtenir le composant de l'étape courante
  const CurrentStepComponent = stepComponents[currentStep - 1];

  // Vérifier si l'étape courante est l'ActionStep
  const isOnActionStep = isPendingOrSync && currentStep === 7;

  // --- Rendu conditionnel refactorisé pour éviter les erreurs TS ---
  let stepContent;

  if (!CurrentStepComponent) {
    stepContent = <div>Étape non trouvée</div>;
  } else if (isOnActionStep) {
    // Rendu spécifique pour ActionStep avec ErrorBoundary
    stepContent = (
      <ErrorBoundary>
        <ActionStep
          place={place}
          onValidate={handleValidate}
          onReject={handleReject}
          loading={isActionLoading} // Utiliser l'état local
          onBack={handleBack}       // Passer la fonction handleBack
        />
      </ErrorBoundary>
    );
  } else {
    // Rendu pour les autres étapes
    stepContent = <CurrentStepComponent place={place} />;
  }
  // --- Fin du rendu conditionnel refactorisé ---

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
                  disabled={currentStep === 1 || isActionLoading} // Utiliser l'état local
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))} 
                  disabled={currentStep === totalSteps || isActionLoading} // Utiliser l'état local
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="min-h-[400px]">
            {/* Rendre le contenu de l'étape calculé ci-dessus */}
            {stepContent}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}