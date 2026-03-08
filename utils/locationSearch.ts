import { LOCATIONS, Location } from '@/data/locations';

export function searchLocations(query: string): Location[] {
  const q = query.trim().toLowerCase();
  if (!q) return LOCATIONS;

  return LOCATIONS.filter(
    loc =>
      loc.city.toLowerCase().includes(q) ||
      loc.country.toLowerCase().includes(q) ||
      (loc.region?.toLowerCase().includes(q) ?? false)
  );
}
