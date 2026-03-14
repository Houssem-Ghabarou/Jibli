# Jibli — App State Document
_Last updated: 2026-03-13_

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
| Backend | Firebase (Auth + Firestore) — `@react-native-firebase` v23 |
| Image Storage | Cloudinary (avatars, chat images, request photos) — replaces Firebase Storage |
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
│   ├── _layout.tsx          Bottom tab bar + FAB (Post Trip / Post Request action sheet)
│   ├── index.tsx            Home feed — Trips | Requests toggle
│   ├── trips.tsx            My Trips (posted by me)
│   ├── post.tsx             Redirect (FAB uses action sheet now)
│   ├── messages.tsx         Conversation list
│   ├── profile.tsx          User profile hub
│   └── requests.tsx         Sent / Received / My Posts tabs
│
├── trip/
│   ├── create.tsx           Post a new trip
│   └── [id].tsx             Trip detail + request button + traveler profile link
│
├── request/
│   ├── create.tsx           Send a delivery request on a trip
│   └── [id].tsx             Request detail + accept/reject/chat + other party profile link
│
├── open-request/
│   ├── create.tsx           Post an open request (item, from/to, weight, reward)
│   └── [id].tsx             Open request detail — traveler offers / requester reviews offers
│
├── chat/
│   └── [id].tsx             Real-time 1:1 chat with image sending
│
├── user/
│   └── [id].tsx             Public user profile viewer (any user)
│
├── notifications.tsx        Notification list
├── orders.tsx               My Orders (= sent requests, from profile)
└── profile/
    └── edit.tsx             Edit name, location, bio, phone + avatar upload
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
- **Working:** Shows traveler card (tappable → `/user/{travelerId}`), route, date, capacity, status. Owner can close trip. Others see "Request Item Delivery" button. Already-requested check.
- **Added:** Traveler name/avatar is tappable; navigates to public profile

### Create Request (`app/request/create.tsx`)
- **Working:** Item name, description, weight, reward. Sends request + creates notification for traveler.

### Request Detail (`app/request/[id].tsx`)
- **Working:** Shows status bar. Traveler can accept/reject (status = pending). Accept opens/creates conversation. Chat button appears when accepted.
- **Added:** Context-aware other-party display:

  - Traveler sees: requester name, avatar, phone (phone only after accepted)
  - Requester sees: traveler name, avatar, phone (phone only after accepted)
  - Both are tappable → `/user/{uid}`

### Requests Tab (`app/(tabs)/requests.tsx`)
- **Working:** Sent / Received tabs (My Posts removed), pending badge count
- **Sent tab:** Direct trip requests sent + offers made on others' open requests + feed posts I created (open request posts with offer count + "Review offers" button)
- **Received tab:** Requests on my trips + my feed posts that have received offers (open request cards with offer count + "Review offers" button)
- **Status labels:** Pending / Accepted / Completed / Rejected — `bought` maps to Accepted, `delivered` maps to Completed, open request `open` maps to Pending, `taken` maps to Accepted

### Messages (`app/(tabs)/messages.tsx`)
- **Working:** Conversation list with real-time Firestore subscription, unread counts

### Chat (`app/chat/[id].tsx`)
- **Working:** Real-time messages, send text input, auto-scroll
- **Added:** Image messages — camera or gallery, upload to Cloudinary, fullscreen viewer, preview bar before send

  - Validation: JPEG/PNG/WebP/HEIC/HEIF only, max 5 MB
  - Display: optimized via Cloudinary transforms (600px wide, 80% quality)
  - `lastMessage` shows "📷 Photo" for image-only messages
  - Header shows other user's name/avatar — tappable → `/user/{uid}`

### Public User Profile (`app/user/[id].tsx`) — **NEW**

- **Working:** View any user's public profile

  - Avatar (96×96), name, location, bio
  - Phone number shown only to other users AND only after a request is accepted
  - Phone tap opens device dialer via `Linking.openURL`
  - Accessible from: chat header, trip detail (traveler), request detail (other party)

### Notifications (`app/notifications.tsx`)
- **Working:** Paginated list, mark-as-read on tap, navigate to related item

### Orders (`app/orders.tsx`)
- **Working:** Same as sent requests, paginated — accessible from Profile

### Profile (`app/(tabs)/profile.tsx`)
- **Working:** Name, location, rating, delivery count, links to Trips / Requests / Orders, logout
- **Added:** Avatar displayed with Cloudinary-hosted image + tap-to-change UX on edit screen

### Edit Profile (`app/profile/edit.tsx`)
- **Working:** Update name, location (plain TextInput), bio, phone
- **Added:** Avatar upload — tap avatar → image picker (gallery, 1:1 crop, 0.8 quality) → Cloudinary `avatars/` folder → URL saved to Firestore

---

## Components

| Component | Purpose | Notes |
|---|---|---|
| `TripCard` | Trip preview card | Shows traveler avatar, flags, route, date, capacity |
| `LocationField` | Tappable location input | Calls `onPress` → parent opens picker |
| `LocationPicker` | BottomSheet + searchable city list | Uses `BottomSheetFlatList` to avoid scroll stutter |
| `DatePickerModal` | Custom calendar modal | `mode="single"` or `mode="range"`, past days dimmed |

---

## Image / Media — Cloudinary

All media is stored on Cloudinary (not Firebase Storage).

**Helper:** `cloudinary/CloudinaryHelper.ts`

| Function | Purpose |
|---|---|
| `uploadFileToCloudinary(uri, folder?, filename?)` | Upload any file, auto-detects MIME type |
| `getOptimizedImageUrl(url, width?, height?, quality?)` | Transform URL for display (f_auto, q_auto) |
| `getPublicIdFromUrl(url)` | Extract public ID from Cloudinary URL |

**Upload folders:**

- `avatars/` — user avatars
- `chat/{conversationId}/` — chat image messages
- `request-photos/` — request item photos

---

## Firestore — Collections & Functions

### `trips`
```
{ travelerId, travelerName, travelerAvatar,   // travelerAvatar: Cloudinary URL | null
  travelerRating, tripCode,
  from: TripLocation, to: TripLocation,
  fromCity, toCity,                            // lowercase denormalized, for filtering
  date: "YYYY-MM-DD", capacityKg, notes,
  status: "open"|"closed", createdAt }
```
Functions: `getTrips(filters?, cursor?)`, `getTripById`, `getTripsByUser`, `createTrip`, `closeTrip`
Filters (server-side Firestore `where`):

- `from`/`to` → `where('fromCity', '==', ...)` / `where('toCity', '==', ...)`
- `dateFrom`/`dateTo` → `where('date', '>=', ...)` + `where('date', '<=', ...)` with `orderBy('date', 'asc')`
- No filters → `orderBy('createdAt', 'desc')`

### `requests`
```
{ tripId, travelerId, requesterId, requesterName, requesterAvatar,
  itemName, description, weightKg, reward, photoUrl?,
  status: pending|accepted|rejected|bought|delivered|completed,
  createdAt }
```
Functions: `createRequest`, `getRequestById`, `hasExistingRequest`, `getSentRequests`, `getReceivedRequests`, `updateRequestStatus`


### `open_requests` — **NEW**
```
{ requesterId, requesterName, requesterAvatar,
  itemName, description, weightKg, reward, photoUrl?,
  from: TripLocation, to: TripLocation,
  fromCity, toCity,                            // lowercase, for filtering
  status: "open"|"taken"|"cancelled",
  offerCount,
  createdAt }
```
Functions: `createOpenRequest`, `getOpenRequests(filters?, cursor?)`, `getOpenRequestById`, `getOpenRequestsByRequester`, `cancelOpenRequest`, `getMyOfferedOpenRequestIds`
Filters: `from`/`to` city name, status=open only in feed

### `offers` — **NEW**
```
{ openRequestId, travelerId, travelerName, travelerAvatar,
  status: "pending"|"accepted"|"rejected",
  createdAt }
```
Functions: `createOffer`, `getOffersByOpenRequest`, `hasExistingOffer`, `acceptOffer` (batch: accepts offer + marks request taken + rejects others + creates conversation + sends notification), `rejectOffer`

### `users`
```
{ name, email, location, avatarUrl,            // avatarUrl: Cloudinary URL | null
  phone?, bio?,
  rating, deliveryCount, createdAt }
```
Functions: `getUserProfile`, `updateUserProfile`, `uploadAvatar`

### `conversations`
```
{ tripId, requestId, participants: [uid1, uid2],
  participantNames: { [uid]: name },
  lastMessage, lastMessageAt,
  unreadCounts: { [uid]: number } }
```
Sub-collection `messages`:
```
{ senderId, text, imageUrl: string | null,      // Cloudinary URL
  createdAt }
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
4. **Phone visibility:** Phone numbers only shown between two parties after request is accepted (not in pending/rejected state)

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
| Pagination | `hasMore` is based on `docs.length === PAGE_SIZE` — edge cases possible |
| Notifications | No push notifications (only in-app) — Firebase Cloud Messaging not integrated |
| Ratings | `travelerRating` defaults to 0 on create — no rating flow exists yet |
| Status flow | `bought` and `delivered` statuses exist in types but no UI action triggers them |
| `post.tsx` | Just a redirect — could be removed if FAB in tab layout directly calls router.push |
| Edit profile | Location field is still a plain TextInput, not using LocationPicker |
| Cloudinary delete | `deleteFileFromCloudinary` is a placeholder — requires a backend/Cloud Function to execute |

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

### Missing Features
- [ ] Push notifications (FCM)
- [ ] Rating system (after delivery completed)
- [ ] `bought` / `delivered` status update actions (traveler marks item as bought, then delivered)
- [ ] Photo upload in create request UI (field exists in type, not yet exposed in UI)
- [ ] Trip detail shows list of incoming requests (for traveler view)
- [ ] Traveler earnings summary on profile
- [ ] Deep linking for notification taps (partially handled in notifications.tsx)
- [ ] Cloudinary image deletion (needs backend — Cloud Function or signed delete)
