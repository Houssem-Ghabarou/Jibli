import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoLocation from 'expo-location';
import { Location } from '@/data/locations';
import { getNearestCity } from '@/utils/locationDetection';

const CACHE_KEY = 'jibli_user_location';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedLocation {
  location: Location;
  timestamp: number;
}

export function useUserLocation(): { city: Location | null; loading: boolean } {
  const [city, setCity] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      try {
        // Check cache
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached: CachedLocation = JSON.parse(raw);
          if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
            if (!cancelled) setCity(cached.location);
            return;
          }
        }

        // Request permission
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const pos = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced });
        const nearest = getNearestCity(pos.coords.latitude, pos.coords.longitude);

        if (nearest) {
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ location: nearest, timestamp: Date.now() }));
          if (!cancelled) setCity(nearest);
        }
      } catch {
        // GPS unavailable — silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    detect();
    return () => { cancelled = true; };
  }, []);

  return { city, loading };
}
