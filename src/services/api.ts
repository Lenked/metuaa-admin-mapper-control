import { PlacesResponse, PlaceFilter } from '@/types/places';

// Nouvelle configuration pour l'API locale
const API_BASE_URL = 'http://127.0.0.1:8001'; // À modifier facilement plus tard
const API_KEY_SESSION = 'b8a7c8e9f0d1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-KEY': API_KEY_SESSION
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
  static searchPlaces(places: any[], filters: { status?: string; category?: string; locality?: string; search?: string }): any[] {
    return places.filter(place => {
      let match = true;
      if (filters.status) match = match && place.status === filters.status;
      if (filters.category) match = match && place.category === filters.category;
      if (filters.locality) match = match && place.locality === filters.locality;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        match = match && (
          (place.name && place.name.toLowerCase().includes(searchLower)) ||
          (place.description && place.description.toLowerCase().includes(searchLower))
        );
      }
      return match;
    });
  }

  // À implémenter plus tard
  static async validatePlace(id: number): Promise<any> {
    // À faire plus tard
  }

  static async rejectPlace(id: number, reason: string, comment?: string): Promise<any> {
    // À faire plus tard
  }
}