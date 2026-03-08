# Jibli — Location System Plan (Revised)

## Why the First Plan Needed Rethinking

The original plan assumed travel only goes Tunisia → Abroad. In reality, it goes both ways:

- Tunisia → Abroad (traveler leaving Tunisia)
- Abroad → Tunisia (traveler returning to Tunisia)

This means "From" is not always Tunisia and "To" is not always international. A trip is simply a route from one city to another, in any direction.

---

## The 4 Real Use Cases

| # | User | Direction | Example |
|---|------|-----------|---------|
| 1 | Traveler | Tunisia → Abroad | Karim in Ariana flies to Paris, has 5kg free |
| 2 | Traveler | Abroad → Tunisia | Sophie in Lyon flies back to Tunis for vacation |
| 3 | Requester | Wants item FROM Tunisia | Amira in Paris wants Makroudh sent to her |
| 4 | Requester | Wants item TO Tunisia | Mohamed in Tunis wants a perfume from Paris |

The system must handle all four without forcing a fixed direction.

---

## The Pattern: One Unified Location System

### Core Principle

Every location in Jibli — whether Tunisian or international — lives in one single list, structured the same way. There is no separate "Tunisian list" and "international list." There is just a **locations list**, and every entry follows the same format.

### Location Structure

```
Country → City → Area (optional)
```

Every location has:

```json
{
  "id": "paris",
  "city": "Paris",
  "country": "France",
  "country_code": "FR",
  "zone": "europe",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

```json
{
  "id": "ariana",
  "city": "Ariana",
  "country": "Tunisia",
  "country_code": "TN",
  "region": "Ariana Governorate",
  "zone": "tunisia",
  "latitude": 36.8665,
  "longitude": 10.1647
}
```

The `zone` field allows the app to group and sort intelligently:
- `"tunisia"` — all Tunisian locations
- `"europe"` — France, Germany, Belgium, etc.
- `"north_america"` — Canada, USA
- `"gulf"` — UAE, Saudi, Qatar
- `"north_africa"` — Algeria, Libya, Morocco

---

## The Full Location Database

### Tunisia (~100 locations)

| Governorate | Cities |
|-------------|--------|
| Tunis | Tunis Centre, La Marsa, Le Bardo, Carthage |
| Ariana | Ariana Ville, Raoued, Soukra, Mnihla |
| Ben Arous | Ben Arous, Hammam Lif, Ezzahra, Mourouj, Mégrine |
| Manouba | Manouba, Den Den, Douar Hicher, Oued Ellil |
| Nabeul | Nabeul, Hammamet, Kelibia, Dar Chaâbane |
| Zaghouan | Zaghouan, El Fahs |
| Bizerte | Bizerte, Menzel Bourguiba, Ras Jebel |
| Béja | Béja, Nefza, Medjez el-Bab |
| Jendouba | Jendouba, Tabarka, Aïn Draham |
| Le Kef | Le Kef, Dahmani |
| Siliana | Siliana, Maktar |
| Sousse | Sousse, Msaken, Kalâa Kebira, Hammam Sousse |
| Monastir | Monastir, Moknine, Ksar Hellal, Sahline |
| Mahdia | Mahdia, Ksour Essef, El Jem |
| Sfax | Sfax, Sakiet Ezzit, Sakiet Eddaïer |
| Kairouan | Kairouan, Haffouz |
| Kasserine | Kasserine, Sbeïtla |
| Sidi Bouzid | Sidi Bouzid, Regueb |
| Gabès | Gabès, Mareth, El Hamma |
| Médenine | Médenine, Djerba Houmt Souk, Djerba Midoun, Zarzis |
| Tataouine | Tataouine, Ghomrassen |
| Tozeur | Tozeur, Nefta |
| Gafsa | Gafsa, Métlaoui |
| Kébili | Kébili, Douz |

### International (~100 locations)

| Country | Cities |
|---------|--------|
| France | Paris, Lyon, Marseille, Toulouse, Nice, Strasbourg, Bordeaux, Nantes, Lille, Montpellier, Grenoble, Rennes |
| Germany | Berlin, Munich, Frankfurt, Hamburg, Cologne, Stuttgart, Düsseldorf |
| Canada | Montreal, Toronto, Ottawa, Quebec City |
| Belgium | Brussels, Antwerp, Liège, Charleroi |
| Italy | Rome, Milan, Naples, Turin, Bologna |
| Switzerland | Geneva, Zurich, Lausanne, Bern |
| UAE | Dubai, Abu Dhabi, Sharjah |
| Saudi Arabia | Riyadh, Jeddah, Dammam |
| Qatar | Doha |
| Turkey | Istanbul, Ankara, Izmir |
| UK | London, Manchester, Birmingham, Edinburgh |
| USA | New York, Washington DC, Los Angeles, Chicago, Houston |
| Netherlands | Amsterdam, Rotterdam, The Hague |
| Spain | Madrid, Barcelona, Valencia |
| Libya | Tripoli, Misrata, Benghazi |
| Algeria | Algiers, Oran, Constantine |
| Morocco | Casablanca, Rabat, Marrakech |

### "Other" Fallback

If a city is not in the list, the user can select **"Other"** and manually enter:
- City name (required)
- Country (required, from a country dropdown)

This handles edge cases without bloating the predefined lists.

---

## GPS Auto-Detection

### How It Works

1. App requests location permission on first launch
2. Gets device coordinates
3. Matches against the location database (nearest city within 30km)
4. Stores the detected city as the user's **current location**

### What It Does

The detected location is used to **pre-fill the "From" field** when the user is creating a trip or searching. It's a convenience feature, not a requirement.

| User is in... | Auto-fill behavior |
|---------------|-------------------|
| Ariana, Tunisia | "From" → Ariana |
| Paris, France | "From" → Paris |
| Unknown/no match | "From" → empty, user picks manually |

### Implementation

- Use `expo-location` for GPS
- Match coordinates against the location database using haversine distance
- Pick the closest city within 30km radius
- If no match, leave empty
- Cache the result for the session (don't re-detect every screen)

### Fallback

If the user denies location permission, nothing is pre-filled. The app works exactly the same — they just pick manually.

---

## The Location Picker Component

### One Component, Two Modes

The same `LocationPicker` component is used everywhere. It receives a prop that determines what data to show:

| Mode | What it shows | When used |
|------|--------------|-----------|
| `"all"` | Tunisia + International, grouped | Default for both From and To |
| `"tunisia"` | Only Tunisian cities | Optional filter if needed |
| `"international"` | Only international cities | Optional filter if needed |

By default, both "From" and "To" open the same full picker. The user can pick any city in either direction. This removes the artificial Tunisia/International split.

### Smart Sorting

The picker sorts results based on context:

**When the user is in Tunisia:**
- Tunisian cities appear first (sorted by proximity to GPS)
- International cities appear below (sorted by popularity)

**When the user is abroad:**
- Their current country's cities appear first
- Tunisian cities appear next
- Other international cities appear last

**When searching:**
- Results are filtered by text match, regardless of grouping

### Picker Layout

```
┌──────────────────────────────────┐
│  ← Select city                   │
│                                   │
│  🔍 Search city or country...    │
│                                   │
│  📍 NEAR YOU                     │
│  ┌──────────────────────────────┐│
│  │ 📍 Ariana                    ││
│  └──────────────────────────────┘│
│                                   │
│  🕐 RECENT                       │
│  ┌──────────────────────────────┐│
│  │ Paris                        ││
│  │ Sousse                       ││
│  └──────────────────────────────┘│
│                                   │
│  🇹🇳 TUNISIA                     │
│  ┌──────────────────────────────┐│
│  │ Tunis Governorate            ││
│  │   Tunis Centre               ││
│  │   La Marsa                   ││
│  │   Le Bardo                   ││
│  │ Ariana Governorate           ││
│  │   Ariana Ville               ││
│  │   Raoued                     ││
│  │   Soukra                     ││
│  │ ...                          ││
│  └──────────────────────────────┘│
│                                   │
│  🇫🇷 FRANCE                      │
│  ┌──────────────────────────────┐│
│  │ Paris                        ││
│  │ Lyon                         ││
│  │ Marseille                    ││
│  │ ...                          ││
│  └──────────────────────────────┘│
│                                   │
│  🇩🇪 GERMANY                     │
│  ┌──────────────────────────────┐│
│  │ Berlin                       ││
│  │ Munich                       ││
│  │ ...                          ││
│  └──────────────────────────────┘│
│                                   │
│  ✏️ OTHER                        │
│  ┌──────────────────────────────┐│
│  │ Enter a custom city...       ││
│  └──────────────────────────────┘│
│                                   │
└──────────────────────────────────┘
```

---

## The Precision Problem: Area / Neighborhood

Selecting "Paris" is not enough for actual delivery. The traveler might be in Villepinte while the requester is in the 13th arrondissement. Meeting up becomes difficult.

### Solution: Optional Area Field

After selecting a city, the user can **optionally** add a more specific area.

This appears as a **simple text input** below the selected city:

```
┌─────────────────────────────────┐
│  Destination                     │
│  ┌─────────────────────────────┐│
│  │ 🇫🇷 Paris               ✕  ││
│  └─────────────────────────────┘│
│                                  │
│  Area / neighborhood (optional)  │
│  ┌─────────────────────────────┐│
│  │ Villepinte (93)             ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

### Why Free Text for Area?

- Neighborhoods are too numerous to predefine for every city worldwide
- People describe areas differently ("13ème", "near Gare du Nord", "Créteil")
- It's optional — if they skip it, the city is enough for initial matching
- The exact meeting point is finalized in the chat anyway

### How It Shows on Trip Cards

```
┌─────────────────────────────────┐
│  👤 Karim ★ 4.8                 │
│                                  │
│  Ariana → Paris                  │
│           Villepinte area        │
│                                  │
│  📅 June 10    📦 5kg free      │
│                                  │
│  [View trip]                     │
└─────────────────────────────────┘
```

The area is shown as a subtitle under the city name — visible but secondary.

---

## Where This Applies

### 1. Home Screen — Search

| Field | Required? | Behavior |
|-------|-----------|----------|
| From | Optional | Opens location picker (all cities). If empty, shows all departures. |
| To | Optional | Opens location picker (all cities). If empty, shows all destinations. |
| Date | Optional | Date picker. If empty, shows all upcoming trips. |

**Key change:** Both From and To are optional. The user can search with just one. This covers all scenarios:

| Search | What it means |
|--------|---------------|
| From: empty, To: Paris | "Show me all trips arriving in Paris" |
| From: Tunis, To: empty | "Show me all trips leaving from Tunis" |
| From: Tunis, To: Paris | "Show me trips from Tunis to Paris" |
| From: Paris, To: Tunis | "Show me trips from Paris to Tunis" |
| All empty | "Show me all available trips" (default home feed) |

### 2. Create Trip Screen

| Field | Required? | Behavior |
|-------|-----------|----------|
| From | Yes | Location picker, auto-filled with GPS location |
| From area | No | Free text: neighborhood / zone in departure city |
| To | Yes | Location picker |
| To area | No | Free text: neighborhood / zone in destination city |
| Travel date | Yes | Date picker, must be today or future |
| Luggage capacity | Yes | Numeric input in kg |
| Note | No | Free text for additional info |

### 3. Trip Card Display

```
[Traveler avatar] [Traveler name] ★ [Rating]

[From city] → [To city]
[From area]    [To area]        ← shown only if provided

📅 [Date]    📦 [X]kg free

[View trip]
```

### 4. Trip Details Screen

Full display:

```
ROUTE
──────────────────
From:  Ariana, Tunisia
       Near Carrefour Ariana (pickup zone)

To:    Paris, France
       Villepinte (93)

DATE
──────────────────
June 10, 2026

LUGGAGE
──────────────────
5kg available

NOTE
──────────────────
Flying Tunisair, can take food items.
Will be in Villepinte for 2 weeks.
```

---

## Matching Logic

### How Search Results Work

When a user searches, the app filters trips using flexible matching:

**City-level match:**
- Exact city match is prioritized
- If the selected city is a governorate capital (e.g., "Tunis"), also show trips from other cities in that governorate

**Country-level fallback:**
- If the user selects a country but no specific city, show all trips to/from that country

**Area is NOT used for matching:**
- Area is display-only information
- It helps users decide which trip to pick, but the search doesn't filter by it

### Matching Examples

| Search: From | Search: To | Results include |
|-------------|-----------|----------------|
| Ariana | Paris | Trips from Ariana to Paris |
| Tunis (governorate) | Paris | Trips from Tunis, La Marsa, Bardo, Ariana* to Paris |
| — | Paris | All trips going to Paris |
| Sousse | — | All trips leaving from Sousse |
| Paris | Tunis | Trips from Paris to Tunis (reverse direction) |
| Paris | Sousse | Trips from Paris to Sousse |

*Governorate-level expansion only applies to Tunisia, where users may think of "Tunis" as the whole greater Tunis area.

---

## Data Model

### Location Object (Stored in Static Data)

```json
{
  "id": "ariana",
  "city": "Ariana",
  "region": "Ariana Governorate",
  "country": "Tunisia",
  "country_code": "TN",
  "zone": "tunisia",
  "lat": 36.8665,
  "lng": 10.1647
}
```

### Trip Object (Stored in Database)

```json
{
  "id": "trip_001",
  "traveler_id": "user_123",
  "from": {
    "city_id": "ariana",
    "city_name": "Ariana",
    "country": "Tunisia",
    "country_code": "TN",
    "area": "Near Carrefour Ariana"
  },
  "to": {
    "city_id": "paris",
    "city_name": "Paris",
    "country": "France",
    "country_code": "FR",
    "area": "Villepinte (93)"
  },
  "travel_date": "2026-06-10",
  "luggage_capacity_kg": 5,
  "note": "Flying Tunisair, can take food items"
}
```

### User Location (Cached on Device)

```json
{
  "detected_city_id": "ariana",
  "detected_city_name": "Ariana",
  "detected_country": "Tunisia",
  "timestamp": "2026-03-09T10:00:00Z"
}
```

---

## Scenario Walkthrough (All 4 Use Cases)

### Use Case 1: Karim posts a trip (Tunisia → Paris)

1. Opens Create Trip
2. GPS detects Ariana → "From" auto-fills with "Ariana"
3. He adds area: "Near Carrefour Ariana" (where he can pick up items)
4. Taps "To" → picker opens → he types "Par" → selects "Paris"
5. Adds area: "Villepinte (93)"
6. Picks date: June 10
7. Sets capacity: 5kg
8. Adds note: "Flying Tunisair, can take food"
9. Submits → trip is live

### Use Case 2: Sophie posts a trip (Lyon → Tunis)

1. Opens Create Trip
2. GPS detects Lyon → "From" auto-fills with "Lyon"
3. She skips area (not needed for departure)
4. Taps "To" → picker opens → Tunisia is highlighted → selects "Tunis Centre"
5. Adds area: "Centre ville" (where her family lives and she can deliver)
6. Picks date: July 5
7. Sets capacity: 3kg
8. Submits → trip is live

### Use Case 3: Amira searches for a traveler coming to Paris (wants Makroudh)

1. Opens Home Screen
2. GPS detects Paris → search "To" is contextually suggested
3. She leaves "From" empty (doesn't care where in Tunisia they leave from)
4. Sets "To" to Paris
5. Taps search
6. Sees results: Karim's trip "Ariana → Paris (Villepinte)" June 10
7. Villepinte works for her → she taps "View trip" → sends request

### Use Case 4: Mohamed in Tunis wants perfume from Paris

1. Opens Home Screen
2. GPS detects Tunis
3. He sets "From" to Paris (he wants someone coming FROM Paris)
4. Sets "To" to Tunis (he wants it delivered TO Tunis)
5. Taps search
6. Sees: Sophie's trip "Lyon → Tunis" July 5
7. Lyon is close enough — or he filters specifically for Paris departures
8. Sends request: "Dior Sauvage perfume, 200ml, reward 30 TND"

---

## Technical Summary

### Files to Create

```
src/
  data/
    locations.js              # Single unified list (Tunisia + international)
  components/
    LocationPicker.jsx        # Bottom sheet with search, groups, recent, "Other"
    LocationField.jsx         # Tappable display field that opens picker
    AreaInput.jsx             # Optional free text input for neighborhood
  utils/
    locationDetection.js      # GPS → nearest city matching
    locationSearch.js         # Filter/search logic
    locationMatching.js       # Flexible matching for search results
  hooks/
    useUserLocation.js        # GPS detection hook with caching
```

### Libraries

| Purpose | Library |
|---------|---------|
| GPS | `expo-location` |
| Bottom sheet | `@gorhom/bottom-sheet` |
| Recent picks cache | `AsyncStorage` |
| Distance calculation | Haversine formula (custom, ~10 lines) |

### Key Decisions Summary

| Decision | Choice | Why |
|----------|--------|-----|
| One list vs two | One unified list | Bidirectional travel, simpler code |
| Direction | Not fixed | From and To can be any city |
| Area precision | Optional free text | Too many neighborhoods to predefine |
| Search fields | All optional | Maximum flexibility for browsing |
| Matching | City + governorate expansion | Prevents empty results |
| Area in search | Not used for filtering | Used for display only, coordination happens in chat |
| GPS | Pre-fill convenience | Not required, works without permission |
| "Other" cities | Free text fallback | Handles rare destinations |

---

## Development Order

1. Build the unified `locations.js` data file
2. Build `LocationPicker` component (bottom sheet, search, groups, recent, "Other")
3. Build `useUserLocation` hook (GPS + nearest city)
4. Build `LocationField` component (tappable field + area input)
5. Integrate into Create Trip screen
6. Integrate into Home Screen search
7. Build `locationMatching.js` for flexible search filtering
8. Test all 4 use cases end to end
