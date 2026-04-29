# TRIP LEDGER Screenwise Task Plan

Last updated: 2026-04-13

This document converts the current project state and your product feedback into a clean implementation task list.

The goal is not to add random code fast.

The goal is to turn the current scaffold into a polished, reliable, production-quality trip app where:

- the main flows work correctly
- data entry is intuitive
- edits are possible
- imports match the real travel planning format
- wallet and settlements feel useful
- screens feel intentional and complete

## Product Standard To Follow

Every task below should be implemented with these non-negotiable rules:

- no placeholder UX in core flows
- all forms must validate before save
- all save/update/delete actions must show success or failure feedback
- no hidden hardcoded assumptions like first member being payer
- all created records must be editable unless there is a strong reason not to
- no screen should auto-fill incorrect date/time values silently
- imported itinerary data must map to the real spreadsheet format accurately
- feature completion matters more than feature count

## Priority Order

Build in this order:

1. core data correctness
2. trip and member management
3. expense flow
4. itinerary flow and Excel import
5. wallet flow
6. settlement flow
7. timeline and reporting
8. UI polish and production hardening

---

## 1. Global Foundation Tasks

These tasks should be completed before deep feature work.

### Task G1: Add a universal form validation pattern

Needed because:

- trip creation is too loose
- expense creation allows bad data
- itinerary inputs are inconsistent

Implement:

- required field validation
- numeric validation
- positive amount validation
- date/time validation
- URL validation for maps links
- inline error messages
- blocked submit when invalid

### Task G2: Add a universal async status pattern

Implement:

- loading state on buttons
- success confirmation after save
- visible error message if Firebase fails
- disabled button during save

Apply to:

- login
- register
- create trip
- add expense
- add itinerary item
- wallet transactions
- report export

### Task G3: Add reusable pickers/selectors

Need reusable controls for:

- category selection
- payer selection
- member multi-select
- date selection
- time selection
- split type selection

Create reusable components instead of repeating ad hoc inputs.

### Task G4: Standardize edit/delete patterns

Every major entity should support:

- create
- view
- edit
- delete or archive where appropriate

Entities:

- trip
- expense
- itinerary item
- wallet transaction
- packing item

### Task G5: Add proper empty states

Current issue:

- screens often feel blank or unclear

Add clear empty states for:

- no trips
- no expenses
- no itinerary items
- no wallet transactions
- no memories

---

## 2. Authentication Screens

Screens:

- `LoginScreen`
- `RegisterScreen`

### Task A1: Add proper validation

Login:

- email required
- email format validation
- password required

Register:

- name required
- email required
- password required
- minimum password length

### Task A2: Add Firebase error handling

Show friendly errors for:

- invalid credentials
- email already in use
- weak password
- network issue

### Task A3: Improve auth UX

Add:

- password show/hide
- keyboard-safe layout
- cleaner spacing
- proper focus flow between fields

### Task A4: Add forgot password flow

This is important for production readiness.

---

## 3. Trip Creation and Trip Management

Screens:

- `CreateTripScreen`
- `TripDashboard`
- `TripMembersScreen`

### Task T1: Redesign create trip flow

Current issues:

- raw text dates
- members entered as comma-separated text
- no editing after creation

Replace with:

- trip name input
- destination input
- currency selector
- start date picker
- end date picker
- budget input
- notes input
- member management block

### Task T2: Build proper member management inside trip creation

Current issue:

- names are not entered in a reliable structure

Add:

- add member button
- member name field
- optional email field
- optional avatar initials
- remove member action

Need to store members as structured objects, not just derived split text.

### Task T3: Add Edit Trip screen

Required because:

- once trip is created, user must be able to update trip details

Edit support:

- trip name
- destination
- dates
- currency
- budget
- notes
- members

### Task T4: Add delete/archive trip action

At least one of these is needed.

### Task T5: Improve Trip Dashboard

Current issues:

- too basic
- feels like a normal scaffold

Improve with:

- trip summary cards
- budget progress
- upcoming itinerary section
- recent expenses section
- wallet summary section
- settlement preview section
- memory timeline preview
- quick action buttons

### Task T6: Member management screen improvements

Trip members screen should support:

- add member
- edit member
- remove member
- show contribution summary
- show balance summary

---

## 4. Expense Flow

Screens:

- `AddExpenseScreen`
- `ExpenseTimelineScreen`
- `ExpenseDetailsScreen`

This is one of the highest-priority feature groups because you already reported it is not working correctly.

### Task E1: Fix category selection

Current issue:

- category is not being picked or reflected properly

Replace the current category chip logic with:

- a clearly selected state
- visible selected highlight
- stored selected category value
- validation that category exists before save

### Task E2: Fix Firebase expense save errors

Investigate and harden:

- missing required payload fields
- invalid trip id
- invalid shares structure
- missing Firestore permission handling
- save feedback to user

Add:

- try/catch around save
- user-facing error text
- debug logging during development

### Task E3: Build full expense form

Required fields:

- title
- amount
- category
- payer
- date
- split type
- participants
- notes
- receipt preview optional

### Task E4: Add payer selection

Current issue:

- payer is incorrectly defaulted to the first member

Needed:

- payer dropdown or member selector
- save payer id and payer name correctly

### Task E5: Add split type selection

Support:

- equal split
- custom split
- percentage split

UI requirements:

- equal split auto-calculates
- custom split lets user enter amount per participant
- percentage split lets user enter percentage per participant
- validation ensures total matches expense amount

### Task E6: Add participant selection

Support:

- select all members by default
- allow subset of members
- recalculate shares only for selected members

### Task E7: Add edit expense flow

Need:

- open expense details
- edit expense
- update Firestore
- re-run share calculations if changed

### Task E8: Add delete expense flow

Need:

- delete confirmation
- Firestore delete
- wallet/settlement recalculation behavior considered

### Task E9: Improve expense timeline

Add:

- filter by category
- filter by payer
- filter by date
- total summary
- grouped timeline by day

### Task E10: Improve receipt handling for free-only mode

Since Storage is disabled:

- keep local preview support
- clearly label it as local-only
- do not imply cloud persistence

If a future free file strategy is chosen, integrate it later behind a service abstraction.

---

## 5. Itinerary Flow

Screens:

- `ItineraryScreen`
- `AddPlaceScreen`

This area needs major rework because your plan format is much richer than the current item model.

### Task I1: Redesign itinerary data model

Current model is too simple.

It should support your planning format:

- day label
- date
- start time
- from location
- end time
- to location
- distance
- travel time
- time spent
- activity
- google maps link
- visited status
- notes

Update:

- `ItineraryItem` type
- Firestore service
- Excel parser
- manual add/edit screens

### Task I2: Rebuild Add Place into Add Itinerary Item

Current issue:

- date and time are being auto-set incorrectly
- fields do not match the actual travel plan structure

New form fields must match your spreadsheet:

- day
- date
- start time
- from
- end time
- to
- distance
- travel time
- time spent
- activity
- google maps
- notes

### Task I3: Add edit itinerary flow

Need:

- tap item
- edit item
- save update

### Task I4: Add delete itinerary flow

Need:

- delete confirmation
- remove item

### Task I5: Improve itinerary list UI

Show each row cleanly with:

- date and day
- route from/to
- start and end time
- activity
- travel info
- visited indicator
- maps action

### Task I6: Add reorder/grouping behavior

Support:

- grouped by day/date
- sorted correctly by date and start time

---

## 6. Excel Import Tasks

This is currently not matching the real format and is one of the most important corrections.

### Task X1: Update parser to match the real trip sheet format

Expected columns from your reference:

- `Day`
- `Date`
- `Start Time`
- `From`
- `End Time`
- `To`
- `Distance (km)`
- `Travel Time`
- `Time Spent`
- `Activity`
- `Google Maps`

The parser must map those exact columns.

### Task X2: Stop generating fake/default repeated values

Current issue:

- same/random values appear in every imported row

Need robust row mapping:

- read each cell by header name
- support real Excel date/time cell formats
- convert safely to display/store format
- skip empty rows

### Task X3: Add import preview before save

Need:

- show parsed rows before committing
- highlight rows with missing values
- allow confirm import

### Task X4: Add import validation

Check:

- missing required columns
- empty date
- empty route
- empty activity
- invalid maps link

### Task X5: Preserve route format in UI

Imported entries should show:

- From -> To
- not just a single place field

---

## 7. Group Wallet

Screens:

- `WalletScreen`
- `WalletTransactionsScreen`

You specifically said the group wallet option is not good at all. This needs to become a real product flow.

### Task W1: Redesign wallet summary

Must clearly show:

- total wallet
- total added
- total spent
- remaining balance
- member-wise contribution

### Task W2: Add wallet transaction creation form

Support:

- transaction type: add / spend / refund
- member selection
- amount
- note
- date

### Task W3: Add edit wallet transaction flow

Need:

- open wallet transaction
- edit details
- update totals

### Task W4: Add delete wallet transaction flow

Need:

- delete confirmation
- totals recalc

### Task W5: Connect wallet to expense system better

Need a product decision:

- if an expense is paid from wallet, mark it so
- wallet spent should reflect that expense

This should be properly modeled instead of staying disconnected.

### Task W6: Improve member wallet view

Show for each member:

- amount added
- amount spent
- current contribution balance

---

## 8. Smart Settlement

### Task S1: Build a dedicated settlement screen

Current issue:

- settlement is buried inside dashboard/report

Need:

- member balances
- who owes whom
- minimal settlement transactions
- total payable per member

### Task S2: Add settlement detail explanation

For each settlement:

- payer
- receiver
- amount
- reason/context

### Task S3: Add mark-as-settled workflow

If chosen by product:

- mark settlement done
- record timestamp
- optionally convert to wallet/refund entry

---

## 9. Packing Checklist

### Task P1: Persist checklist state

Current issue:

- packed action is not real

Need:

- item checked state saved
- update trip or subcollection

### Task P2: Add item management

Support:

- add item
- edit item
- delete item

### Task P3: Separate suggested vs custom items

Optional but useful:

- recommended defaults
- custom user-added items

---

## 10. Memory Timeline

### Task M1: Add dedicated memory creation

Support:

- note memory
- visited place memory
- expense event memory
- photo memory if later supported

### Task M2: Improve timeline grouping

Show:

- grouped by date/day
- icon per event type
- nicer visual chronology

### Task M3: Make timeline truly derived

Need better event generation from:

- itinerary visited toggles
- expenses
- wallet events if useful
- user-created notes

---

## 11. Reports and Export

### Task R1: Improve trip report quality

Current issue:

- too plain

Add:

- better layout
- category totals
- member contribution totals
- settlement summary
- wallet summary
- itinerary highlights

### Task R2: Add report accuracy checks

Ensure exported values match:

- current expense totals
- current wallet totals
- current settlements

### Task R3: Add export options

Possible options:

- summary PDF
- member settlement summary
- expense-only report

---

## 12. Settings and Rules

### Task SE1: Add better settings screen

Include:

- app version
- sync status
- offline queue count
- account info
- sign out

### Task SE2: Add stricter Firestore security rules

Important production work:

- only authenticated users
- only trip members can access related trip data
- block random users from editing other trips

---

## 13. UI/UX Polish Tasks

These should happen after core correctness but before calling the app polished.

### Task U1: Improve visual hierarchy

Current problem:

- the app feels too plain

Need:

- stronger section hierarchy
- better spacing rhythm
- more intentional card layouts
- clearer CTA placement

### Task U2: Improve mobile interactions

Need:

- proper touch targets
- sticky actions where useful
- keyboard-safe forms
- better scroll flow

### Task U3: Add better state feedback

Need:

- loading indicators
- empty states
- success states
- error states

### Task U4: Add smooth micro-animations

Use lightly for:

- card entry
- state changes
- timeline transitions

---

## 14. Recommended Sprint Breakdown

### Sprint 1: Make Core Data Correct

- G1
- G2
- T1
- T2
- E1
- E2
- E3
- E4

### Sprint 2: Finish Expense System

- E5
- E6
- E7
- E8
- E9

### Sprint 3: Rebuild Itinerary and Excel Import

- I1
- I2
- I3
- I4
- I5
- X1
- X2
- X3
- X4
- X5

### Sprint 4: Make Group Wallet Useful

- W1
- W2
- W3
- W4
- W5
- W6

### Sprint 5: Complete Trip Management and Settlement

- T3
- T4
- T5
- T6
- S1
- S2
- S3

### Sprint 6: Product Quality Pass

- P1
- P2
- P3
- M1
- M2
- M3
- R1
- R2
- R3
- U1
- U2
- U3
- U4

---

## 15. Definition of "Flawless Enough" For This App

Before calling this app truly strong, the following must all be true:

- trip creation works with structured member entry
- trips can be edited after creation
- expenses save correctly with category, payer, and split type
- no silent Firebase save failures
- itinerary manual entry matches real trip planning fields
- Excel import maps your real spreadsheet correctly
- group wallet has full add/edit/delete functionality
- settlements are understandable and actionable
- packing checklist persists
- reports are accurate
- screens feel polished on mobile

## 16. Immediate Next Tasks To Start Coding

Start here first:

1. rebuild trip member entry model
2. fix expense save flow and category selection
3. add payer selection and split type selection
4. redesign itinerary model to support `From`, `To`, `Date`, `Start Time`, `End Time`, `Activity`, and maps link
5. rewrite Excel parser for your exact sheet structure
6. build real wallet transaction creation flow

These six tasks will remove the biggest current product pain.
