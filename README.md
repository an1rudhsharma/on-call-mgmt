# Incident Management System

A simple but functional on-call incident management system with escalation policies.

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js, Express
- **Database:** SQLite
- **ORM:** Prisma


## Design & Architecture

### Architecture Overview

The system follows a standard **Client-Server architecture**:

- **Frontend (Client):** Built with **React** and **Vite** for a fast, responsive user interface. It communicates with the backend via a REST API.
- **Backend (Server):** Built with **Node.js** and **Express**. It handles business logic (incident creation, escalation, on-call resolution) and API requests.
- **Database:** **SQLite** managed via **Prisma ORM**. This provides a reliable, relational data store with zero configuration overhead, perfect for development and testing.

### Key Design Decisions

1.  **Monolithic API Structure:** All business logic resides in a centralized route handler (`routes.ts`). For an MVP, this reduces complexity and makes it easier to trace flow between valid services, policies, and incidents without jumping between multiple controller files.
2.  **Manual Escalation Triggers:** To keep the infrastructure simple and avoid heavy background worker dependencies (like Redis/BullMQ), escalation is currently modeled as an API-driven action. This allows testing of the "escalation" logic immediately without waiting for timeouts.
3.  **Relational Data Model:** Using SQL (via Prisma) ensures data integrity between Services, Policies, and Incidents. This is critical for an incident management system where "who is on call" must always be strictly defined.


### Known Limitations

-   **No Background Automation:** Escalation timeouts are not automatically enforced by a background job runner. They must be triggered via the UI or API.
-   **No Authentication:** The system assumes a trusted environment; there is no user login or role-based access control.
-   **No Real-Time Sockets:** Updates (like a new incident appearing) rely on manual refresh or frontend polling, rather than real-time WebSockets.
-   **SQLite Database:** While excellent for development, SQLite is file-based and not suitable for high-concurrency production environments compared to PostgreSQL.

## Feature Implementation Details

### 1. On-Call Management

The system represents on-call schedules using a flexible **Escalation Policy** model rather than fixed calendar dates. This simplifies rotation management.

*   **Data Model:**
    *   **Service:** Represents a monitored entity (e.g., "Database", "Frontend").
    *   **Escalation Policy:** Linked to a service. Contains an ordered list of **Escalation Steps**.
    *   **User:** A responder who can be assigned to a step.
*   **Determining Who is On-Call:**
    *   The system calculates the "Primary On-Call" by fetching the policy associated with a service and selecting the user at **Step 1** (lowest order).
    *   In the UI dashboard, this is visualized by querying `/api/services/oncall`.

### 2. Incident Handling

Incidents track the lifecycle of an alert from creation to resolution.

*   **Incident Creation (Mocking Alerts):**
    *   Incidents are created via a `POST /api/incidents` request.
    *   This simulates an alert coming from an external monitoring tool (like Prometheus or Datadog).
    *   **State Tracking:** Every incident initializes with a status of `TRIGGERED`.
    *   **Assignment:** Upon creation, the system automatically assigns the incident to the user defined in Step 1 of the Service's Escalation Policy.
*   **Status Workflow:**
    *   **Triggered:** The incident is active and needs attention.
    *   **Acknowledged:** The responder has seen the alert (`PATCH /api/incidents/:id` with status `ACKNOWLEDGED`).
    *   **Resolved:** The issue is fixed (`PATCH /api/incidents/:id` with status `RESOLVED`).

### 3. Alerting & Escalation

The system ensures incidents are not ignored through an escalation mechanism.

*   **Notification (Alerting):**
    *   When an incident is created or escalated, the backend logs a formatted message to the console: `🚨 Incident #123 assigned to Alice`.
    *   In a production environment, this function would be replaced with calls to an SMS provider (Twilio) or Email service (SendGrid).
*   **Escalation Logic:**
    *   **Trigger:** If a responder does not acknowledge within a set time (simulated manually in this MVP), the incident escalates.
    *   **Implementation:** The API endpoint `POST /api/incidents/:id/escalate` handles this logic:
        1.  It checks the incident's current escalation level (e.g., Step 1).
        2.  It looks for the next step in the policy (Step 2).
        3.  If found, it re-assigns the incident to the User at Step 2 and resets the status to `TRIGGERED` to alert them.
        4.  If no further steps exist, it logs that max escalation has been reached.

### Future Improvements

With more time, the following improvements would be prioritized:
1.  **Automated Escalation Worker:** Implement a background job runner (e.g., using `node-cron` or `BullMQ`) to automatically trigger escalations when SLAs are breached.
2.  **Real-Time Updates:** Integrate `Socket.io` to push new incidents and status changes to the dashboard instantly.
3.  **Authentication & RBAC:** Add JWT-based authentication to secure endpoints and ensure only on-call users can resolve incidents.
4.  **Notification Integrations:** Add actual integrations with Slack, Email (SendGrid), or SMS (Twilio) to notify users.

## How to Run

### prerequisites
- Node.js installed

### 1. Backend

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize Database (Run Migrations):
   ```bash
   npm run prisma:migrate
   ```
4. Seed the database (optional but recommended for demo data):
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3001`

### 2. Frontend

1. Navigate to the client directory (open a new terminal):
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the client:
   ```bash
   npm run dev
   ```
   Client runs on `http://localhost:5173` (or port shown in terminal)

## Endpoints

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create a service

### Escalation Policies
- `GET /api/policies` - List all policies
- `POST /api/policies` - Create a policy

### Incidents
- `GET /api/incidents` - List all incidents
- `POST /api/incidents` - Trigger an incident
- `PATCH /api/incidents/:id` - Acknowledge/Resolve incident
- `POST /api/incidents/:id/escalate` - Manually escalate incident

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user

### On-Call
- `GET /api/services/oncall` - Get current on-call dashboard data

## Experience: Building the Incident Management System

### Overview

Building this On-Call Incident Management System was a focused exercise in creating a functional MVP (Minimum Viable Product) that captures the core essence of complex tools like PagerDuty or Opsgenie, without getting bogged down in infrastructure complexity.

### Key Challenges & Solutions

#### 1. Modeling Escalation Policies
**Challenge:** The most complex part of the domain is the "Escalation Policy". It requires linking users to services in a specific order.
**Solution:** I modeled this using a relational approach with Prisma. A `Service` has one `EscalationPolicy`, which has many `EscalationSteps`. Each step is linked to a `User`. This normalized structure made querying the "next person on call" straightforward.

#### 2. Handling Timeouts without a Background Worker
**Challenge:** Real incident management relies on time-based escalation (e.g., "If not acknowledged in 15 mins, escalate"). Setting up a Redis queue or Cron job felt like overkill for a lightweight demo.
**Solution:** I opted for an **API-driven escalation trigger**. This shifts the responsibility to the client (or a simple external ping) to "check" for escalation. This significantly simplified the backend architecture while still demonstrating the valid business logic of moving an incident to the next level.

#### 3. State Management
**Challenge:** Keeping the UI in sync with the backend status (e.g., when an incident is resolved).
**Solution:** Using React with a simple polling mechanism (or manual refresh) proved effective enough for this scale. Prisma's strong typing ensuring that the frontend types generated from the backend schema matched perfectly, reducing bugs.

### Reflection

The combination of **Vite + React** and **Node + Prisma + SQLite** was incredibly productive. It allowed for rapid iteration. If I were to do this again for production, I would start with **PostgreSQL** to handle concurrent writes better and implement a proper **Job Queue** (like BullMQ) immediately to handle the time-sensitive nature of SLAs.

Overall, this project demonstrated that the core logic of incident routing is logical and deterministic, even if the "alerting" part (SMS/Phone) requires external integrations.

## AI Usage in Development

### Overview

This project was developed with the assistance of AI tools to accelerate the coding, debugging, and documentation phases. Below is a summary of how AI was leveraged.

### 1. Architectural Scaffolding
AI was used to propose the initial data schema for Prisma. By describing the requirements ("Services have policies, policies have steps with users"), the AI generated a robust `schema.prisma` file with correct relationships (@relation), saving time on boilerplate syntax errors.

### 2. Code Generation vs. Logic
- **Boilerplate:** AI handled the repetitive setup of the Express server, CORS configuration, and basic CRUD routes.
- **Complex Logic:** For the escalation logic (`routes.ts`), AI provided a template for finding the "next step" in an array. I refined this to ensure it correctly handled the "End of Policy" case (when no one else is left to escalate to).

### 3. Debugging
During development, we encountered module resolution errors (e.g., specific to Vite's CSS handling or TSConfig paths). AI analyzed the error messages and suggested targeted fixes, such as adjusting `tsconfig.json` or ensuring `package.json` dependencies were correctly installed in the nested client directory.

### 4. Documentation
AI was instrumental in generating the comprehensive `README.md` and this usage report. It summarized the codebase structure, identified key design decisions (like the lack of background workers), and formatted the information into clean, readable Markdown.

### Conclusion
The AI acted as a "Pair Programmer," handling the tedious setup and syntax lookup tasks, allowing the focus to remain on the business logic of Incident Management. It significantly reduced the time-to-MVP.
