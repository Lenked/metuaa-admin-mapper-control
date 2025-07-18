import { useState } from "react";
import { Place, REJECT_REASONS } from "@/types/places";
import { PlacesAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RejectModalProps {
  place: Place;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RejectModal({ place, open, onClose, onSuccess }: RejectModalProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const handleReject = async () => {
    if (!reason) {
      toast({
        title: "Raison requise",
        description: "Veuillez sélectionner une raison de rejet",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await PlacesAPI.rejectPlace(place.id, reason, comment);
      
      toast({
        title: "Lieu rejeté",
        description: `${place.name} a été rejeté`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le lieu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setComment("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="w-5 h-5 text-destructive" />
            Rejeter le lieu
          </DialogTitle>
          <DialogDescription>
            Indiquez la raison du rejet de ce lieu. L'utilisateur sera notifié.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Place info */}
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
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">
                Cette action rejetera définitivement le lieu. L'utilisateur sera notifié de ce rejet.
              </p>
            </div>
          </div>

          {/* Reason selection */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Raison du rejet <span className="text-destructive">*</span>
            </Label>
            <Select onValueChange={setReason} value={reason}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une raison" />
              </SelectTrigger>
              <SelectContent>
                {REJECT_REASONS.map((reasonOption) => (
                  <SelectItem key={reasonOption.value} value={reasonOption.value}>
                    {reasonOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Optional comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Commentaire additionnel (optionnel)
            </Label>
            <Textarea
              id="comment"
              placeholder="Ajoutez des détails sur la raison du rejet..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button 
            variant="destructive"
            onClick={handleReject} 
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
                Rejeter le lieu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}