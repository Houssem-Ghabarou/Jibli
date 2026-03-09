# Jibli — Figma Design Prompt

## What is Jibli?

Jibli is a mobile marketplace that connects travelers with people who want items delivered between Tunisia and abroad. Travelers post trips with available luggage space, requesters browse trips and submit item requests, they coordinate via in-app chat, and the traveler delivers the item upon arrival.

Travel goes both directions: Tunisia → Abroad and Abroad → Tunisia.

---

## Design Direction

Modern mobile marketplace app. Clean, minimal, fast.

- Clean white background
- Strong accent color: red/orange (#E8453C or similar warm red)
- Card-based layouts with subtle shadows
- Rounded UI elements (12-16px border radius)
- Minimal typography, clear hierarchy
- Bottom tab navigation (5 tabs)
- Large touch targets, mobile-first
- Inspired by modern booking/marketplace apps (Airbnb, Grab, Bolt Food style)

---

## Navigation

Bottom tab bar with 5 tabs:

1. **Home** (house icon) — trip feed + search
2. **Trips** (airplane icon) — user's posted trips
3. **Requests** (package icon) — user's sent/received requests
4. **Messages** (chat bubble icon) — conversations
5. **Profile** (person icon) — profile + settings

---

## Screens to Design

### 1. Welcome Screen

Full-screen onboarding entry point.

- App logo centered (top third)
- Tagline: "Deliver anything, anywhere — powered by travelers"
- Illustration or hero image (travel/luggage theme)
- Two buttons at the bottom:
  - Primary button: "Create Account" (red/orange, full width)
  - Secondary button: "Login" (outlined, full width)

### 2. Register Screen

- Back arrow top left
- Title: "Create Account"
- Form fields (stacked vertically, rounded inputs):
  - Full name
  - Email
  - Password (with show/hide toggle)
  - Confirm password
- Primary button: "Sign Up"
- Footer text: "Already have an account? Login" (tappable link)

### 3. Login Screen

- Back arrow top left
- Title: "Welcome Back"
- Form fields:
  - Email
  - Password (with show/hide toggle)
- Primary button: "Login"
- Footer text: "Don't have an account? Sign Up" (tappable link)

### 4. Home Screen

Main discovery screen. Vertical scroll layout.

**Header section:**
- Left: user avatar (small, circular) + greeting text ("Hello, Karim 👋")
- Right: notification bell icon with badge

**Search section (card-style container):**
- "From" field — tappable, shows selected city or placeholder "Departure city". NOT a text input. Tap opens the Location Picker.
- "To" field — tappable, same behavior. Placeholder: "Destination city"
- Date field — tappable, opens date picker. Placeholder: "Travel date"
- Search button (red/orange, full width within the card)
- Both From and To are optional for search. Either can be any city (Tunisian or international).

**Trip feed section:**
- Section title: "Available Trips" or "Recent Trips"
- Vertical list of Trip Cards (see Trip Card component below)

### 5. Location Picker (Bottom Sheet / Modal)

This is the most important component. Opens when user taps "From" or "To" on any screen. Same component used everywhere.

**Layout (full-height bottom sheet):**

- Header: "← Select city" with close/back button
- Search bar: "Search city or country..." (filters the predefined list as you type — this is the ONLY typing allowed for location selection)
- **📍 Near you** section (if GPS detected): shows the auto-detected nearest city, highlighted, tappable
- **🕐 Recent** section: last 3-5 selected cities (stored locally)
- **🇹🇳 Tunisia** section: cities grouped by governorate
  - Governorate names as group headers (e.g., "Tunis Governorate", "Ariana Governorate")
  - Cities listed under each governorate
- **🇫🇷 France** section: cities listed under country header
- **🇩🇪 Germany** section: same pattern
- **🇧🇪 Belgium**, **🇨🇦 Canada**, **🇮🇹 Italy**, etc.
- **✏️ Other** option at the bottom: "Enter a custom city..." for cities not in the list

The list is organized by country with flag emojis. Tunisia appears first when user is in Tunisia, otherwise their current country appears first.

Selecting a city closes the picker and fills the field.

### 6. Trip Card Component

Used on Home Screen, Trips tab, and My Trips. Card with subtle shadow and rounded corners.

Layout:
- Top row: traveler avatar (circular, small) + traveler name + star rating (e.g., ★ 4.8)
- Middle: route displayed as "Ariana → Paris" in bold, with area text below if provided (e.g., "Villepinte area") in smaller gray text
- Bottom row: calendar icon + date on the left, luggage icon + "5kg free" on the right
- Action: "View Trip" button or the whole card is tappable

Country flags can appear next to city names (🇹🇳 Ariana → 🇫🇷 Paris).

### 7. Trip Details Screen

Opened when tapping a trip card. Scrollable.

**Sections:**

- **Route header**: large display of "From → To" with areas, country flags
- **Traveler info card**: avatar, name, rating, number of completed deliveries, "Message" button
- **Trip details**:
  - Travel date
  - Available luggage capacity (e.g., "5kg available")
  - Trip note (if any)
- **Current requests on this trip** (optional list if other requests exist)
- **Primary CTA**: "Request an Item" button (red/orange, fixed at bottom)

### 8. Create Trip Screen

Form screen for travelers to post a trip.

- Back arrow + title: "Post a Trip"
- **From field**: tappable → opens Location Picker. Auto-filled with GPS-detected city.
- **From area** (optional): text input below From field. Placeholder: "Neighborhood or zone (optional)"
- **To field**: tappable → opens Location Picker
- **To area** (optional): text input below To field. Placeholder: "Neighborhood or zone (optional)"
- **Travel date**: tappable date picker
- **Luggage capacity**: numeric input with "kg" suffix
- **Note** (optional): multiline text input. Placeholder: "Airline, what you can carry, availability..."
- **Submit button**: "Post Trip" (red/orange, full width, fixed at bottom)

### 9. Create Request Screen

Form screen for requesters to request an item from a specific trip.

- Back arrow + title: "Request an Item"
- **Trip reference** at the top (non-editable card showing the trip route, traveler, date)
- **Item name**: text input. Placeholder: "What do you need?"
- **Description**: multiline text input. Placeholder: "Brand, size, where to buy..."
- **Estimated weight**: numeric input with "kg" suffix
- **Photo** (optional): image upload button with camera/gallery option
- **Reward amount**: numeric input with currency selector (€ / TND / $ / £)
- **Submit button**: "Send Request" (red/orange, full width)

### 10. Requests Screen (Tab)

Two sub-tabs at the top:

**Sent Requests tab:**
- List of Request Cards showing:
  - Item name
  - Status badge (Pending / Accepted / Bought / Delivered / Completed) — color-coded
  - Reward amount
  - Trip route + traveler name
  - "View Details" tappable

**Received Requests tab:**
- List of Request Cards showing:
  - Item name
  - Requester name + avatar
  - Weight + Reward
  - Two buttons: "Accept" (green) and "Decline" (gray/red)

### 11. Request Details Screen

Full details of a single request.

- **Item section**: photo (if uploaded), item name, description, weight
- **Requester section**: avatar, name, rating
- **Trip section**: route, date
- **Status**: current status with visual progress (Requested → Accepted → Bought → Delivered → Completed)
- **Actions** (based on status):
  - If pending: Accept / Decline buttons
  - If accepted: "Mark as Bought" button + "Message Requester" button
  - If bought: "Mark as Delivered" button
  - If delivered: waiting for requester confirmation

### 12. Conversations Screen (Messages Tab)

Vertical list of active conversations.

Each conversation row:
- User avatar (circular)
- User name (bold)
- Last message preview (truncated, gray text)
- Timestamp (right-aligned, small)
- Unread indicator (red dot or bold text)

### 13. Chat Screen

Opened from a conversation or from a request action.

- **Header**: back arrow, user avatar, user name, trip route as subtitle
- **Message area**: scrollable, messages in bubbles
  - Sent messages: right-aligned, red/orange background, white text
  - Received messages: left-aligned, light gray background, dark text
  - Timestamps below each message or group
- **Input area** (fixed at bottom):
  - Text input with rounded corners
  - Send button (red/orange icon)
  - Optional: image attachment button (camera icon)

### 14. Profile Screen

Scrollable.

- **Profile header**: large circular profile photo (with edit icon overlay), name, location, star rating
- **Stats row**: three columns — Trips posted | Deliveries completed | Average rating
- **Menu items** (list rows with right chevron):
  - My Trips
  - My Requests
  - My Orders
  - Edit Profile
  - Notifications Settings
  - Help & Support
  - Logout (red text)

### 15. My Trips Screen

Vertical list of the user's posted trips (Trip Cards). Same card component as Home Screen but showing only the user's trips.

### 16. Notifications Screen

Vertical list of notifications.

Each notification row:
- Icon (type-specific: bell, check, message, etc.)
- Notification text (e.g., "Amira requested Makroudh on your Paris trip")
- Timestamp
- Read/unread state (unread = bold or highlighted background)
- Tappable → navigates to the relevant screen

### 17. Edit Profile Screen

Form screen.

- Circular profile photo with "Change Photo" button
- Full name input
- Email input (read-only or editable)
- Location (tappable → opens Location Picker to set home city)
- Phone number (optional)
- Bio (optional, multiline)
- Save button (red/orange, full width)

### 18. Rating / Review Screen (Modal)

Appears after delivery is confirmed.

- Traveler avatar + name at the top
- Trip route reference
- Star rating selector (5 stars, tappable)
- Optional comment text input
- Submit button: "Leave Review"

---

## Component Library Summary

Design these as reusable components:

| Component | Usage |
|-----------|-------|
| LocationField | Tappable field that shows selected city, opens picker |
| LocationPicker | Bottom sheet with search, GPS suggestion, grouped city list |
| AreaInput | Optional text input for neighborhood/zone |
| TripCard | Card displaying trip info (route, date, capacity, traveler) |
| RequestCard | Card displaying request info (item, status, reward) |
| ConversationRow | Row in messages list (avatar, name, preview, time) |
| MessageBubble | Chat message (sent vs received styling) |
| StatusBadge | Color-coded pill for request status |
| StarRating | Display and input rating stars |
| Avatar | Circular user photo (small, medium, large sizes) |
| PrimaryButton | Red/orange full-width button |
| SecondaryButton | Outlined button |
| InputField | Rounded text input with label and optional icon |
| BottomTabBar | 5-tab navigation bar |

---

## Screen Flow Summary

```
Welcome → Register → Home (with bottom tabs)
Welcome → Login → Home (with bottom tabs)

Home tab:
  Home → [Location Picker] → Trip Card → Trip Details → Create Request

Trips tab:
  My Trips → Trip Details
  + FAB or header button → Create Trip → [Location Picker]

Requests tab:
  Sent Requests → Request Details
  Received Requests → Request Details → Accept/Decline

Messages tab:
  Conversations → Chat

Profile tab:
  Profile → My Trips / My Requests / Edit Profile / Notifications
  Profile → Rating Screen (triggered after delivery)
```

---

## Important Design Notes

1. The Location Picker is the same component everywhere — search, create trip, edit profile. Design it once, reuse it.
2. From and To fields are NEVER free-text inputs. They are tappable fields that open the picker. The only typing is the search filter inside the picker and the optional area field.
3. The app supports bidirectional travel (Tunisia ↔ Abroad). There is no visual distinction — both From and To can be any city.
4. Country flags (🇹🇳🇫🇷🇩🇪 etc.) should appear next to city names on cards and in the picker for quick visual scanning.
5. The status flow for orders is: Requested → Accepted → Bought → Delivered → Completed. Each status should have a distinct color.
6. Design for iPhone and Android. Use safe areas. Bottom tab bar should account for home indicator on iPhone.
7. The overall feel should be: fast, trustworthy, simple. A user should be able to post a trip in under 30 seconds.
