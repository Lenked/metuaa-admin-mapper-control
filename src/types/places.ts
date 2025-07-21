export interface Place {
  id: number;
  type: string;
  source: string;
  source_id: string;
  name: string;
  layer: string;
  centroid_lat: number;
  centroid_lon: number;
  bounding_box_min_lat: number;
  bounding_box_max_lat: number;
  bounding_box_min_lon: number;
  bounding_box_max_lon: number;
  address_name: string;
  address_number: string;
  address_street: string;
  address_locality: string;
  address_country: string;
  address_country_gid: string;
  address_region: string;
  address_region_gid: string;
  address_county: string;
  address_county_gid: string;
  address_neighbourhood: string;
  address_plus_code: string;
  properties_attraction: number;
  properties_category: string;
  properties_subcategory: string;
  properties_wikidata: string;
  properties_wikipedia: string;
  properties_description: string;
  properties_image: string;
  status: 'pending' | 'synchronized' | 'rejected' | 'accepted';
  date_added: string;
  list_images: string;
  create_uid: Array<{
    id: number;
    name: string;
  }>;
  create_date: string;
  write_uid: Array<{
    id: number;
    name: string;
  }>;
  write_date: string;
}

export interface PlacesResponse {
  success: boolean;
  message: string;
  responseCode: number;
  object_name: string;
  user_id: number;
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    create: boolean;
  };
  model_id: number;
  data: Place[];
}

export interface PlaceFilter {
  status?: string;
  category?: string;
  locality?: string;
  search?: string;
}

export interface RejectReason {
  value: string;
  label: string;
}

export const REJECT_REASONS: RejectReason[] = [
  { value: 'duplicate', label: 'Doublon' },
  { value: 'missing_info', label: 'Information manquante' },
  { value: 'out_of_scope', label: 'Hors charte' },
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'wrong_location', label: 'Localisation erronée' }
];