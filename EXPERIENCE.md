# Experience: Building the Incident Management System

## Overview

Building this On-Call Incident Management System was a focused exercise in creating a functional MVP (Minimum Viable Product) that captures the core essence of complex tools like PagerDuty or Opsgenie, without getting bogged down in infrastructure complexity.

## Key Challenges & Solutions

### 1. Modeling Escalation Policies
**Challenge:** The most complex part of the domain is the "Escalation Policy". It requires linking users to services in a specific order.
**Solution:** I modeled this using a relational approach with Prisma. A `Service` has one `EscalationPolicy`, which has many `EscalationSteps`. Each step is linked to a `User`. This normalized structure made querying the "next person on call" straightforward.

### 2. Handling Timeouts without a Background Worker
**Challenge:** Real incident management relies on time-based escalation (e.g., "If not acknowledged in 15 mins, escalate"). Setting up a Redis queue or Cron job felt like overkill for a lightweight demo.
**Solution:** I opted for an **API-driven escalation trigger**. This shifts the responsibility to the client (or a simple external ping) to "check" for escalation. This significantly simplified the backend architecture while still demonstrating the valid business logic of moving an incident to the next level.

### 3. State Management
**Challenge:** Keeping the UI in sync with the backend status (e.g., when an incident is resolved).
**Solution:** Using React with a simple polling mechanism (or manual refresh) proved effective enough for this scale. Prisma's strong typing ensuring that the frontend types generated from the backend schema matched perfectly, reducing bugs.

## Reflection

The combination of **Vite + React** and **Node + Prisma + SQLite** was incredibly productive. It allowed for rapid iteration. If I were to do this again for production, I would start with **PostgreSQL** to handle concurrent writes better and implement a proper **Job Queue** (like BullMQ) immediately to handle the time-sensitive nature of SLAs.

Overall, this project demonstrated that the core logic of incident routing is logical and deterministic, even if the "alerting" part (SMS/Phone) requires external integrations.
