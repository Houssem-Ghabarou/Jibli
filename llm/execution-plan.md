# Jibli MVP — Execution Plan

## Project Overview
Peer-to-peer crowdshipping marketplace. Travelers leaving Tunisia post trips; people abroad request Tunisian items to be brought.

## Tech Stack
| Layer | Technology |
|---|---|
| Mobile | Expo 54, React Native 0.81.5, Expo Router 6 |
| Auth | Firebase Auth (email/password) via @react-native-firebase |
| Database | Firestore via @react-native-firebase |
| Storage | Firebase Storage via @react-native-firebase |
| Realtime | Firestore onSnapshot listeners |
| Backend | Node.js/Express (JibliServer) — FCM push notifications only |

**Requires dev build** — not compatible with Expo Go.

## Firebase Data Model
```
users/{uid}
  name, email, avatarUrl, location, rating, deliveryCount, createdAt

trips/{tripId}
  travelerId, travelerName, travelerAvatar, travelerRating
  from, to, date, capacityKg, notes, status(open|closed), createdAt

requests/{requestId}
  tripId, travelerId, requesterId, requesterName, requesterAvatar
  itemName, description, weightKg, reward, photoUrl
  status(pending|accepted|rejected|bought|delivered|completed), createdAt

conversations/{conversationId}
  tripId, requestId, participants[uid1,uid2], lastMessage, lastMessageAt
  messages/{messageId}: senderId, text, imageUrl, createdAt

notifications/{uid}/items/{notificationId}
  type(new_request|request_accepted|new_message|delivery_confirmed)
  title, body, relatedId, read, createdAt
```

## Request Status Flow
pending → accepted → bought → delivered → completed
       ↓
    rejected

## App File Structure
```
app/
  _layout.tsx              — AuthProvider + AuthGuard + Stack
  (auth)/
    _layout.tsx
    welcome.tsx            — Landing page, create account / sign in
    login.tsx              — Email/password login
    register.tsx           — Name/email/password registration
  (tabs)/
    _layout.tsx            — 5 tabs: Home, Trips, FAB(post), Messages, Profile
    index.tsx              — Home: trip feed + search
    trips.tsx              — My Trips list
    post.tsx               — Redirects to /trip/create
    messages.tsx           — Conversations list
    profile.tsx            — Profile + action rows
    requests.tsx           — Sent / Received requests (hidden from tab bar)
  trip/
    [id].tsx               — Trip Details + Request CTA
    create.tsx             — Create Trip form
  request/
    [id].tsx               — Request Details + Accept/Reject + Chat
    create.tsx             — Create Request form
  chat/
    [id].tsx               — Realtime chat
  notifications.tsx        — Notifications list
  orders.tsx               — My sent requests/orders
  profile/
    edit.tsx               — Edit name + location

components/
  TripCard.tsx             — Trip feed card with traveler info, route, CTA

lib/
  firebase.ts              — Setup instructions (no code, auto-init)
  auth.ts                  — register, login, logout, subscribeToAuthState
  firestore/
    users.ts               — getUserProfile, updateUserProfile, uploadAvatar
    trips.ts               — getTrips, getTripById, getTripsByUser, createTrip, closeTrip
    requests.ts            — createRequest, getRequestById, getRequestsByTrip,
                             getSentRequests, getReceivedRequests, updateRequestStatus
    conversations.ts       — getOrCreateConversation, getConversations,
                             sendMessage, subscribeToMessages, subscribeToConversations
    notifications.ts       — getNotifications, markAsRead, createNotification,
                             subscribeToNotifications

context/
  AuthContext.tsx           — AuthProvider, useAuth() hook
```

## Build Phases

### Phase 1 — Foundation (DONE)
- [x] Firebase packages installed (@react-native-firebase/app, auth, firestore, storage)
- [x] lib/firebase.ts — setup docs
- [x] lib/auth.ts — register/login/logout/subscribeToAuthState
- [x] lib/firestore/* — all CRUD helpers
- [x] context/AuthContext.tsx — useAuth() hook
- [x] app/_layout.tsx — AuthProvider + AuthGuard

### Phase 2 — Auth Screens (DONE)
- [x] welcome.tsx — landing page
- [x] login.tsx — sign in form
- [x] register.tsx — registration form

### Phase 3 — Navigation + Home (DONE)
- [x] (tabs)/_layout.tsx — 5 tabs with center FAB
- [x] (tabs)/index.tsx — home feed with search
- [x] components/TripCard.tsx — trip card component

### Phase 4 — Trips (DONE)
- [x] (tabs)/trips.tsx — my trips
- [x] trip/[id].tsx — trip details
- [x] trip/create.tsx — create trip form

### Phase 5 — Requests (DONE)
- [x] (tabs)/requests.tsx — sent/received tabs
- [x] request/create.tsx — create request form
- [x] request/[id].tsx — details + accept/reject + open chat

### Phase 6 — Messaging (DONE)
- [x] (tabs)/messages.tsx — conversations list
- [x] chat/[id].tsx — realtime chat screen

### Phase 7 — Profile & Activity (DONE)
- [x] (tabs)/profile.tsx — profile + action rows
- [x] profile/edit.tsx — edit name/location
- [x] orders.tsx — my sent requests
- [x] notifications.tsx — notification list

## Firestore Security Rules (to apply in Firebase Console)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == uid;
    }
    match /trips/{tripId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.travelerId;
    }
    match /requests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.travelerId
                    || request.auth.uid == resource.data.requesterId;
    }
    match /conversations/{convId} {
      allow read, write: if request.auth.uid in resource.data.participants;
      match /messages/{msgId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/conversations/$(convId)).data.participants;
      }
    }
    match /notifications/{uid}/items/{itemId} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

## Design Tokens
- Accent: #E8402A (red-orange)
- Header dark: #1A1F3D (navy)
- Background: #FFFFFF
- Surface: #F8F8F8
- Border: #F0F0F0
- Success: #2ECC71
- Warning: #F39C12
- Star: #F4C542

## Windows Build Notes
- `newArchEnabled: false` in app.json (required for SDK 54 on Windows)
- In android/gradle.properties: `reactNativeArchitectures=arm64-v8a` (single arch avoids MAX_PATH issues)
- In android/gradle.properties: `android.buildCacheDir=C:/JibliCache`
- Run `npx expo prebuild --clean` after any native config changes
- Build: `npx expo run:android`
