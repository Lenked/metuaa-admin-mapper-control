import { useState } from "react";
import { Place } from "@/types/places";
import { PlacesAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ValidateModalProps {
  place: Place;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ValidateModal({ place, open, onClose, onSuccess }: ValidateModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleValidate = async () => {
    try {
      setLoading(true);
      await PlacesAPI.validatePlace(place.id);
      
      toast({
        title: "Lieu validé",
        description: `${place.name} a été validé avec succès`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider le lieu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-success" />
            Valider le lieu
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de valider ce lieu. Cette action ne peut pas être annulée.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold">{place.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {place.properties_category && (
                    <span className="capitalize">{place.properties_category}</span>
                  )}
                  {place.properties_category && place.address_locality && ' • '}
                  {place.address_locality}
                </p>
                <p className="text-sm text-muted-foreground">
                  {place.address_name}
                </p>
                {place.properties_description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {place.properties_description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-success border border-success/20 p-4 rounded-lg">
            <p className="text-sm text-success-foreground">
              <strong>Confirmer la validation :</strong> Ce lieu sera publié et visible par tous les utilisateurs de l'application.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button 
            onClick={handleValidate} 
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
                Valider le lieu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}