# Jibli — App State Document
_Last updated: 2026-03-09_

---

## What Is Jibli?

A cross-border delivery marketplace for Tunisian expats.
Travelers going between **Tunisia ↔ another country** post trips.
People who need goods brought in/out send delivery requests to those travelers.
Money (reward in TND) is agreed upfront.

**Core rule enforced everywhere:** Every trip must involve Tunisia on one end (TN ↔ FR, TN ↔ DE, etc.). Tunisia ↔ Tunisia trips are invalid.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React Native + Expo (SDK 54) |
| Routing | expo-router v6 (file-based) |
| Backend | Firebase (Auth + Firestore + Storage) — `@react-native-firebase` v23 |
| UI | Ionicons, `@gorhom/bottom-sheet` v5, custom components |
| Animations | react-native-reanimated v4, react-native-gesture-handler v2 |
| Forms | react-hook-form + zod (installed but used minimally) |
| Location | expo-location + custom GPS → nearest-city detection |
| Pagination | Firestore cursor-based (`startAfter` + `limit(20)`) |
| Platform | Android primary (NDK 27 patches applied via `scripts/fix-ndk27.js`) |

---

## Navigation Structure

```
app/
├── _layout.tsx              Root: AuthGuard → redirects auth vs tabs
│
├── (auth)/
│   ├── _layout.tsx          Stack, no headers
│   ├── welcome.tsx          Onboarding / brand screen
│   ├── login.tsx            Email + password login
│   └── register.tsx         Registration (name, email, password)
│
├── (tabs)/
│   ├── _layout.tsx          Bottom tab bar + FAB for "Post Trip"
│   ├── index.tsx            Home feed (search + trip list)
│   ├── trips.tsx            My Trips (posted by me)
│   ├── post.tsx             Redirect → /trip/create
│   ├── messages.tsx         Conversation list
│   ├── profile.tsx          User profile hub
│   └── requests.tsx         Sent / Received requests (hidden tab)
│
├── trip/
│   ├── create.tsx           Post a new trip
│   └── [id].tsx             Trip detail + request button
│
├── request/
│   ├── create.tsx           Send a delivery request on a trip
│   └── [id].tsx             Request detail + accept/reject/chat
│
├── chat/
│   └── [id].tsx             Real-time 1:1 chat
│
├── notifications.tsx        Notification list
├── orders.tsx               My Orders (= sent requests, from profile)
└── profile/
    └── edit.tsx             Edit name + location
```

---

## Screens — Current State

### Home (`app/(tabs)/index.tsx`)
- **Working:** Trip feed, from/to location filter (LocationPicker modal), date filter (exact or range, custom calendar), pull-to-refresh, infinite scroll pagination
- **Known gap:** Search triggers on manual tap of search button only — no auto-search on filter change

### My Trips (`app/(tabs)/trips.tsx`)
- **Working:** Lists user's own trips, paginated, pull-to-refresh, create button

### Post a Trip (`app/trip/create.tsx`)
- **Working:** From/To location pickers (LocationPicker), date picker (DatePickerModal in single mode), capacity kg, notes, route validation (must involve TN), creates trip in Firestore
- **Fixed:** Date was a plain TextInput — now a calendar picker

### Trip Detail (`app/trip/[id].tsx`)
- **Working:** Shows traveler card, route, date, capacity, status. Owner can close trip. Others see "Request Item Delivery" button. Already-requested check.

### Create Request (`app/request/create.tsx`)
- **Working:** Item name, description, weight, reward. Sends request + creates notification for traveler.

### Request Detail (`app/request/[id].tsx`)
- **Working:** Shows status bar. Traveler can accept/reject (status = pending). Accept opens/creates conversation. Chat button appears when accepted.

### Requests Tab (`app/(tabs)/requests.tsx`)
- **Working:** Sent / Received tabs, pending badge count, paginated

### Messages (`app/(tabs)/messages.tsx`)
- **Working:** Conversation list with real-time Firestore subscription

### Chat (`app/chat/[id].tsx`)
- **Working:** Real-time messages, send input, auto-scroll

### Notifications (`app/notifications.tsx`)
- **Working:** Paginated list, mark-as-read on tap, navigate to related item

### Orders (`app/orders.tsx`)
- **Working:** Same as sent requests, paginated — accessible from Profile

### Profile (`app/(tabs)/profile.tsx`)
- **Working:** Name, location, rating, delivery count, links to Trips / Requests / Orders, logout

### Edit Profile (`app/profile/edit.tsx`)
- **Working:** Update name and location

---

## Components

| Component | Purpose | Notes |
|---|---|---|
| `TripCard` | Trip preview card | Shows traveler avatar, flags, route, date, capacity |
| `LocationField` | Tappable location input | Calls `onPress` → parent opens picker |
| `LocationPicker` | BottomSheet + searchable city list | Uses `BottomSheetFlatList` to avoid scroll stutter |
| `DatePickerModal` | Custom calendar modal | `mode="single"` or `mode="range"`, past days dimmed |

---

## Firestore — Collections & Functions

### `trips`
```
{ travelerId, travelerName, travelerAvatar, travelerRating,
  from: TripLocation, to: TripLocation,
  date: "YYYY-MM-DD", capacityKg, notes,
  status: "open"|"closed", createdAt }
```
Functions: `getTrips(filters?, cursor?)`, `getTripById`, `getTripsByUser`, `createTrip`, `closeTrip`
Filters: all applied **server-side** via Firestore `where` clauses:

- `from`/`to` → `where('fromCity', '==', ...)` / `where('toCity', '==', ...)` (exact match on denormalized lowercase fields)
- `dateFrom`/`dateTo` → `where('date', '>=', ...)` / `where('date', '<=', ...)` with `orderBy('date', 'asc')`
- No filters → `orderBy('createdAt', 'desc')`
- `fromCity` and `toCity` are stored at write time in `createTrip`

### `requests`
```
{ tripId, travelerId, requesterId, requesterName, requesterAvatar,
  itemName, description, weightKg, reward, photoUrl?,
  status: pending|accepted|rejected|bought|delivered|completed,
  createdAt }
```
Functions: `createRequest`, `getRequestById`, `hasExistingRequest`, `getSentRequests`, `getReceivedRequests`, `updateRequestStatus`

### `users`
```
{ name, email, location, avatarUrl, rating, deliveryCount, createdAt }
```
Functions: `getUserProfile`, `updateUserProfile`, `uploadAvatar`

### `conversations`
```
{ tripId, requestId, participants: [uid1, uid2],
  lastMessage, lastMessageAt, participantNames }
```
Functions: `getOrCreateConversation`, `getConversations`, `sendMessage`, `subscribeToMessages`, `subscribeToConversations`

### `notifications` (subcollection under `users/{uid}/notifications`)
```
{ type: new_request|request_accepted|new_message|delivery_confirmed,
  title, body, relatedId, read, createdAt }
```
Functions: `getNotifications`, `markAsRead`, `createNotification`, `subscribeToNotifications`

### Firestore Indexes (deployed)
- `trips`: status ASC + createdAt DESC
- `trips`: travelerId ASC + createdAt DESC
- `requests`: tripId ASC + createdAt DESC
- `requests`: requesterId ASC + createdAt DESC
- `requests`: travelerId ASC + createdAt DESC
- `requests`: tripId ASC + requesterId ASC
- `conversations`: participants ARRAY_CONTAINS + lastMessageAt DESC

---

## Data Layer — Locations

`data/locations.ts` — ~180 predefined cities across zones:
- **tunisia** — 40+ cities (Tunis, Sfax, Sousse, Bizerte, etc.)
- **europe** — France, Germany, Belgium, Italy, Switzerland, UK, Spain, Netherlands, Turkey
- **north_america** — Canada, USA
- **gulf** — UAE, Saudi Arabia, Qatar
- **north_africa** — Libya, Algeria, Morocco

Each entry: `{ id, city, region?, country, country_code, zone, latitude, longitude }`

LocationPicker groups by zone, shows user's nearest city first, recent selections at top, deduplicates with `shownIds` Set.

---

## Business Logic Rules

1. **Route must involve Tunisia:** `fromCode === 'TN' || toCode === 'TN'`
2. **Cross-border only:** `fromCode !== toCode`
3. Both rules enforced at:
   - **Creation** (Alert in `create.tsx`)
   - **Feed** (`isValidRoute` filter in `getTrips`)

---

## Android Build — NDK 27 Patch

NDK 27 (LLVM 18) broke C++ ABI linkage for all Expo native modules.
**Fix:** Added `c++_shared` to `target_link_libraries` in each module's `CMakeLists.txt`:
- `react-native-screens`
- `expo-modules-core`
- `react-native-gesture-handler`
- `react-native-reanimated`
- `react-native-safe-area-context`

**Persistence:** `scripts/fix-ndk27.js` re-applies patches on every `npm install` via `"postinstall"` in `package.json`.

---

## Known Issues / Gaps

| Area | Issue |
|---|---|
| Home search | Date filter is client-side only — with large datasets, pages could be filtered to 0 results while more data exists |
| Pagination | `hasMore` is based on `docs.length === PAGE_SIZE` — if filtered results are fewer, pagination stops correctly but may miss edge cases |
| Notifications | No push notifications (only in-app) — Firebase Cloud Messaging not integrated |
| Images | `createRequest` has photo upload field in type but UI may not expose it on all screens |
| Ratings | `travelerRating` defaults to 0 on create — no rating flow exists yet |
| Status flow | `bought` and `delivered` statuses exist in types but no UI action triggers them |
| `post.tsx` | Just a redirect — could be removed if FAB in tab layout directly calls router.push |
| Edit profile | Location field is a plain TextInput, not using LocationPicker |

---

## Suggested Next Steps

### Bugs to Fix
- [ ] Search auto-triggers on filter clear (currently requires tapping search button)
- [ ] Edit profile location field should use LocationPicker
- [ ] `post.tsx` redirect tab causes a flash — replace FAB with direct push

### Design Improvements
- [ ] TripCard could show a cleaner route display (city → city with flags)
- [ ] Request status bar in detail screen needs color-coded steps
- [ ] Empty states could be more visual (illustrations)
- [ ] Profile screen avatar upload is wired but needs a tap-to-change UX

### Missing Features
- [ ] Push notifications (FCM)
- [ ] Rating system (after delivery completed)
- [ ] `bought` / `delivered` status update actions (traveler marks item as bought, then delivered)
- [ ] Photo upload in create request UI
- [ ] Trip detail shows list of incoming requests (for traveler)
- [ ] Traveler earnings summary on profile
- [ ] Deep linking for notification taps (already partially handled by routing in notifications.tsx)
