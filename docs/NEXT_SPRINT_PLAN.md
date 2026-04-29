# TRIP LEDGER Next Sprint Plan

Last updated: 2026-04-13

This document is the immediate action plan for the next coding sessions.

## Main Goal

Move the app from:

- compile-clean scaffold

to:

- reliable core trip workflow

## Sprint Theme

Fix correctness before polish.

## Sprint 1 Scope

### 1. Trip data model upgrade

Deliverables:

- structured member form
- trip edit support
- better validation

### 2. Expense flow correction

Deliverables:

- category selection fixed
- payer selector added
- proper Firebase save handling
- split type selector added

### 3. Itinerary data redesign

Deliverables:

- support route-based trip plan entries
- manual itinerary form aligned with real travel planning format

### 4. Excel import rewrite

Deliverables:

- exact mapping for:
  - Day
  - Date
  - Start Time
  - From
  - End Time
  - To
  - Distance (km)
  - Travel Time
  - Time Spent
  - Activity
  - Google Maps

### 5. Wallet usability baseline

Deliverables:

- wallet transaction create flow
- correct totals
- member contribution visibility

## Tasks In Order

1. update `Trip` and member-related types
2. create reusable member form row component
3. rebuild create/edit trip screens
4. fix expense category selection and save payload
5. add payer and participant selectors
6. integrate split type UI
7. redesign `ItineraryItem` type
8. rebuild itinerary add/edit form
9. rewrite `excelParser.ts` for the actual spreadsheet format
10. build wallet transaction form

## Expected Outcome After Sprint 1

After this sprint, the app should be able to:

- create a trip properly
- edit a trip properly
- save expenses properly
- import itinerary sheets correctly
- support real itinerary entries manually
- use the wallet in a meaningful way

## Important Rule

Do not start broad UI polishing until these flows are correct:

- trip create/edit
- expense add/edit
- itinerary add/import
- wallet add/view
