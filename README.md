# TRIP LEDGER

Production-ready Expo + React Native mobile app for collaborative trip planning, expense tracking, wallet management, itinerary management, offline capture, settlements, and PDF trip reporting using only free services.

## Stack

- Expo + React Native
- NativeWind
- React Navigation
- Zustand
- Firebase Authentication
- Cloud Firestore
- Expo Print and Sharing for PDF export
- XLSX for Excel itinerary import

## Architecture

The project follows a clean layered structure under [`src`](./src):

- `components`: reusable UI building blocks
- `screens`: feature screens grouped by domain
- `navigation`: auth and app navigation
- `store`: Zustand state containers
- `hooks`: feature hooks that bind UI to stores/services
- `services`: Firebase and app service integrations
- `utils`: shared algorithms and helpers
- `types`: shared TypeScript models
- `constants`: design tokens and static config

## Free-Service Notes

- Authentication: Firebase Authentication free tier
- Realtime sync: Cloud Firestore free tier
- Receipt images: local preview only in the free-only build
- PDF export: local generation with `expo-print` and `expo-sharing`
- Excel import: local parsing with `xlsx`
- Offline expense capture: local queue using AsyncStorage, synced when connectivity returns

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file from `.env.example` and fill in your Firebase values.

3. Create a Firebase project and enable:

- Email/Password Authentication
- Cloud Firestore
4. Fill the Firebase values in `.env` or `app.json`.

5. Start Expo:

```bash
npm run start
```

## Suggested Firestore Structure

```text
trips/{tripId}
trips/{tripId}/expenses/{expenseId}
trips/{tripId}/wallet/{transactionId}
trips/{tripId}/itinerary/{itemId}
```

## Core Features Included

- Authentication flows
- Trip creation and dashboard
- Expense tracking with local receipt preview
- Equal split engine plus custom and percentage utilities
- Settlement simplification algorithm
- Group wallet summaries and transactions
- Budget risk forecasting
- Itinerary management and Excel import
- Packing checklist screen
- Trip memory timeline
- Offline expense queue and sync trigger
- PDF trip report export

## Notes

- The scaffold is designed to stay fully on the free stack requested.
- Native date pickers, richer form validation, and push notifications can be added later without changing the architecture.
- Before production release, add Firebase security rules and app icons/splash assets.
