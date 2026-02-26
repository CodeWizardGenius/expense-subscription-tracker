# Expense Subscription Tracker - Project Research & Architecture

## Overview
The **Expense Subscription Tracker** is a mobile application built using React Native and Expo. It provides users a unified dashboard to monitor their spending, track active subscriptions, view transactions, and set personal budget goals. The project aims for a highly modern UI with dark mode, fluid navigation, and data visualization.

---

## Technology Stack

**Core Frameworks & Tools:**
- **React Native** (v0.81.5) & **React** (v19.1.0)
- **Expo SDK** (~54) - Unified mobile framework with Metro bundler and EAS integrations.
- **Expo Router** (v6) - File-based routing for React Native, handling deep links, stack navigation, and tab bars automatically via the `app/` directory.

**Styling & UI:**
- **NativeWind (v4.2.1)** & **Tailwind CSS (v3.4.19)** - Used for utility-first styling with custom configurations. Allows using `className` in place of `style objects`. Provides support for CSS variables globally in `global.css`.
- **Lucide React Native** & **Custom SVGs** - SVG-based icon libraries for consistent and performant iconography across devices.
- **React Native SVG** - Used for rendering complex vector graphics and charts (e.g., the Donut Chart on the dashboard).
- **Expo Linear Gradient** - Used for rendering sleek gradients behind screens and UI components.

**Backend & Data Management:**
- **Supabase** - Acts as the primary backend-as-a-service (BaaS). Handles User Authentication (Sign up, Log in, Session management) and will presumably handle the Database (PostgreSQL) for storing transactions, categories, and user profiles.
- **Redux Toolkit** & **React-Redux** - Global state management solution initialized at `store/index.ts`. Built for handling complex or shared states like fetched analytics and deep nested data.
- **React Context API** (`src/contexts/AuthContext`) - Specifically managing user session states locally at the app initialization and root layout levels.

---

## Architecture & Folder Structure

The project leans on modular feature-based and file-based routing architecture.

```text
/expense-subscription-tracker
│
├── app/                        # Expo Router entry and screen routing
│   ├── _layout.tsx             # Root Layout (Auth state checking, providers)
│   ├── login.tsx               # Login Screen
│   ├── signup.tsx              # Registration Screen
│   ├── (tabs)/                 # Main Bottom Tab Navigation
│       ├── _layout.tsx         # Tab Bar configuration & custom styling
│       ├── index.tsx           # Home Dashboard (balance, spending chart, recent)
│       ├── transactions.tsx    # Transaction entry / creation screen
│       ├── subsCards.tsx       # Subscriptions and Cards display
│       ├── analytics.tsx       # Detailed graphical analytics
│       └── profile.tsx         # User settings
│
├── src/                        # Main modular source code
│   ├── components/             # Reusable UI components
│   │   ├── Themed.tsx          # General UI/Theme wrappers
│   │   └── svgIcons/           # Extracted Custom SVG Tab Icons
│   ├── contexts/               # React Contexts
│   │   └── AuthContext.tsx     # Supabase Auth Provider logic
│   ├── features/               # Feature-specific sliced logic
│   │   └── auth/               # Modular components/logic specific to auth
│   └── lib/                    # Core library initializations
│       └── supabase.ts         # Supabase client instantiation
│
├── store/                      # Redux Store global instance
│   └── index.ts                # Root store and reducers
│
├── global.css                  # Global Tailwind & Theme CSS Variables
├── tailwind.config.js          # Extended color palettes & configurations
├── babel.config.js             # NativeWind v4 babel preset config
└── metro.config.js             # Metro bundler config utilizing NativeWind
```

---

## Styling Architecture Highlights
- Uses a deeply customized color palette for UI consistency (defined in `tailwind.config.js`):
  - Primary Background: `#0a0e14`
  - Cards: `#0d1a1a` & `#111b1b`
  - Accents: `#00f5e0` (Turquoise/Cyan glow)
- Custom typography configurations, maintaining dark-theme default approaches using `text-white` and `text-gray-500` shades.

---

## Known Behaviors & Debugging Notes
1. **NativeWind v4 & External Components Compatibility:**
   In version 4 of NativeWind, utilizing `className` directly on specialized third-party components (such as `LinearGradient` from `expo-linear-gradient` or certain `SafeAreaView` contexts) will occasionally fail to append exact dimensions like `flex-1`. This results in components rendering with `0` height and users experiencing a **"White Screen Issue"**. 
   - **Resolution Used:** Resorting to standard `{ flex: 1 }` object within the `style={...}` prop ensures the UI layers correctly expand to the screen boundaries for these external wrappers.

2. **SafeAreaView Deprecation Warnings:**
   Expo Router and React Native packages might trigger `SafeAreaView` deprecation logs. The project correctly integrates `react-native-safe-area-context` to safely handle notches, ignoring legacy warnings intentionally in `_layout.tsx`.

3. **Database Integration Status:** 
   While basic Authentication is functional via `useAuth()`, many of the Dashboard statistics (Balance, Recent Transactions, Spending arrays) are currently relying on dummy data constants instead of real Supabase queries.

---

## Next Recommended Steps
1. **API Integration:** Connect the `transactions` fetching logic via `Supabase` to replace the Dummy Data (`dummySpending`, `totalBalance`, `dummyTransactions`) inside `app/(tabs)/index.tsx`.
2. **Component Extractions:** Break out the `DonutChart` and `TransactionItem` from `app/(tabs)/index.tsx` into `src/components/` to reuse them on the `analytics.tsx` screen.
3. **Redux Synchronization:** Verify if `store/index.ts` should cache authenticated user data or offline transactions to optimize Supabase read operations.
4. **Form Optimizations:** Add `react-hook-form` alongside `zod` for safer, cleaner inputs inside `login.tsx`, `signup.tsx`, and `transactions.tsx`.
