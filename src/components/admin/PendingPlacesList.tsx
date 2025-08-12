import { useState, useEffect } from "react";
import { Place } from "@/types/places";
import { PlacesAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Loader,
  RefreshCw,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PlaceDetailModal } from "./PlaceDetailModal";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 20;

export function PendingPlacesList() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { toast } = useToast();

  const loadPendingPlaces = async (page = 1) => {
    try {
      setLoading(true);
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const response = await PlacesAPI.getPendingPois(skip, ITEMS_PER_PAGE);
      
      if (Array.isArray(response)) {
        setPlaces(response);
        // S'il y a autant d'éléments que la limite, il y a probablement une page suivante
        setHasNextPage(response.length === ITEMS_PER_PAGE);
      } else {
        setPlaces([]);
        setHasNextPage(false);
      }
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les lieux en attente.",
        variant: "destructive",
      });
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingPlaces(1);
  }, []);

  const openModal = (place: Place) => {
    setSelectedPlace(place);
  };

  const closeModal = () => {
    setSelectedPlace(null);
  };

  const handleActionComplete = async () => {
    await loadPendingPlaces(currentPage);
    closeModal();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0) {
      loadPendingPlaces(newPage);
    }
  };

  const getStatusBadge = (validation_status: string) => {
    switch (validation_status) {
      case 'pending':
      case 'synchronized':
        return <Badge variant="secondary">En attente</Badge>;
      case 'validated':
        return <Badge className="bg-success text-success-foreground">Validé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{validation_status}</Badge>;
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
      'office': 'Bureau',
      'art_school': 'École d\'art',
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
      <div className="flex items-center justify-end">
        <Button 
          onClick={() => loadPendingPlaces(currentPage)} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

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
                        onClick={() => openModal(place)}
                        className="font-medium hover:text-primary transition-colors text-left"
                      >
                        {place.name}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryLabel(place.properties_category)}</TableCell>
                  <TableCell>{place.address_locality}</TableCell>
                  <TableCell>{getStatusBadge(place.validation_status)}</TableCell>
                  <TableCell>
                    {new Date(place.date_added).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal(place)}
                    >
                      Voir détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {places.length === 0 && !loading && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun lieu en attente</h3>
              <p className="text-muted-foreground">
                Il n'y a actuellement aucun lieu en attente de validation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="px-4 py-2 text-sm">Page {currentPage}</span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext 
              href="#"
              onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
              className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {selectedPlace && (
        <PlaceDetailModal
          place={selectedPlace}
          open={true}
          onClose={closeModal}
          onSuccess={handleActionComplete}
        />
      )}
    </div>
  );
}
