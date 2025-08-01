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

  const totalSteps = 6;
  const stepComponents = [
    GeneralStep,
    ImagesStep,
    UserStep,
    LocationStep,
    PropertiesStep,
    HistoryStep,
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

  const handleValidate = async () => {
    setLoading(true);
    try {
      await PlacesAPI.approvePlace(place.id, 2, "ip");
      toast({ 
        title: "Lieu validé", 
        description: `${place.name} a été validé avec succès` 
      });
      onClose();
      onSuccess?.();
    } catch {
      toast({ 
        title: "Erreur", 
        description: "Impossible de valider le lieu", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason) {
      toast({ title: "Raison requise", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await PlacesAPI.rejectPlace(place.id, reason, 2, "ip");
      toast({ 
        title: "Lieu rejeté", 
        description: `${place.name} a été rejeté` 
      });
      onClose();
      onSuccess?.();
    } catch {
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

  const canShowActions = (place.validation_status === 'pending' || place.validation_status === 'synchronized') && currentStep === totalSteps;

  const CurrentStepComponent = stepComponents[currentStep - 1];

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
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))} 
                  disabled={currentStep === totalSteps}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="min-h-[400px]">
            <CurrentStepComponent place={place} />
          </div>

          {canShowActions && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Actions de validation</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Validation */}
                <div className="space-y-4">
                  <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-success-foreground mb-2">Valider le lieu</h4>
                    <p className="text-sm text-success-foreground/80">
                      Ce lieu sera publié et visible par tous les utilisateurs.
                    </p>
                  </div>
                  <Button 
                    onClick={handleValidate} 
                    disabled={loading}
                    className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Validation...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Valider le lieu
                      </>
                    )}
                  </Button>
                </div>

                {/* Rejet */}
                <div className="space-y-4">
                  <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-destructive-foreground mb-2">Rejeter le lieu</h4>
                    <p className="text-sm text-destructive-foreground/80">
                      Cette action est permanente et ne peut pas être annulée.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="reason">Raison du rejet *</Label>
                      <Select value={reason} onValueChange={setReason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une raison" />
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
                      <Label htmlFor="comment">Commentaire (optionnel)</Label>
                      <Textarea
                        id="comment"
                        placeholder="Commentaire supplémentaire..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleReject} 
                    disabled={loading || !reason}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Rejet...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Rejeter le lieu
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}