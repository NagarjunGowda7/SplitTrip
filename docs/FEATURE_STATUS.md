# TRIP LEDGER Feature Status

Last updated: 2026-04-13

This document describes the current implementation status of the project as it exists in the codebase right now. It is intentionally blunt so future work can start from reality, not from the original vision.

## Current Overall State

The project currently has:

- a working Expo app scaffold
- clean folder separation for screens, components, hooks, stores, services, utilities, types, and constants
- Firebase Authentication and Firestore wiring in code
- web bundle compiling successfully
- Android JavaScript bundle compiling successfully
- TypeScript passing

The project does not currently feel production-ready from a product perspective.

The codebase is best described as:

- strong scaffold
- partially integrated app flows
- incomplete business logic in several places
- many screens are present but still MVP or placeholder quality

## Verified Technical Status

The following checks passed locally in the workspace:

- `npm run typecheck`
- `npx expo export --platform web`
- `npx expo export --platform android`

This means the code compiles, but it does not mean every feature is fully working in real app usage.

## Feature-by-Feature Status

### 1. Authentication

Status: `Partially working`

Implemented:

- Login screen exists
- Register screen exists
- Firebase Email/Password auth is wired
- Auth store and auth hook exist
- App navigator switches between auth flow and app flow

Current limitations:

- no form validation
- no error message handling for invalid login, weak password, duplicate email, network failure
- no forgot password flow
- no profile completion flow
- no session restoration QA on actual device confirmed

### 2. Trip Creation

Status: `Basic working`

Implemented:

- Create trip screen exists
- Trip data is written through `tripService`
- Trip store subscribes to trips
- Dashboard can show the active trip

Current limitations:

- date input is raw text, not a real date picker
- no validation for invalid dates, empty names, empty destination, invalid budget
- no ownership/member permission rules
- member input is comma-separated free text only
- no invitation flow
- no editing trip details

### 3. Trip Dashboard

Status: `Basic working`

Implemented:

- Dashboard layout exists
- Trip header exists
- shows trip count, member count, total spent
- shows simplified settlements
- shows a memory/timeline section

Current limitations:

- visuals are still basic and not polished enough for a production app
- data density is limited
- no charts
- no loading, error, or empty-state sophistication
- memory timeline is only partially fed by data

### 4. Expense Tracking

Status: `Partially working`

Implemented:

- Add expense screen exists
- Expense timeline screen exists
- Expense details screen exists
- expenses are stored in Firestore subcollection
- equal split calculation is wired
- expense store subscribes to expenses

Current limitations:

- payer is hardcoded to the first trip member
- only equal split is used in UI
- custom split and percentage split exist as utilities only, not integrated in forms
- no expense editing
- no expense deletion
- no category analytics on expense screen itself
- no validation for invalid amount or missing required fields
- no optimistic UI or useful save feedback

### 5. Expense Calculation Engine

Status: `Implemented at utility level`

Implemented:

- `calculateEqualSplit()`
- `calculateCustomSplit()`
- `calculatePercentageSplit()`

Current limitations:

- only equal split is used in the current screens
- no UI for manually entering custom amounts or percentages
- no guardrails in form UX

### 6. Smart Settlement

Status: `Implemented at utility level and shown in dashboard/report`

Implemented:

- debt simplification utility exists in `settlementEngine.ts`
- dashboard uses simplified balances
- report screen also uses settlement logic

Current limitations:

- no dedicated settlement screen
- no payment completion flow
- no mark-as-settled action
- balances are recalculated from expense shares only

### 7. Group Wallet

Status: `Partially working`

Implemented:

- wallet screen exists
- wallet transaction screen exists
- wallet service calculates total wallet, spent, remaining balance
- Firestore wallet subcollection is used

Current limitations:

- current UI only adds a simple owner contribution shortcut
- no spend transaction flow from UI
- no refund flow from UI
- no form for amount/member/note entry
- wallet usage is not deeply integrated with expense flow

### 8. Budget Monitoring

Status: `Basic working`

Implemented:

- budget analytics screen exists
- budget predictor utility exists
- projected spend and overspend are shown

Current limitations:

- predictor is simplistic
- no trend graph
- no category-by-category budget view
- no per-day burn visualization

### 9. Itinerary

Status: `Partially working`

Implemented:

- itinerary screen exists
- add place screen exists
- Firestore itinerary subcollection is used
- visited toggle exists
- Excel import utility exists
- Excel import is connected through document picker

Current limitations:

- no robust Excel validation
- imported field mapping is fragile
- date/time handling is simplistic
- no reorder support
- no edit/delete itinerary item flows
- no map preview or external opening flow

### 10. Packing Checklist

Status: `UI only / placeholder`

Implemented:

- packing checklist screen exists
- items from trip object are rendered

Current limitations:

- "Packed" action does not persist
- no item add/edit/delete flow
- no checked state storage

### 11. Receipt Handling

Status: `Local preview only`

Implemented:

- image picker works for selecting a receipt image
- receipt preview component exists

Current limitations:

- cloud upload is intentionally disabled in the free-only build
- receipt URL is not being uploaded to Firebase Storage
- selected preview is not persisted as a durable file reference

### 12. Trip Memory Timeline

Status: `Partially working`

Implemented:

- dashboard shows a timeline
- timeline can include:
  - trip memories already attached to trip data
  - visited places
  - recent expenses

Current limitations:

- no dedicated memory creation flow
- no photo timeline persistence flow
- no notes composer for memory items
- not all event types are consistently generated

### 13. Excel Import

Status: `Basic working, not hardened`

Implemented:

- `excelParser.ts` exists
- itinerary import screen flow exists
- XLSX parsing is wired

Current limitations:

- assumes a simple workbook shape
- weak error handling
- no preview/confirmation step before import

### 14. Offline Expense Tracking

Status: `Partially working`

Implemented:

- offline queue exists in AsyncStorage
- expense service stores expenses locally when offline
- dashboard listens for connectivity and triggers sync
- settings screen includes manual sync action

Current limitations:

- queue only covers expenses
- no offline UI badge or queue viewer
- no retry conflict resolution
- no sync result messaging
- not stress-tested on real device

### 15. Realtime Sync

Status: `Basic working`

Implemented:

- trips, expenses, wallet, and itinerary use Firestore snapshot subscriptions

Current limitations:

- unsub/resub logic is basic
- no loading skeletons
- no error boundaries around subscriptions

### 16. PDF Export

Status: `Basic working`

Implemented:

- report screen exists
- summary HTML is generated
- `expo-print` and `expo-sharing` are wired

Current limitations:

- report is plain
- no branding
- no charts or tables
- no export history
- not verified on physical mobile share sheet

## What Is Good Enough To Continue Building On

These parts are stable enough to keep and extend:

- folder structure
- TypeScript models
- navigation shell
- Zustand store pattern
- Firebase service layer pattern
- utility-based business logic organization
- reusable component direction

## What Needs Refactor or Quality Work Soon

- input validation across all forms
- loading and error states
- better member modeling and selection
- real date/time UX
- proper wallet transaction UX
- custom split and percentage split UI
- packing checklist persistence
- stronger offline UX and sync conflict handling
- stricter Firebase rules
- visual polish and mobile product quality

## Recommended Short-Term Priorities

1. Finish trip creation and member management UX.
2. Finish expense form UX with payer selection and split type selection.
3. Add validation and user-facing error handling.
4. Persist packing checklist state.
5. Decide final receipt strategy for the free-only version.
6. Add stricter Firestore security rules around trip membership.
7. Improve mobile UI quality before adding more features.

## Summary

The project is not empty and not broken at the compile level.

It is a working architectural foundation with several basic feature flows, but many features are still:

- shallow
- incomplete
- unvalidated
- visually underdeveloped

Treat the current codebase as a solid scaffold plus partial implementation, not as a finished production app.
