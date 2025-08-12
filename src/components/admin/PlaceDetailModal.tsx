// src/components/admin/PlaceDetailModal.tsx
import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext"; // Importer useAuth

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
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [ipAddress, setIpAddress] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const { user } = useAuth(); // Utiliser le hook d'authentification

  // Récupérer l'adresse IP au montage
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress(undefined));
  }, []);

  const isPendingOrSync = place.validation_status === 'pending' || place.validation_status === 'synchronized';
  const totalSteps = isPendingOrSync ? 7 : 6;

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

  const handleValidate = async (placeId: number) => {
    if (!user?.id) {
      toast({ title: "Utilisateur non authentifié", variant: "destructive" });
      return;
    }
    setIsActionLoading(true);
    try {
      await PlacesAPI.approvePlace(placeId, user.id, ipAddress);
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
      setIsActionLoading(false);
    }
  };

  const handleReject = async (placeId: number, rejectReason: string, rejectComment: string) => {
    if (!user?.id) {
      toast({ title: "Utilisateur non authentifié", variant: "destructive" });
      return;
    }
    if (!rejectReason) {
      toast({ title: "Raison requise", variant: "destructive" });
      return;
    }
    setIsActionLoading(true);
    try {
      // Concaténer le commentaire à la raison si le commentaire existe
      const finalReason = rejectComment ? `${rejectReason}: ${rejectComment}` : rejectReason;
      await PlacesAPI.rejectPlace(placeId, finalReason, user.id, ipAddress);
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
      setIsActionLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleClose = () => {
    if (!isActionLoading) { 
      setCurrentStep(1);
      onClose();
    }
  };

  const CurrentStepComponent = stepComponents[currentStep - 1];
  const isOnActionStep = isPendingOrSync && currentStep === 7;

  let stepContent;
  if (!CurrentStepComponent) {
    stepContent = <div>Étape non trouvée</div>;
  } else if (isOnActionStep) {
    stepContent = (
      <ErrorBoundary>
        <ActionStep
          place={place}
          onValidate={handleValidate}
          onReject={handleReject}
          loading={isActionLoading}
          onBack={handleBack}
        />
      </ErrorBoundary>
    );
  } else {
    stepContent = <CurrentStepComponent place={place} />;
  }

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
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} 
                  disabled={currentStep === 1 || isActionLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))} 
                  disabled={currentStep === totalSteps || isActionLoading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="min-h-[400px]">
            {stepContent}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
