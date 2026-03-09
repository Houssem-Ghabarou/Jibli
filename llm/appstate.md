# Jibli — App State (as of March 2026)

## Legend
- ✅ Done & working
- ⚠️ Partially done / needs improvement
- ❌ Missing / not built

---

## Auth Flow

| Screen / Feature | Status | Notes |
|---|---|---|
| Welcome screen | ✅ | Logo, tagline, Create Account + Login buttons |
| Register screen | ✅ | Name, email, password, confirm — show/hide toggle added |
| Login screen | ✅ | Email, password — show/hide toggle added |
| Auth guard (redirect logic) | ✅ | Redirects unauthenticated users to welcome |
| Firebase Auth (email/password) | ✅ | register/login/logout all working |
| Forgot password | ❌ | Not built — low priority for MVP |

---

## Navigation

| Feature | Status | Notes |
|---|---|---|
| Bottom tab bar (5 tabs) | ✅ | Home, Trips, Requests, Messages, Profile |
| Requests tab visible | ✅ | Fixed — was hidden, now shows with bag icon |
| Tab badges (unread messages) | ✅ | Red badge on Messages tab |
| Tab badges (pending requests) | ✅ | Red badge on Received tab inside Requests |
| "Post Trip" FAB | ⚠️ | Removed from tab bar — accessible via Trips tab header add button only |

---

## Home Screen

| Feature | Status | Notes |
|---|---|---|
| Dark header with greeting | ✅ | "Hello, [Name] 👋" |
| Notification bell with badge | ✅ | Taps to /notifications |
| From/To location filter (tappable) | ✅ | Opens LocationPicker |
| Date range filter | ✅ | Date chip with clear button |
| Search button | ✅ | Triggers Firestore query |
| Trip feed (FlatList) | ✅ | Paginated, pull-to-refresh |
| Trip cards in feed | ✅ | See TripCard below |
| Empty state | ✅ | Airplane icon + "No trips found" |
| "Already requested" badge on cards | ✅ | Green checkmark badge |

---

## Trip Card Component

| Feature | Status | Notes |
|---|---|---|
| Traveler avatar (initial letter) | ✅ | |
| Traveler name + star rating | ✅ | |
| Open/Closed status badge | ✅ | |
| Route (🇹🇳 Ariana → 🇫🇷 Paris) | ✅ | Country flags from data/locations |
| Area text (optional) | ✅ | |
| Date + capacity row | ✅ | |
| "View Trip Details" CTA button | ✅ | |
| "Already Requested" badge | ✅ | |
| Real photo avatar | ❌ | Shows initial letter only — no image |

---

## Trip Details Screen

| Feature | Status | Notes |
|---|---|---|
| Dark header with route (flags) | ✅ | |
| Traveler info card | ✅ | Avatar, name, rating, open/closed badge |
| Traveler delivery count | ⚠️ | Not shown — profile has it but not passed to trip |
| Route grid (from/to with sub-area) | ✅ | |
| Date + capacity grid | ✅ | |
| Trip notes | ✅ | Shown only if present |
| "Request Item Delivery" CTA | ✅ | Disabled if already requested |
| "Close Trip" for owner | ✅ | |
| List of current requests on trip | ❌ | Not shown — would require extra fetch |

---

## Create Trip Screen

| Feature | Status | Notes |
|---|---|---|
| Back arrow + title | ✅ | |
| From field (LocationPicker) | ✅ | Auto-fills with GPS city |
| From area (optional text input) | ✅ | |
| To field (LocationPicker) | ✅ | |
| To area (optional text input) | ✅ | |
| Travel date (DatePickerModal) | ✅ | |
| Capacity (kg) input | ✅ | |
| Notes (multiline) | ✅ | |
| Post Trip button | ✅ | |
| Trip guidelines box | ✅ | "Only carry legal items" etc. |
| Validation (Tunisia must be involved) | ✅ | |

---

## Location Picker Component

| Feature | Status | Notes |
|---|---|---|
| Full-height bottom sheet | ✅ | Uses @gorhom/bottom-sheet |
| Search bar (filter as you type) | ✅ | |
| "Near you" GPS section | ✅ | Uses expo-location |
| Recent selections | ✅ | Stored in AsyncStorage |
| Tunisia cities grouped by governorate | ✅ | From data/locations |
| International countries with flags | ✅ | France, Germany, Belgium, Canada, Italy… |
| "Enter custom city" option | ✅ | |
| Selecting closes picker + fills field | ✅ | |

---

## Requests Screen (Tab)

| Feature | Status | Notes |
|---|---|---|
| Sent / Received sub-tabs | ✅ | |
| Pending badge on Received tab | ✅ | |
| Sent request cards (item, status, weight, reward) | ✅ | With color-coded status badge + meta chips |
| Received request cards (avatar, name, item, weight, reward) | ✅ | |
| Inline Accept / Decline on received cards | ✅ | Accept → green, Decline → gray |
| Accept creates conversation + notification | ✅ | |
| Pagination | ✅ | |
| Empty state with helpful text | ✅ | |
| Traveler name on sent cards | ⚠️ | Not shown — only item name, not "via [traveler]" |

---

## Create Request Screen

| Feature | Status | Notes |
|---|---|---|
| Back arrow + title | ✅ | |
| Trip reference card at top | ⚠️ | Only shows traveler name, no route/date |
| Item name input | ✅ | |
| Description (multiline) | ✅ | |
| Weight (kg) | ✅ | |
| Reward input | ✅ | Fixed to TND — no currency selector |
| Photo upload (optional) | ⚠️ | Supported in backend (Firebase Storage), no UI picker shown |
| Prohibited items warning | ✅ | |
| Send Request button | ✅ | |
| Currency selector (€ / TND / $ / £) | ❌ | Always TND only |

---

## Request Details Screen

| Feature | Status | Notes |
|---|---|---|
| Back arrow + title | ✅ | |
| Status badge (colored pill) | ✅ | Pending / Accepted / Declined |
| Item card (name, description, weight, reward) | ✅ | |
| Item photo display | ❌ | photoUrl stored but not rendered |
| Requester card (avatar, name) | ✅ | |
| Accept / Decline buttons (traveler, pending) | ✅ | |
| Open Chat button (once accepted) | ✅ | Auto-creates conversation |
| Intermediate status steps (bought/delivered/completed) | — | Removed by design — users coordinate via DM |

---

## Messages Screen

| Feature | Status | Notes |
|---|---|---|
| Conversation list | ✅ | Real-time via Firestore onSnapshot |
| User avatar (initial letter) | ✅ | |
| User name (bold if unread) | ✅ | |
| Last message preview | ✅ | |
| Timestamp | ✅ | Smart format: today=time, yesterday="Yesterday", older=date |
| Unread badge (count) | ✅ | Red pill badge |
| Empty state | ✅ | |
| Real photo avatar | ❌ | Initial letter only |

---

## Chat Screen

| Feature | Status | Notes |
|---|---|---|
| Header with back arrow | ✅ | |
| Header avatar (initial circle) | ✅ | |
| Header user name | ✅ | |
| Trip route as subtitle | ❌ | Not shown in header |
| Message bubbles (sent / received) | ✅ | Red for sent, white for received |
| Message timestamps | ✅ | Below each bubble |
| Text input with rounded corners | ✅ | |
| Send button (red/orange) | ✅ | |
| Image attachment button | ❌ | Not implemented |
| Real-time messages | ✅ | Firestore onSnapshot |
| Mark conversation as read on open | ✅ | |
| Auto-scroll to bottom | ✅ | |
| Keyboard avoiding | ✅ | |

---

## Profile Screen

| Feature | Status | Notes |
|---|---|---|
| Large circular avatar (initial) | ✅ | |
| Edit photo button | ❌ | Not implemented |
| Name | ✅ | |
| Location | ✅ | |
| Star rating | ✅ | |
| Deliveries count | ✅ | |
| Trips posted count | ❌ | Not shown — only rating + deliveries |
| Menu: My Trips | ✅ | |
| Menu: My Requests | ✅ | |
| Menu: My Orders | ✅ | |
| Menu: Edit Profile | ✅ | |
| Menu: Notification Settings | ✅ | (shows "coming soon" alert) |
| Menu: Help & Support | ✅ | (shows contact email) |
| Menu: Logout | ✅ | Confirmation alert |

---

## Edit Profile Screen

| Feature | Status | Notes |
|---|---|---|
| Back arrow + title | ✅ | |
| Avatar display (initial) | ✅ | |
| Change photo button | ❌ | Not implemented |
| Full name input | ✅ | |
| Location input | ✅ | |
| Phone number input | ✅ | |
| Bio (multiline) | ✅ | |
| ScrollView (keyboard safe) | ✅ | |
| Save Changes button | ✅ | |
| Location via LocationPicker | ❌ | Free-text only, not linked to picker |

---

## Notifications Screen

| Feature | Status | Notes |
|---|---|---|
| Back arrow + title | ✅ | |
| Notification list | ✅ | Paginated |
| Icon per notification type | ✅ | |
| Title + body text | ✅ | |
| Timestamp | ❌ | Not shown on notification items |
| Unread highlight (red bg tint) | ✅ | |
| Unread dot indicator | ✅ | |
| Mark all as read on focus | ✅ | |
| Tap → navigate to relevant screen | ✅ | |

---

## My Trips Screen

| Feature | Status | Notes |
|---|---|---|
| Trips tab (same as Trips screen) | ✅ | |
| Add trip button in header | ✅ | |
| Empty state with CTA | ✅ | |

---

## Orders Screen

| Feature | Status | Notes |
|---|---|---|
| Back arrow + title | ✅ | |
| List of sent requests with status | ✅ | Same data as Sent Requests |
| Tap → Request Details | ✅ | |
| Empty state | ✅ | |

---

## Rating / Review Screen

| Feature | Status | Notes |
|---|---|---|
| Screen exists | ✅ | New: app/review/[id].tsx |
| Traveler avatar + name | ✅ | |
| 5-star tappable rating | ✅ | |
| Rating label (Poor/Fair/Good/Great/Excellent) | ✅ | |
| Optional comment | ✅ | |
| Submit button | ✅ | |
| Writes to Firestore reviews collection | ✅ | |
| Updates traveler avg rating (transaction) | ✅ | |
| Triggered from Request Details (completed) | ✅ | |

---

## Known Gaps / Bugs to Fix

### High Priority
1. **Photo upload UI** — `request/create.tsx` has no image picker button despite backend supporting it
2. **Item photo display** — `request/[id].tsx` stores `photoUrl` but never renders the image
3. **Notification timestamps** — notifications list shows no timestamp on each row
4. **Trips posted stat** on Profile — only shows deliveries + rating, missing trips count
5. **Leave Review navigation bug** — the URL params for `travelerName` in `request/[id].tsx` uses `requesterName` by mistake — needs to use the trip's traveler name

### Medium Priority
6. **Currency selector** on Create Request — always TND, no €/$/£ option
7. **Trip reference card** on Create Request — shows only traveler name, not route + date
8. **Edit Profile location** — free-text instead of LocationPicker
9. **Trip route subtitle** in Chat header — not shown
10. **Requester rating** on Request Details — not displayed
11. **Trips posted count** query needed in users.ts

### Low Priority
12. **Real photo avatars** — all avatars use initial letters; no Firebase Storage photo upload/display
13. **Image messages** in Chat — image attachment button missing
14. **Forgot password** screen missing
15. **List of requests on Trip Details** — design spec asks for it but not built
16. **Notification timestamps** on notification rows

---

## Summary

| Category | Done | Partial | Missing |
|---|---|---|---|
| Auth | 5 | 0 | 1 |
| Navigation | 4 | 1 | 0 |
| Home | 9 | 0 | 0 |
| Trip flow | 15 | 2 | 1 |
| Request flow | 18 | 3 | 3 |
| Messaging | 11 | 0 | 2 |
| Profile | 10 | 1 | 2 |
| Review | 7 | 0 | 0 |
| Notifications | 7 | 0 | 1 |
| **Total** | **86** | **7** | **10** |

**Overall: ~84% complete for MVP**
