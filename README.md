# Poké-Explore App 📱⚡

**Poké-Explore** is a React Native mobile application designed with a nostalgic "Pokedex" aesthetic. This project demonstrates a complete authentication flow (Login/Signup) and a user profile system using Firebase Authentication with robust persistence handling.

---

## 🚀 Key Features

- **Retro Pokedex UI:** Custom-styled screens imitating the classic red handheld device, complete with "green screen" data displays, sensor lights, and D-pad visuals.
- **Firebase Authentication:** Fully functional email/password login and registration.
- **Persistent Session:** Users remain logged in across app restarts using AsyncStorage.
- **Password Management:** Includes "Show/Hide Password" toggles and a "Forgot Password" reset flow.
- **Mock Data Integration:** Simulates a list of discovered Pokémon on the profile screen.

---

## 🛠️ Firebase Integration (Success!)

This project successfully integrates **Firebase Modular SDK (v9+)**.

### Technical Highlights:

- **Solved Network Request Failures:** Implemented `initializeAuth` with `@react-native-async-storage/async-storage` to ensure authentication state persists correctly on Android/iOS physical devices and emulators.
- **Hot-Reload Safety:** Implemented error handling for `auth/already-initialized` to prevent crashes during development hot reloads.
- **Auth State Listening:** Utilized `onAuthStateChanged` in the main entry file to automatically navigate between Auth and Main stacks based on login status.

---

## 📸 Progress & Screens

### 1. Login Screen

The entry point for Trainers.

**Features:**

- Email & Password input fields styled like retro computer terminals.
- Toggle Visibility: "SHOW/HIDE" switch for the password field.
- Forgot Password: Triggers a Firebase password reset email.
- Navigation to Registration.

<img src="assets/images/LoginScreen.jpeg" alt="Login Screen" width="300"/>

---

### 2. Sign Up Screen

Registration for new Trainers.

**Features:**

- Consistent Pokedex aesthetic.
- Input validation (Firebase handles weak passwords/duplicate emails).
- Error handling with user-friendly messages (no invasive popups).

<img src="assets/images/Signup Screen.jpeg" alt="Signup Screen" width="300"/>

---

### 3. Profile Screen (Trainer Card)

The main dashboard after logging in.

**Features:**

- Immersive Header: Integrated "Back" arrow directly into the red chassis (no white navigation bar).
- Trainer ID: Displays the logged-in user's email.
- Recent Discoveries: Uses Mock Data to simulate a list of caught/seen Pokémon with color-coded badges.
- Log Out: Successfully signs the user out and returns to the Login stack.

<img src="assets/images/ProfileScreen.jpeg" alt="Profile Screen" width="300"/>

---

## 💻 Technical Stack

- **Framework:** React Native
- **Language:** JavaScript (ES6+)
- **Backend:** Firebase (Authentication)
- **Storage:** `@react-native-async-storage/async-storage`
- **Navigation:** React Navigation (Native Stack)

---

## 📝 Mock Data Structure

The profile screen currently uses the following structure to simulate the Pokedex entries:

```javascript
const MOCK_DISCOVERIES = [
  { id: '001', name: 'BULBASAUR', status: 'CAUGHT', type: 'GRASS' },
  { id: '004', name: 'CHARMANDER', status: 'SEEN', type: 'FIRE' },
  // ...
];
