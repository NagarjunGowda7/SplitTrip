# TRIP LEDGER Implementation Guide

Last updated: 2026-04-13

This document explains the current project structure, engineering rules, and implementation patterns that should be followed for future work so the codebase stays consistent.

## Purpose of This Guide

Use this document when continuing development so new code follows the same architecture instead of adding random one-off patterns.

This project should continue to follow:

- clean architecture
- reusable component-first UI
- shared business logic in utilities/services
- lightweight screen composition
- centralized state with Zustand

## Current Project Structure

```text
src/
  components/
  screens/
    auth/
    trip/
    expense/
    wallet/
    itinerary/
    budget/
    packing/
    reports/
    settings/
  navigation/
  services/
    firebase/
  hooks/
  store/
  utils/
  types/
  constants/
```

## Layer Responsibilities

### 1. UI Layer

Location:

- `src/screens`
- `src/navigation`

Rules:

- screens should compose hooks, components, and service-triggering actions
- screens should not contain heavy calculation logic
- screens should stay focused on layout, user actions, and state wiring
- navigation setup should stay inside `src/navigation`

### 2. Component Layer

Location:

- `src/components`

Rules:

- reusable presentational components live here
- components should be generic where possible
- avoid feature-specific logic inside shared components unless clearly intended
- if a UI pattern is used in more than one screen, move it here

Current reusable components:

- `Button`
- `Card`
- `InputField`
- `ExpenseCard`
- `MemberAvatar`
- `TripHeader`
- `CategoryBadge`
- `TimelineItem`
- `ReceiptPreview`
- `ListItem`

### 3. State Layer

Location:

- `src/store`
- `src/hooks`

Rules:

- Zustand stores own global/shared app state
- feature hooks are the main interface screens should consume
- screens should prefer hooks over talking to services directly
- store files should stay small and domain-specific

Current stores:

- `authStore`
- `tripStore`
- `expenseStore`
- `walletStore`

Current hooks:

- `useAuth`
- `useTrips`
- `useExpenses`
- `useWallet`
- `useItinerary`

### 4. Service Layer

Location:

- `src/services/firebase`

Rules:

- all Firebase access should stay here
- screens should not call Firebase SDK APIs directly
- data writes/reads should be abstracted into service functions
- repeated async logic belongs here, not in screens

Current services:

- `firebaseConfig`
- `authService`
- `tripService`
- `expenseService`
- `walletService`
- `itineraryService`
- `receiptService`

### 5. Data/Model Layer

Location:

- `src/types`

Rules:

- all shared interfaces live here
- if multiple files use the same data shape, define it in `types`
- avoid inline anonymous object shapes when a named type would improve consistency

Current models:

- `UserProfile`
- `Trip`
- `TripMember`
- `Expense`
- `ExpenseParticipantShare`
- `WalletTransaction`
- `WalletSummary`
- `ItineraryItem`

### 6. Utility Layer

Location:

- `src/utils`

Rules:

- pure business logic goes here
- calculations should be deterministic and testable
- utility functions should not depend on React
- if logic could be unit tested in isolation, prefer putting it here

Current utilities:

- `expenseCalculator.ts`
- `settlementEngine.ts`
- `budgetPredictor.ts`
- `excelParser.ts`
- `dateHelpers.ts`

### 7. Constants Layer

Location:

- `src/constants`

Rules:

- design tokens and static app configuration should live here
- avoid hardcoding repeated color values and category definitions across screens

Current constants:

- `appColors.ts`
- `expenseCategories.ts`

## Current Architectural Rules

These rules should continue to be followed.

### Rule 1: Keep Screens Thin

Do:

- read data from hooks
- render components
- trigger actions

Do not:

- duplicate Firestore logic
- duplicate settlement calculations
- place long parsing/calculation logic directly in screens

### Rule 2: Put Shared Logic in Utilities or Services

If logic is repeated or likely to be reused:

- put calculations in `utils`
- put backend/data access in `services`

Examples:

- split calculations belong in `expenseCalculator.ts`
- settlement algorithm belongs in `settlementEngine.ts`
- Firestore read/write code belongs in `services/firebase/*`

### Rule 3: Reuse Shared Components Before Creating New Ones

Before adding a new component:

1. check if `Card`, `ListItem`, `InputField`, or `Button` can be extended
2. if the UI is used in 2+ places, create or improve a reusable component

### Rule 4: Keep Domain Separation

Add new code in the correct domain folder.

Examples:

- expense screens in `screens/expense`
- trip screens in `screens/trip`
- itinerary-related logic in `services/firebase/itineraryService.ts`

### Rule 5: State Access Should Flow Through Hooks

Preferred usage in screens:

- `useAuth()`
- `useTrips()`
- `useExpenses(tripId)`
- `useWallet(tripId)`
- `useItinerary(tripId)`

This keeps screens less coupled to store internals.

### Rule 6: Keep Free-Only Constraint in Mind

Current project direction is free-only.

That means:

- Auth and Firestore are okay
- Firebase Storage should not be reintroduced casually
- receipt handling should remain local-only unless a truly free strategy is chosen

### Rule 7: Type First

Before building a new feature:

1. define or update the type in `src/types`
2. update service interfaces
3. update store/hook behavior
4. then build the screen

This helps keep feature work structured.

## Current Navigation Structure

Top-level:

- `AppNavigator`

Auth flow:

- `AuthNavigator`
- `LoginScreen`
- `RegisterScreen`

Main app flow:

- `TripNavigator`

Current bottom-tab areas:

- Dashboard
- Expenses
- Add Expense
- Wallet
- Itinerary
- Budget
- Packing

Additional stack screens:

- CreateTrip
- TripMembers
- AddPlace
- ExpenseDetails
- WalletTransactions
- TripReport
- Settings

## Current Styling Rules

The app currently uses:

- NativeWind utility classes
- shared colors from `appColors.ts`
- card-based layouts
- simple typography system

For future work:

- keep spacing consistent
- prefer shared card patterns over one-off wrappers
- use `appColors` instead of scattering hardcoded hex values
- keep visual language minimal and mobile-friendly

## Current Data Flow Pattern

Typical flow:

1. screen calls hook
2. hook reads from Zustand store or delegates to service
3. store updates shared state
4. service talks to Firebase
5. utility handles calculations when needed

Example:

1. expense screen saves an expense
2. expense hook exposes `addExpense`
3. expense store calls `expenseService.createExpense`
4. service writes to Firestore or AsyncStorage offline queue
5. Firestore subscription updates the store

## Current Naming and File Conventions

Follow these conventions:

- component files use PascalCase
- screen files use PascalCase with `Screen` suffix when appropriate
- store files use camelCase with `Store` suffix
- hooks start with `use`
- services end with `Service`
- utility files describe the problem they solve
- shared interfaces should use explicit exported names

## What Is Already Standardized

These patterns are already established and should be preserved:

- absolute imports using `@/`
- one file per main component/screen/service/store
- Firebase-specific code isolated in service layer
- reusable visual primitives in `components`
- domain-organized screens

## Current Weak Spots To Improve Carefully

When continuing development, pay extra attention here:

- validation
- error handling
- mobile UX polish
- real form flows
- loading states
- security rules
- data normalization around members and ownership
- offline sync robustness

Do not solve these by bypassing the structure. Solve them within the same architecture.

## Recommended Way To Build New Features

When adding a new feature, use this order:

1. define types
2. add or update utility logic if needed
3. add or update service methods
4. expose actions/state through store
5. wrap store usage in hook
6. build reusable components if needed
7. build/update screen
8. connect navigation if needed
9. update docs

## Suggested Next Feature Priorities

Best next work, in order:

1. proper validation and error states
2. better member management model
3. full expense creation UX
4. wallet transaction forms
5. packing checklist persistence
6. dedicated settlement experience
7. stronger trip memory creation flow
8. UI refinement for production quality

## Final Guidance

Use this codebase as a structured foundation.

Do not:

- add direct Firebase calls inside screens
- duplicate business logic
- create one-off UI patterns without checking shared components
- bypass types

Do:

- extend existing layers
- reuse components
- keep logic centralized
- keep docs updated as features move from scaffold to fully working
