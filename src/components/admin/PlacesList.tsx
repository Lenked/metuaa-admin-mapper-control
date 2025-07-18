import { useState, useEffect } from "react";
import { Place, PlaceFilter } from "@/types/places";
import { PlacesAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, MapPin, Filter, Search } from "lucide-react";
import { ValidateModal } from "./ValidateModal";
import { RejectModal } from "./RejectModal";
import { PlaceDetailModal } from "./PlaceDetailModal";
import { useToast } from "@/hooks/use-toast";

export function PlacesList() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PlaceFilter>({});
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [modalType, setModalType] = useState<'validate' | 'reject' | 'detail' | null>(null);
  const { toast } = useToast();

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const response = await PlacesAPI.searchPlaces(filters);
      setPlaces(response.data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les lieux",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, [filters]);

  const handleFilterChange = (key: keyof PlaceFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const openModal = (type: 'validate' | 'reject' | 'detail', place: Place) => {
    setSelectedPlace(place);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedPlace(null);
    setModalType(null);
  };

  const handleActionComplete = () => {
    closeModal();
    loadPlaces(); // Refresh the list
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'synchronized':
        return <Badge className="bg-success text-success-foreground">Validé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'university': 'Université',
      'school': 'École',
      'restaurant': 'Restaurant',
      'hospital': 'Hôpital',
      'hotel': 'Hôtel',
      'park': 'Parc',
      'museum': 'Musée',
      'shopping': 'Commerce',
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des lieux...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres de recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un lieu..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="synchronized">Validé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
                <SelectItem value="university">Université</SelectItem>
                <SelectItem value="school">École</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="hospital">Hôpital</SelectItem>
                <SelectItem value="hotel">Hôtel</SelectItem>
                <SelectItem value="park">Parc</SelectItem>
                <SelectItem value="museum">Musée</SelectItem>
                <SelectItem value="shopping">Commerce</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Localité"
              value={filters.locality || ''}
              onChange={(e) => handleFilterChange('locality', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {places.length} lieu{places.length !== 1 ? 'x' : ''} trouvé{places.length !== 1 ? 's' : ''}
        </p>
        <Button onClick={loadPlaces} variant="outline" size="sm">
          Actualiser
        </Button>
      </div>

      {/* Places table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Localité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'ajout</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {places.map((place) => (
                <TableRow key={place.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <button
                        onClick={() => openModal('detail', place)}
                        className="font-medium hover:text-primary transition-colors text-left"
                      >
                        {place.name}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryLabel(place.properties_category)}</TableCell>
                  <TableCell>{place.address_locality}</TableCell>
                  <TableCell>{getStatusBadge(place.status)}</TableCell>
                  <TableCell>
                    {new Date(place.date_added).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {place.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => openModal('validate', place)}
                            className="bg-success hover:bg-success/90 text-success-foreground"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openModal('reject', place)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Rejeter
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openModal('detail', place)}
                      >
                        Détails
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {places.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun lieu trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedPlace && modalType === 'validate' && (
        <ValidateModal
          place={selectedPlace}
          open={true}
          onClose={closeModal}
          onSuccess={handleActionComplete}
        />
      )}
      
      {selectedPlace && modalType === 'reject' && (
        <RejectModal
          place={selectedPlace}
          open={true}
          onClose={closeModal}
          onSuccess={handleActionComplete}
        />
      )}
      
      {selectedPlace && modalType === 'detail' && (
        <PlaceDetailModal
          place={selectedPlace}
          open={true}
          onClose={closeModal}
        />
      )}
    </div>
  );
}