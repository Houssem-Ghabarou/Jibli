import { LOCATIONS, Location } from '@/data/locations';
import { haversine } from './haversine';

const MAX_DISTANCE_KM = 30;

export function getNearestCity(lat: number, lng: number): Location | null {
  let nearest: Location | null = null;
  let minDist = Infinity;

  for (const loc of LOCATIONS) {
    const dist = haversine(lat, lng, loc.lat, loc.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = loc;
    }
  }

  return minDist <= MAX_DISTANCE_KM ? nearest : null;
}
