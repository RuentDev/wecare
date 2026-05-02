export interface ClinicLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  image_url: string | null;
  google_maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
}
