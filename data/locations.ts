export type Zone = 'tunisia' | 'europe' | 'north_america' | 'gulf' | 'north_africa' | 'other';

export interface Location {
  id: string;
  city: string;
  region?: string; // Tunisian governorate
  country: string;
  country_code: string;
  zone: Zone;
  lat: number;
  lng: number;
}

export const LOCATIONS: Location[] = [
  // ─── TUNISIA ───────────────────────────────────────────────────────────────
  // Tunis
  { id: 'tunis_centre', city: 'Tunis Centre', region: 'Tunis Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.8065, lng: 10.1815 },
  { id: 'la_marsa', city: 'La Marsa', region: 'Tunis Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.8760, lng: 10.3246 },
  { id: 'le_bardo', city: 'Le Bardo', region: 'Tunis Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.8088, lng: 10.1456 },
  { id: 'carthage', city: 'Carthage', region: 'Tunis Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.8528, lng: 10.3233 },
  // Ariana
  { id: 'ariana', city: 'Ariana Ville', region: 'Ariana Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.8665, lng: 10.1647 },
  { id: 'raoued', city: 'Raoued', region: 'Ariana Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.8944, lng: 10.2267 },
  { id: 'soukra', city: 'Soukra', region: 'Ariana Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.8731, lng: 10.2042 },
  { id: 'mnihla', city: 'Mnihla', region: 'Ariana Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.8500, lng: 10.1833 },
  // Ben Arous
  { id: 'ben_arous', city: 'Ben Arous', region: 'Ben Arous Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.7531, lng: 10.2186 },
  { id: 'hammam_lif', city: 'Hammam Lif', region: 'Ben Arous Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.7272, lng: 10.3350 },
  { id: 'ezzahra', city: 'Ezzahra', region: 'Ben Arous Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.7467, lng: 10.2706 },
  { id: 'mourouj', city: 'Mourouj', region: 'Ben Arous Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.7231, lng: 10.1883 },
  { id: 'megrine', city: 'Mégrine', region: 'Ben Arous Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.7617, lng: 10.2219 },
  // Manouba
  { id: 'manouba', city: 'Manouba', region: 'Manouba Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.8100, lng: 10.0969 },
  { id: 'den_den', city: 'Den Den', region: 'Manouba Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.8231, lng: 10.1264 },
  { id: 'douar_hicher', city: 'Douar Hicher', region: 'Manouba Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.8319, lng: 10.0786 },
  { id: 'oued_ellil', city: 'Oued Ellil', region: 'Manouba Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.8383, lng: 10.0508 },
  // Nabeul
  { id: 'nabeul', city: 'Nabeul', region: 'Nabeul Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.4511, lng: 10.7356 },
  { id: 'hammamet', city: 'Hammamet', region: 'Nabeul Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.3997, lng: 10.6122 },
  { id: 'kelibia', city: 'Kelibia', region: 'Nabeul Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.8467, lng: 11.0994 },
  // Zaghouan
  { id: 'zaghouan', city: 'Zaghouan', region: 'Zaghouan Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.4028, lng: 10.1428 },
  // Bizerte
  { id: 'bizerte', city: 'Bizerte', region: 'Bizerte Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 37.2744, lng: 9.8739 },
  { id: 'menzel_bourguiba', city: 'Menzel Bourguiba', region: 'Bizerte Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 37.1542, lng: 9.7886 },
  // Béja
  { id: 'beja', city: 'Béja', region: 'Béja Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.7256, lng: 9.1817 },
  // Jendouba
  { id: 'jendouba', city: 'Jendouba', region: 'Jendouba Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.5011, lng: 8.7803 },
  { id: 'tabarka', city: 'Tabarka', region: 'Jendouba Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.9547, lng: 8.7581 },
  // Le Kef
  { id: 'le_kef', city: 'Le Kef', region: 'Le Kef Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.1822, lng: 8.7147 },
  // Siliana
  { id: 'siliana', city: 'Siliana', region: 'Siliana Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 36.0844, lng: 9.3706 },
  // Sousse
  { id: 'sousse', city: 'Sousse', region: 'Sousse Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 35.8245, lng: 10.6346 },
  { id: 'msaken', city: 'Msaken', region: 'Sousse Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 35.7306, lng: 10.5833 },
  { id: 'hammam_sousse', city: 'Hammam Sousse', region: 'Sousse Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 35.8611, lng: 10.5942 },
  // Monastir
  { id: 'monastir', city: 'Monastir', region: 'Monastir Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 35.7643, lng: 10.8113 },
  { id: 'moknine', city: 'Moknine', region: 'Monastir Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 35.6386, lng: 10.9036 },
  { id: 'ksar_hellal', city: 'Ksar Hellal', region: 'Monastir Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 35.6431, lng: 10.8906 },
  // Mahdia
  { id: 'mahdia', city: 'Mahdia', region: 'Mahdia Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 35.5047, lng: 11.0622 },
  { id: 'el_jem', city: 'El Jem', region: 'Mahdia Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 35.2964, lng: 10.7136 },
  // Sfax
  { id: 'sfax', city: 'Sfax', region: 'Sfax Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 34.7406, lng: 10.7603 },
  { id: 'sakiet_ezzit', city: 'Sakiet Ezzit', region: 'Sfax Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 34.7833, lng: 10.7667 },
  // Kairouan
  { id: 'kairouan', city: 'Kairouan', region: 'Kairouan Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 35.6781, lng: 10.0964 },
  // Kasserine
  { id: 'kasserine', city: 'Kasserine', region: 'Kasserine Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 35.1722, lng: 8.8306 },
  { id: 'sbeitla', city: 'Sbeïtla', region: 'Kasserine Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 35.2367, lng: 9.1228 },
  // Sidi Bouzid
  { id: 'sidi_bouzid', city: 'Sidi Bouzid', region: 'Sidi Bouzid Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 35.0381, lng: 9.4858 },
  // Gabès
  { id: 'gabes', city: 'Gabès', region: 'Gabès Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 33.8881, lng: 10.0975 },
  { id: 'el_hamma', city: 'El Hamma', region: 'Gabès Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 33.8889, lng: 9.7964 },
  // Médenine
  { id: 'medenine', city: 'Médenine', region: 'Médenine Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 33.3547, lng: 10.5053 },
  { id: 'djerba', city: 'Djerba Houmt Souk', region: 'Médenine Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 33.8753, lng: 10.8572 },
  { id: 'zarzis', city: 'Zarzis', region: 'Médenine Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 33.5036, lng: 11.1122 },
  // Tataouine
  { id: 'tataouine', city: 'Tataouine', region: 'Tataouine Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 32.9211, lng: 10.4517 },
  // Tozeur
  { id: 'tozeur', city: 'Tozeur', region: 'Tozeur Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 33.9197, lng: 8.1336 },
  // Gafsa
  { id: 'gafsa', city: 'Gafsa', region: 'Gafsa Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 34.4250, lng: 8.7842 },
  // Kébili
  { id: 'kebili', city: 'Kébili', region: 'Kébili Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 33.7042, lng: 8.9650 },
  { id: 'douz', city: 'Douz', region: 'Kébili Governorate', country: 'Tunisia', country_code: 'TN', zone: 'tunisia', lat: 33.4578, lng: 9.0228 },

  // ─── FRANCE ────────────────────────────────────────────────────────────────
  { id: 'paris', city: 'Paris', country: 'France', country_code: 'FR', zone: 'europe', lat: 48.8566, lng: 2.3522 },
  { id: 'lyon', city: 'Lyon', country: 'France', country_code: 'FR', zone: 'europe', lat: 45.7640, lng: 4.8357 },
  { id: 'marseille', city: 'Marseille', country: 'France', country_code: 'FR', zone: 'europe', lat: 43.2965, lng: 5.3698 },
  { id: 'toulouse', city: 'Toulouse', country: 'France', country_code: 'FR', zone: 'europe', lat: 43.6047, lng: 1.4442 },
  { id: 'nice', city: 'Nice', country: 'France', country_code: 'FR', zone: 'europe', lat: 43.7102, lng: 7.2620 },
  { id: 'strasbourg', city: 'Strasbourg', country: 'France', country_code: 'FR', zone: 'europe', lat: 48.5734, lng: 7.7521 },
  { id: 'bordeaux', city: 'Bordeaux', country: 'France', country_code: 'FR', zone: 'europe', lat: 44.8378, lng: -0.5792 },
  { id: 'nantes', city: 'Nantes', country: 'France', country_code: 'FR', zone: 'europe', lat: 47.2184, lng: -1.5536 },
  { id: 'lille', city: 'Lille', country: 'France', country_code: 'FR', zone: 'europe', lat: 50.6292, lng: 3.0573 },
  { id: 'montpellier', city: 'Montpellier', country: 'France', country_code: 'FR', zone: 'europe', lat: 43.6108, lng: 3.8767 },
  { id: 'grenoble', city: 'Grenoble', country: 'France', country_code: 'FR', zone: 'europe', lat: 45.1885, lng: 5.7245 },
  { id: 'rennes', city: 'Rennes', country: 'France', country_code: 'FR', zone: 'europe', lat: 48.1173, lng: -1.6778 },

  // ─── GERMANY ───────────────────────────────────────────────────────────────
  { id: 'berlin', city: 'Berlin', country: 'Germany', country_code: 'DE', zone: 'europe', lat: 52.5200, lng: 13.4050 },
  { id: 'munich', city: 'Munich', country: 'Germany', country_code: 'DE', zone: 'europe', lat: 48.1351, lng: 11.5820 },
  { id: 'frankfurt', city: 'Frankfurt', country: 'Germany', country_code: 'DE', zone: 'europe', lat: 50.1109, lng: 8.6821 },
  { id: 'hamburg', city: 'Hamburg', country: 'Germany', country_code: 'DE', zone: 'europe', lat: 53.5511, lng: 9.9937 },
  { id: 'cologne', city: 'Cologne', country: 'Germany', country_code: 'DE', zone: 'europe', lat: 50.9333, lng: 6.9500 },
  { id: 'stuttgart', city: 'Stuttgart', country: 'Germany', country_code: 'DE', zone: 'europe', lat: 48.7758, lng: 9.1829 },
  { id: 'dusseldorf', city: 'Düsseldorf', country: 'Germany', country_code: 'DE', zone: 'europe', lat: 51.2217, lng: 6.7762 },

  // ─── CANADA ────────────────────────────────────────────────────────────────
  { id: 'montreal', city: 'Montreal', country: 'Canada', country_code: 'CA', zone: 'north_america', lat: 45.5017, lng: -73.5673 },
  { id: 'toronto', city: 'Toronto', country: 'Canada', country_code: 'CA', zone: 'north_america', lat: 43.6532, lng: -79.3832 },
  { id: 'ottawa', city: 'Ottawa', country: 'Canada', country_code: 'CA', zone: 'north_america', lat: 45.4215, lng: -75.6972 },
  { id: 'quebec_city', city: 'Quebec City', country: 'Canada', country_code: 'CA', zone: 'north_america', lat: 46.8139, lng: -71.2080 },

  // ─── BELGIUM ───────────────────────────────────────────────────────────────
  { id: 'brussels', city: 'Brussels', country: 'Belgium', country_code: 'BE', zone: 'europe', lat: 50.8503, lng: 4.3517 },
  { id: 'antwerp', city: 'Antwerp', country: 'Belgium', country_code: 'BE', zone: 'europe', lat: 51.2194, lng: 4.4025 },
  { id: 'liege', city: 'Liège', country: 'Belgium', country_code: 'BE', zone: 'europe', lat: 50.6292, lng: 5.5797 },

  // ─── ITALY ─────────────────────────────────────────────────────────────────
  { id: 'rome', city: 'Rome', country: 'Italy', country_code: 'IT', zone: 'europe', lat: 41.9028, lng: 12.4964 },
  { id: 'milan', city: 'Milan', country: 'Italy', country_code: 'IT', zone: 'europe', lat: 45.4642, lng: 9.1900 },
  { id: 'naples', city: 'Naples', country: 'Italy', country_code: 'IT', zone: 'europe', lat: 40.8518, lng: 14.2681 },
  { id: 'turin', city: 'Turin', country: 'Italy', country_code: 'IT', zone: 'europe', lat: 45.0703, lng: 7.6869 },

  // ─── SWITZERLAND ───────────────────────────────────────────────────────────
  { id: 'geneva', city: 'Geneva', country: 'Switzerland', country_code: 'CH', zone: 'europe', lat: 46.2044, lng: 6.1432 },
  { id: 'zurich', city: 'Zurich', country: 'Switzerland', country_code: 'CH', zone: 'europe', lat: 47.3769, lng: 8.5417 },
  { id: 'lausanne', city: 'Lausanne', country: 'Switzerland', country_code: 'CH', zone: 'europe', lat: 46.5197, lng: 6.6323 },

  // ─── UAE ───────────────────────────────────────────────────────────────────
  { id: 'dubai', city: 'Dubai', country: 'UAE', country_code: 'AE', zone: 'gulf', lat: 25.2048, lng: 55.2708 },
  { id: 'abu_dhabi', city: 'Abu Dhabi', country: 'UAE', country_code: 'AE', zone: 'gulf', lat: 24.4539, lng: 54.3773 },
  { id: 'sharjah', city: 'Sharjah', country: 'UAE', country_code: 'AE', zone: 'gulf', lat: 25.3463, lng: 55.4209 },

  // ─── SAUDI ARABIA ──────────────────────────────────────────────────────────
  { id: 'riyadh', city: 'Riyadh', country: 'Saudi Arabia', country_code: 'SA', zone: 'gulf', lat: 24.7136, lng: 46.6753 },
  { id: 'jeddah', city: 'Jeddah', country: 'Saudi Arabia', country_code: 'SA', zone: 'gulf', lat: 21.4858, lng: 39.1925 },
  { id: 'dammam', city: 'Dammam', country: 'Saudi Arabia', country_code: 'SA', zone: 'gulf', lat: 26.4207, lng: 50.0888 },

  // ─── QATAR ─────────────────────────────────────────────────────────────────
  { id: 'doha', city: 'Doha', country: 'Qatar', country_code: 'QA', zone: 'gulf', lat: 25.2854, lng: 51.5310 },

  // ─── TURKEY ────────────────────────────────────────────────────────────────
  { id: 'istanbul', city: 'Istanbul', country: 'Turkey', country_code: 'TR', zone: 'europe', lat: 41.0082, lng: 28.9784 },
  { id: 'ankara', city: 'Ankara', country: 'Turkey', country_code: 'TR', zone: 'europe', lat: 39.9334, lng: 32.8597 },
  { id: 'izmir', city: 'Izmir', country: 'Turkey', country_code: 'TR', zone: 'europe', lat: 38.4189, lng: 27.1287 },

  // ─── UK ────────────────────────────────────────────────────────────────────
  { id: 'london', city: 'London', country: 'UK', country_code: 'GB', zone: 'europe', lat: 51.5074, lng: -0.1278 },
  { id: 'manchester', city: 'Manchester', country: 'UK', country_code: 'GB', zone: 'europe', lat: 53.4808, lng: -2.2426 },
  { id: 'birmingham', city: 'Birmingham', country: 'UK', country_code: 'GB', zone: 'europe', lat: 52.4862, lng: -1.8904 },
  { id: 'edinburgh', city: 'Edinburgh', country: 'UK', country_code: 'GB', zone: 'europe', lat: 55.9533, lng: -3.1883 },

  // ─── USA ───────────────────────────────────────────────────────────────────
  { id: 'new_york', city: 'New York', country: 'USA', country_code: 'US', zone: 'north_america', lat: 40.7128, lng: -74.0060 },
  { id: 'washington_dc', city: 'Washington DC', country: 'USA', country_code: 'US', zone: 'north_america', lat: 38.9072, lng: -77.0369 },
  { id: 'los_angeles', city: 'Los Angeles', country: 'USA', country_code: 'US', zone: 'north_america', lat: 34.0522, lng: -118.2437 },
  { id: 'chicago', city: 'Chicago', country: 'USA', country_code: 'US', zone: 'north_america', lat: 41.8781, lng: -87.6298 },
  { id: 'houston', city: 'Houston', country: 'USA', country_code: 'US', zone: 'north_america', lat: 29.7604, lng: -95.3698 },

  // ─── NETHERLANDS ───────────────────────────────────────────────────────────
  { id: 'amsterdam', city: 'Amsterdam', country: 'Netherlands', country_code: 'NL', zone: 'europe', lat: 52.3676, lng: 4.9041 },
  { id: 'rotterdam', city: 'Rotterdam', country: 'Netherlands', country_code: 'NL', zone: 'europe', lat: 51.9244, lng: 4.4777 },
  { id: 'the_hague', city: 'The Hague', country: 'Netherlands', country_code: 'NL', zone: 'europe', lat: 52.0705, lng: 4.3007 },

  // ─── SPAIN ─────────────────────────────────────────────────────────────────
  { id: 'madrid', city: 'Madrid', country: 'Spain', country_code: 'ES', zone: 'europe', lat: 40.4168, lng: -3.7038 },
  { id: 'barcelona', city: 'Barcelona', country: 'Spain', country_code: 'ES', zone: 'europe', lat: 41.3851, lng: 2.1734 },
  { id: 'valencia', city: 'Valencia', country: 'Spain', country_code: 'ES', zone: 'europe', lat: 39.4699, lng: -0.3763 },

  // ─── NORTH AFRICA ──────────────────────────────────────────────────────────
  { id: 'tripoli', city: 'Tripoli', country: 'Libya', country_code: 'LY', zone: 'north_africa', lat: 32.9024, lng: 13.1806 },
  { id: 'misrata', city: 'Misrata', country: 'Libya', country_code: 'LY', zone: 'north_africa', lat: 32.3754, lng: 15.0925 },
  { id: 'benghazi', city: 'Benghazi', country: 'Libya', country_code: 'LY', zone: 'north_africa', lat: 32.1194, lng: 20.0867 },
  { id: 'algiers', city: 'Algiers', country: 'Algeria', country_code: 'DZ', zone: 'north_africa', lat: 36.7538, lng: 3.0588 },
  { id: 'oran', city: 'Oran', country: 'Algeria', country_code: 'DZ', zone: 'north_africa', lat: 35.6969, lng: -0.6331 },
  { id: 'constantine', city: 'Constantine', country: 'Algeria', country_code: 'DZ', zone: 'north_africa', lat: 36.3650, lng: 6.6147 },
  { id: 'casablanca', city: 'Casablanca', country: 'Morocco', country_code: 'MA', zone: 'north_africa', lat: 33.5731, lng: -7.5898 },
  { id: 'rabat', city: 'Rabat', country: 'Morocco', country_code: 'MA', zone: 'north_africa', lat: 34.0132, lng: -6.8326 },
  { id: 'marrakech', city: 'Marrakech', country: 'Morocco', country_code: 'MA', zone: 'north_africa', lat: 31.6295, lng: -7.9811 },
];

// Country flag emoji by country_code
export const COUNTRY_FLAGS: Record<string, string> = {
  TN: '🇹🇳', FR: '🇫🇷', DE: '🇩🇪', CA: '🇨🇦', BE: '🇧🇪',
  IT: '🇮🇹', CH: '🇨🇭', AE: '🇦🇪', SA: '🇸🇦', QA: '🇶🇦',
  TR: '🇹🇷', GB: '🇬🇧', US: '🇺🇸', NL: '🇳🇱', ES: '🇪🇸',
  LY: '🇱🇾', DZ: '🇩🇿', MA: '🇲🇦',
};

export function getFlag(country_code: string): string {
  return COUNTRY_FLAGS[country_code] ?? '🌍';
}
