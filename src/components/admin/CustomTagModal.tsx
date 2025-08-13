// src/components/admin/CustomTagModal.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomTagModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (customTag: string) => void;
  isLoading: boolean;
}

export function CustomTagModal({ open, onClose, onSubmit, isLoading }: CustomTagModalProps) {
  const [tag, setTag] = useState('');

  const handleSubmit = () => {
    if (tag.trim()) {
      onSubmit(tag.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tag personnalisé requis</DialogTitle>
          <DialogDescription>
            Ce PlusCode existe déjà avec le tag par défaut. Veuillez fournir un tag unique pour continuer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="custom-tag" className="text-right">
              Tag
            </Label>
            <Input
              id="custom-tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="col-span-3"
              placeholder="Ex: bureau-principal, point-relais-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!tag.trim() || isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer et Valider'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
