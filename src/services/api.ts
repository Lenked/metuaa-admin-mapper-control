import { PlacesResponse, PlaceFilter } from '@/types/places';

const API_BASE_URL = 'https://dev.metuaa.com/api';
const API_KEY = 'EKJ0BDHKQ2MGNV3S26GVFMV3ZXSN1DMK';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluQG1ldHVhYS5vcmciLCJ1aWQiOjJ9.IVq2qul-eEnyvdhaFndrLK5WDZ0A0-uOKTJ7QV8mhWw';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'api-key': API_KEY,
  'token': TOKEN
});

export class PlacesAPI {
  static async getPendingPlaces(): Promise<PlacesResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/places/search`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter for pending places only
      const filteredData = {
        ...data,
        data: data.data?.filter((place: any) => place.status === 'pending') || []
      };
      
      return filteredData;
    } catch (error) {
      console.error('Error fetching pending places:', error);
      throw error;
    }
  }

  static async searchPlaces(filters: PlaceFilter): Promise<PlacesResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.locality) queryParams.append('locality', filters.locality);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`${API_BASE_URL}/places/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  static async validatePlace(id: number): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/validate/${id}`, {
        method: 'POST',
        headers: getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error validating place:', error);
      throw error;
    }
  }

  static async rejectPlace(id: number, reason: string, comment?: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reject/${id}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          reason,
          comment
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error rejecting place:', error);
      throw error;
    }
  }
}