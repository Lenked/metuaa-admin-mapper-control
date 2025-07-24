import { PlacesResponse, PlaceFilter } from '@/types/places';

// Nouvelle configuration pour l'API locale
const API_BASE_URL = 'http://127.0.0.1:8002'; // À modifier facilement plus tard
const API_KEY_SESSION = 'b8a7c8e9f0d1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-api-key': API_KEY_SESSION
});

export class PlacesAPI {
  // Appels au backend local
  static async getPendingPois(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pois/pending`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching pending pois:', error);
      throw error;
    }
  }

  static async getApprovedPois(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pois/approved`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching approved pois:', error);
      throw error;
    }
  }

  static async getRejectedPois(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pois/rejected`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching rejected pois:', error);
      throw error;
    }
  }

  static async syncPoisFromOdoo(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pois/sync-from-odoo`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error syncing pois from odoo:', error);
      throw error;
    }
  }

  // Recherche côté frontend uniquement (pas d'appel API)
  static searchPlaces(places: any[], filters: { validation_status?: string; category?: string; locality?: string; search?: string }): any[] {
    return places.filter(place => {
      let match = true;
      if (filters.validation_status) match = match && place.validation_status === filters.validation_status;
      if (filters.category) match = match && place.properties_category === filters.category;
      if (filters.locality) match = match && place.address_locality === filters.locality;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        match = match && (
          (place.name && place.name.toLowerCase().includes(searchLower)) ||
          (place.properties_description && place.properties_description.toLowerCase().includes(searchLower))
        );
      }
      return match;
    });
  }

  // À implémenter plus tard
  static async validatePlace(id: number): Promise<any> {
    // À faire plus tard
  }

  // Approuver un POI
  static async approvePlace(poi_id: number, validated_by: number, ip_address?: string): Promise<any> {
    try {
      const body: any = { validated_by };
      if (ip_address) body.ip_address = ip_address;
      const response = await fetch(`${API_BASE_URL}/api/validation/pois/${poi_id}/approve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error approving POI:', error);
      throw error;
    }
  }

  // Rejeter un POI
  static async rejectPlace(poi_id: number, rejection_reason: string, validated_by: number, ip_address?: string): Promise<any> {
    try {
      const body: any = { rejection_reason, validated_by };
      if (ip_address) body.ip_address = ip_address;
      const response = await fetch(`${API_BASE_URL}/api/validation/pois/${poi_id}/reject`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error rejecting POI:', error);
      throw error;
    }
  }

  // Récupérer l'historique des validations/rejets
  static async getValidationHistory(skip = 0, limit = 100): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/validation/validation-history?skip=${skip}&limit=${limit}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching validation history:', error);
      throw error;
    }
  }
}