# Jibli Mobile App — UI Development Plan

Below is a structured UI development plan for the Jibli mobile MVP.
It focuses on screens, layout structure, and UI components, without mentioning styling.

---

## Application Structure

The app uses bottom tab navigation with five main sections:

- Home
- Trips
- Requests
- Messages
- Profile

Each section contains specific screens.

**Navigation types used:**

- Bottom tab navigator
- Stack navigation inside each tab
- Modal screens for creation flows

---

## 1. Authentication Flow

### 1.1 Welcome Screen

**Purpose**

Entry point that lets the user start the authentication process.

**Layout Structure**

Vertical layout with three sections:

- **Top section** — App logo
- **Middle section** — Short description text explaining the app
- **Bottom section** — Primary button: "Create account" / Secondary button: "Login"

**UI Components**

- Logo container
- Text component
- Primary button
- Secondary button

### 1.2 Register Screen

**Purpose**

Allow users to create an account.

**Layout Structure**

Vertical form layout.

- **Header** — Screen title, Back button
- **Form section** — Input fields stacked vertically
- **Bottom section** — Submit button

**UI Components**

Form inputs:

- Name input
- Email input
- Password input
- Confirm password input

Other components:

- Form validation messages
- Submit button
- Link to login screen

### 1.3 Login Screen

**Purpose**

Allow existing users to sign in.

**Layout Structure**

- **Header** — Title, Back button
- **Form section** — Email input, Password input
- **Footer** — Login button, Link to register

**UI Components**

- Text inputs
- Button
- Link text

---

## 2. Main Application Layout

After login, users enter the main app interface.

**Bottom Navigation Tabs**

Five tabs:

- Home
- Trips
- Requests
- Messages
- Profile

Each tab opens a stack of screens.

---

## 3. Home Screen

**Purpose**

Main discovery screen showing available trips.

**Layout Structure**

Vertical scroll layout with sections from top to bottom:

- Header section
- Search section
- Trip feed

**Header Section**

Contains user context.

- User avatar
- Greeting text
- Notification button

**Search Section**

Used to filter trips.

- Origin input
- Destination input
- Date selector
- Search button

**Trip Feed Section**

Displays a list of trip cards.

**Trip Card component:**

Each card contains:

- Traveler avatar
- Traveler name
- Traveler rating
- Route text (origin → destination)
- Travel date
- Available luggage capacity
- Button: "View trip"

Cards are displayed inside a vertical list.

---

## 4. Trip Details Screen

**Purpose**

Display detailed information about a selected trip.

**Layout Structure**

Scrollable layout with multiple sections:

- Trip header
- Traveler information
- Trip information
- Request action

**Trip Header**

- Origin location
- Destination location
- Travel date

**Traveler Information**

- Traveler avatar
- Traveler name
- Traveler rating
- Number of completed deliveries

**Trip Information**

- Available luggage capacity
- Trip notes
- List of current requests (optional)

**Request Action**

- Button: "Request item"
- Pressing the button opens the Create Request screen.

---

## 5. Create Trip Screen

**Purpose**

Allow travelers to post a trip.

**Layout Structure**

Form layout with stacked inputs.

- **Header** — Screen title, Back button
- **Trip form** — Input fields
- **Submit section** — Submit button

**Trip Form Inputs:**

- Departure city selector
- Destination city selector
- Travel date picker
- Luggage capacity input
- Optional note field

Submitting creates a new trip.

---

## 6. Create Request Screen

**Purpose**

Allow users to request an item from a traveler.

**Layout Structure**

Scrollable form layout.

- **Header**
- **Item information**
- **Reward information**
- **Submit**

**Item Information Inputs:**

- Item name input
- Item description input
- Estimated weight input
- Optional photo upload

**Reward Information Inputs:**

- Reward amount input

**Submit Section:**

- Submit button

Submitting sends the request to the traveler.

---

## 7. Requests Screen

**Purpose**

Display all requests related to the user.

**Layout Structure**

Tabbed layout with two tabs:

- Sent Requests
- Received Requests

**Sent Requests**

List of requests created by the user. Request Card displays:

- Item name
- Request status
- Reward
- Traveler name
- Button: "View details"

**Received Requests**

List of requests sent to the traveler. Request Card displays:

- Item name
- Requester name
- Weight
- Reward
- Accept button
- Reject button

---

## 8. Request Details Screen

**Purpose**

Display detailed request information.

**Layout Structure**

Scrollable layout with sections:

- Item information
- Requester information
- Actions

**Item Information**

- Item photo
- Item name
- Description
- Weight

**Requester Information**

- Requester avatar
- Requester name
- Rating

**Actions** (depending on status)

- Accept request
- Reject request
- Message requester

---

## 9. Messaging System

### 9.1 Conversations Screen

**Purpose**

Display list of active chats.

**Layout Structure**

Vertical list. Each conversation item contains:

- User avatar
- User name
- Last message preview
- Message timestamp

### 9.2 Chat Screen

**Purpose**

Allow users to communicate.

**Layout Structure**

Three main areas:

- **Header** — Back button, User avatar, User name
- **Message list** — Scrollable message container (message bubble + timestamp, aligned by sender)
- **Message input area** — Text input field, Send button, Optional image attachment button

---

## 10. Profile Screen

**Purpose**

Display user information and activity.

**Layout Structure**

Scrollable layout with sections:

- Profile header
- Statistics
- User actions

**Profile Header**

- Profile photo
- Name
- Location
- Rating

**Statistics Section**

- Number of trips posted
- Number of deliveries
- Average rating

**User Actions**

List of navigation items:

- My trips
- My requests
- My orders
- Edit profile
- Logout

Each item is a row with navigation behavior.

---

## 11. My Trips Screen

**Purpose**

Show trips created by the user.

**Layout Structure**

Vertical list of Trip Cards. Each card includes:

- Route
- Date
- Available space
- Button: "View trip"

---

## 12. Notifications Screen

**Purpose**

Display recent activity alerts.

**Layout Structure**

Vertical list of notifications. Each notification contains:

- Notification text
- Timestamp
- Optional action link

---

## UI Component Summary

Reusable components include:

- Avatar
- Button
- Input field
- Trip card
- Request card
- Conversation item
- Message bubble
- List row
- Notification item

---

## UI Development Order

Recommended order for building UI:

1. Authentication screens
2. Bottom navigation structure
3. Home screen with trip cards
4. Trip details screen
5. Create trip screen
6. Create request screen
7. Requests screens
8. Messaging system
9. Profile screens
10. Notifications screen
