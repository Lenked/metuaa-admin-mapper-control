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
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ValidateModal } from "./ValidateModal";
import { RejectModal } from "./RejectModal";
import { PlaceDetailModal } from "./PlaceDetailModal";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 20;

export function PendingPlacesList() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [modalType, setModalType] = useState<'validate' | 'reject' | 'detail' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const loadPendingPlaces = async (page = 1) => {
    try {
      setLoading(true);
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const response = await PlacesAPI.getPendingPois(skip, ITEMS_PER_PAGE);
      
      if (Array.isArray(response)) {
        setPlaces(response);
        // Si on reçoit moins que la limite, on est sur la dernière page
        setTotalPages(response.length < ITEMS_PER_PAGE ? page : page + 1);
      } else {
        setPlaces([]);
        setTotalPages(1);
      }
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les lieux en attente",
        variant: "destructive",
      });
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const startSyncAndPoll = async () => {
    try {
      setSyncStatus('running');
      // Lancer la synchronisation en arrière-plan
      await PlacesAPI.syncPoisFromOdoo();
      
      // Commencer le polling
      const pollInterval = setInterval(async () => {
        try {
          const status = await PlacesAPI.getSyncStatus();
          setSyncStatus(status.status);
          
          if (status.status === 'success') {
            clearInterval(pollInterval);
            toast({
              title: "Synchronisation terminée",
              description: "Les données ont été mises à jour avec succès",
            });
            // Recharger les données
            await loadPendingPlaces(currentPage);
          } else if (status.status === 'error') {
            clearInterval(pollInterval);
            toast({
              title: "Erreur de synchronisation",
              description: status.error_message || "Une erreur est survenue",
              variant: "destructive",
            });
          }
        } catch (error) {
          clearInterval(pollInterval);
          setSyncStatus('error');
          toast({
            title: "Erreur",
            description: "Impossible de vérifier le statut de synchronisation",
            variant: "destructive",
          });
        }
      }, 5000); // Polling toutes les 5 secondes

    } catch (error) {
      setSyncStatus('error');
      toast({
        title: "Erreur",
        description: "Impossible de lancer la synchronisation",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      // Charger les données immédiatement
      await loadPendingPlaces(1);
      // Lancer la synchronisation en arrière-plan
      await startSyncAndPoll();
    };
    
    initializePage();
  }, []);

  const openModal = (type: 'validate' | 'reject' | 'detail', place: Place) => {
    setSelectedPlace(place);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedPlace(null);
    setModalType(null);
  };

  const handleActionComplete = async () => {
    setIsRefreshing(true);
    try {
      await loadPendingPlaces(currentPage);
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        closeModal();
      }, 300);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      loadPendingPlaces(page);
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
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des lieux en attente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Status & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {places.length} lieu{places.length !== 1 ? 'x' : ''} en attente
          </p>
          {syncStatus === 'running' && (
            <div className="flex items-center gap-2 text-primary">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Synchronisation en cours...</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => loadPendingPlaces(currentPage)} 
            variant="outline" 
            size="sm"
            disabled={syncStatus === 'running'}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button 
            onClick={startSyncAndPoll} 
            variant="default" 
            size="sm"
            disabled={syncStatus === 'running'}
          >
            {syncStatus === 'running' ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Synchroniser
          </Button>
        </div>
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
                  <TableCell>{getStatusBadge(place.validation_status)}</TableCell>
                  <TableCell>
                    {new Date(place.date_added).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => !isRefreshing && openModal('detail', place)}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? <Loader className="w-4 h-4 mr-2" /> : null}
                      Voir détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {places.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun lieu en attente</h3>
              <p className="text-muted-foreground">
                Tous les lieux ont été traités ou aucune donnée n'est disponible
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

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
          onSuccess={handleActionComplete}
        />
      )}
    </div>
  );
}