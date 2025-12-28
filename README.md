# Nomad Journal

## Overview

Nomad Journal is a full-stack journaling system built with **Next.js and TypeScript**. On the surface, it’s a travel journaling app. Under the hood, it’s really an exercise in **designing a clean, maintainable product architecture** that combines frontend UI, backend APIs, authentication, and state management in one cohesive codebase.

The goal of this project was not to build a flashy app, but to model how a real product could be structured and evolved over time without becoming hard to reason about.

---

## Why This Project Exists

As products grow, they often suffer from:

* unclear ownership between frontend and backend logic
* authentication checks scattered everywhere
* APIs that are hard to evolve without breaking clients
* frontend state that becomes difficult to track

Nomad Journal was built to explore how to avoid these problems by being intentional about **boundaries, contracts, and responsibilities** from the start.

---

## Domain Model

The domain is intentionally simple but realistic:

* **Journal** represents a trip, phase, or theme (for example, “Summer 2025 in Europe”).
* **Entry** represents individual records within a journal, with optional metadata like mood, weather, and location.

Journals and entries are owned by a user, and that ownership is enforced consistently at the API level. Domain rules live in service layers rather than being embedded directly in route handlers.

---

## API Design

The backend is implemented using **Next.js route handlers**, exposing a versioned REST API under `/api/v2`.

Key characteristics:

* Resource-oriented endpoints for users, journals, and entries
* Input validation using Zod at API boundaries
* API versioning to allow the system to evolve safely
* An OpenAPI 3 specification (`openapi.yaml`) maintained alongside the code
* Swagger UI exposed via `/api-docs` for easy exploration

The API is treated as a first-class part of the system, not an afterthought.

---

## Authentication & Authorization

Authentication is handled using **JWTs stored in HTTP-only cookies**.

* Auth checks are enforced centrally using custom middleware
* Protected routes fail early when authentication is missing or invalid
* The authenticated user context is resolved once and reused downstream

This keeps authorization logic consistent and avoids spreading auth checks across unrelated parts of the codebase.

---

## Frontend Architecture

The frontend uses the **Next.js App Router** and is structured around responsibility rather than pages alone.

The main dashboard uses a three-column layout:

* left column for journals and navigation
* middle column for composing and viewing entries (list, calendar, map)
* right column for journal details and editing

This layout was chosen deliberately to simulate the kind of state coordination and UI complexity found in real SaaS dashboards.

---

## State Management Strategy

State is handled with clear intent:

* server-derived data comes from the API
* shared dashboard state (active journal, entries, current user) is managed with Zustand
* local UI state stays inside components

This approach avoids overusing global state while still allowing different parts of the dashboard to stay in sync.

---

## Failure & Edge Cases

The system handles common product-level failures in predictable ways:

* unauthenticated requests are rejected or redirected early
* invalid input is caught at validation boundaries
* API errors are returned in a consistent shape

The focus is on clarity and debuggability rather than exhaustive fault tolerance.

---

## Tradeoffs

Some conscious tradeoffs made in this project:

* REST APIs were chosen over GraphQL to keep the system simple and explicit
* Backend logic lives inside the Next.js app instead of a separate service to reduce overhead
* Zustand was chosen over heavier state solutions to keep mental complexity low

These choices optimize for maintainability and product velocity rather than maximum flexibility.

---

## Code Quality

The codebase is written in **TypeScript** and enforces consistency through ESLint and Prettier. The focus is on making the system easy to read and safe to change by someone new to the project.

---

## What This Project Shows

* Ownership of a real product domain
* Practical full-stack architecture using Next.js
* Clear API and auth boundaries
* Thoughtful state management in a non-trivial UI

This project reflects how I think about building systems that are meant to be understood, maintained, and extended over time.
