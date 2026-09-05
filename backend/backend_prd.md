
PeoplePay360 — HR & Payroll Platform
Shared Project Context (same for all 3 teammates)
Team Size: 3 · Roles: Frontend/Design · Backend/Database · ML/Intelligent Layer Stack: React · Express · PostgreSQL · Python (ML) Mockup Reference: [https://app.excalidraw.com/l/65VNwvy7c4X/17vHpCNFjex](https://app.excalidraw.com/l/65VNwvy7c4X/17vHpCNFjex)
This file section is identical across all three teammates' briefs — it's the shared "what and why" every AI generator session should have as context, before the module-specific "how" that follows further down in this file.

1. Problem Statement — Explained
   PeoplePay360 is an integrated HR and Payroll Operations Platform — not disconnected CRUD screens, but a system where every module feeds the next:
   Employee records are the central hub.
   Contracts and Working Schedules give payroll the correct context for a time period.
   Attendance and Time Off capture day-to-day activity, including exceptions.
   Salary Structures and Salary Rules define how earnings, deductions, and net pay are computed — in a defined sequence.
   Payruns turn a batch of eligible employees into validated, printable, emailable Payslips.
   A Payroll Dashboard aggregates all of the above live, filterable by period, department, and employee type.
   Why it's genuinely hard:
   Challenge
   Why It Matters
   Period-specific contract selection
   An employee can have multiple contracts over time; payroll must resolve only the one valid for the selected period.
   Leave balance computation
   Balances depend on approved allocations minus consumed leave — cascading logic across tables.
   Salary rule sequencing
   Rules execute in order (Basic → Allowances → Gross → Deductions → Net); later rules reference earlier results.
   Attendance exceptions
   Missing check-outs, overtime, manual corrections must not break payroll accuracy.
   Payroll warning detection
   Must proactively catch duplicate payslips, missing bank details, or contract gaps before finalization.
   Role-based access
   5 roles across 6+ modules, enforced at both API and UI level.
   Ground rules from the official problem statement: any stack is allowed (evaluated on business logic, not tech choice); business rules live in application code, not hardcoded values; Salary Rules must actually drive payslip generation, not static mockups; Dashboard must be live, not static; PDF + bulk email delivery is required; final delivery is a 5-minute live demo of two end-to-end scenarios plus a brief future roadmap.
2. Vision & USP
   Vision: Build the most operationally complete, AI-augmented HR & Payroll platform in the hackathon — one that doesn't just store HR data, but actively reasons about it.
   USP
   What It Means
   U1 — True end-to-end flow
   Employee → Contract → Schedule → Attendance → Leave → Salary Rules → Payslip is one unbroken chain.
   U2 — AI-powered intelligence layer
   A dedicated ML microservice adds anomaly detection, forecasting, prediction, and an NLP query assistant — most teams won't have this.
   U3 — Period-safe payroll engine
   Contract resolution by period enforced in code; no two concurrent ACTIVE contracts per employee.
   U4 — Real-time live dashboard
   Every KPI/chart/alert re-queries the DB at request time; filters are real.
   U5 — Professional PDF + bulk email delivery
   Print-quality payslip PDFs, one-click bulk distribution from the Payrun.
   U6 — Five-role RBAC, enforced twice
   Checked at both API middleware and UI rendering layers.
3. User Roles & Permissions
   Role
   Permissions
   👤 Employee
   View own profile, attendance, leave balances. Create own attendance entries and Time Off requests.
   👔 HR Manager
   Full CRUD on Employees, Attendance, Contracts, Working Schedules, Time Off. Approve/refuse leave. No payroll access.
   💼 HR Payroll User
   All HR Manager permissions + C/R/U on Payruns and Payslips + read-only Salary Structures & Rules.
   🏦 HR Payroll Manager
   All HR Payroll User permissions + full CRUD on Payruns, Payslips, Salary Structures, Salary Rules.
   🔑 Admin
   Full access to every module/model, plus user management and system administration.
   Enforcement rule: every permission is checked in two places — Express RBAC middleware (rejects unauthorized API calls) and React UI (hides/disables controls). Neither layer alone is sufficient.
4. Functional Requirements — Full Module Map
   A — Configuration & Master Data
   A1 Employee Master: Kanban/List/Form views; fields incl. department, manager, schedule, status, bank details; status lifecycle Active → On Leave → Terminated; smart-button counters to related records.
   A2 Contract Management: Full history, never deleted only superseded; no concurrent ACTIVE contracts; payroll resolves period-valid contract.
   A3 Working Schedule: Weekly pattern (Day/Start/End/Break); auto-calculated total hours; assignable to employee or contract.
   A4 Time Off: Types (unit, approval workflow, allocation requirement, carry-over); Allocations (HR-created, approval-gated, taken/remaining/validity); Requests (employee-initiated, approve/refuse, auto-deduct on approval).
   A5 Salary Structure: Named ordered collection of Salary Rules; drives computation for every payslip in a Payrun using that structure.
   A6 Salary Rule Engine: Name/Code/Category (Basic/Allowance/Gross/Deduction/Net)/Sequence/Computation (Fixed, Percentage of another rule, Formula referencing prior codes); executes in ascending sequence.
   A7 Dashboard Config: Live aggregation, filters by Period/Department/Employee Type, no cached/static values.
   B — Operational Frontend Flow
   B1–B2 Navigation & Employee Views: Top nav (Employees/Contracts/Attendance/Time Off/Payroll/Reports); Employee Form as operational hub with smart-button navigation.
   B3 Attendance: Global + per-employee views; Check In/Out, Worked Hours, Status; manual correction with full audit trail.
   B4 Time Off Requests: List (Employee/Type/Dates/Duration/Status); single-click Approve/Refuse; auto balance deduction.
   B5 Payrun Wizard (2-Step): Step 1 Structure+Period → Continue; Step 2 explicit employee selection → Create Payrun. No record exists before confirmation.
   B6 Payrun Processing: Compute → Validate → Mark Paid → Send Payslips; status lifecycle Draft→Computed→Validated→Paid; warning panel before finalization; finalized runs immutable.
   B7 Payslip & Computation: Employee/Structure/Payrun/Period/Status/Worked Days; full rule-by-rule breakdown; auto-resolves contract + structure from parent Payrun.
   B8 PDF & Email: Individual "Print Payslip" PDF; bulk "Send Payslips" email with delivery-status log and missing-email fallback warning.
   B9 Payroll Dashboard: KPI cards (Total Net Salary, Payslips Generated, Average Salary, Approved Time Off, Attendance Health); charts (Salary Cost by Department bar, Monthly Net Salary Trend line); alerts; Attendance Overview; Department breakdown; full filters.
   C — ML / Intelligent Layer (our team's chosen USP — not mandated by the PS, added for differentiation)
   Feature
   Approach
   Smart Payroll Warning Engine
   Rule-based scoring: duplicates, salary jump >25% vs 3-month avg, missing bank/email, expired contracts → 0–100 readiness score.
   Attendance Anomaly Detection
   Z-score on check-in delta from scheduled start; flags bulk-identical check-ins.
   Attendance Health Score
   Aggregates late/absent/missing-checkout/overtime rates per employee & department.
   Leave Pattern Prediction
   Time-series over historical leave requests per department; "predicted peak" surfacing.
   Salary Cost Forecasting
   Regression over historical payrun totals + headcount/contracts; projected-vs-actual with confidence range.
   Attrition Risk Indicator
   Weighted scoring (attendance irregularity, leave frequency, contract type, salary growth) → Low/Medium/High.
   NLP Payroll Query Assistant
   LLM-powered chat widget; plain-English question → safe parameterized query → plain-English answer.
   Demo priority if time-constrained: Smart Payroll Warning Engine + NLP Query Assistant + Attendance Anomaly Detection.
5. Tech Stack (Confirmed)
   Layer
   Technology
   Frontend
   React + TypeScript + Vite + Tailwind CSS + React Query + React Hook Form + Recharts
   Backend
   Node.js + Express + TypeScript + Prisma ORM
   Database
   PostgreSQL
   ML Service
   Python + FastAPI + scikit-learn + statsmodels + pandas
   Auth
   JWT, role claim embedded in token
   PDF
   Puppeteer (server-side HTML → PDF)
   Email
   Nodemailer
   Service Comms
   Frontend → Backend only. Backend → ML Service over internal HTTP. Frontend never calls ML directly.
6. Team & Work Division
   Person
   Owns
   Core Responsibility
   Person 1 — Frontend/Design
   frontend/
   All UI views (A1–A7 rendering, B1–B9), design system, RBAC UI enforcement, Dashboard + ML widget rendering
   Person 2 — Backend/Database
   backend/
   Schema (Prisma/Postgres), all REST APIs, RBAC middleware, salary computation engine, PDF generation, bulk email, data seeding
   Person 3 — ML/Intelligent Layer
   ml-service/
   FastAPI microservice, all 7 ML/NLP features, model fitting on synthetic seeded data, ML API contract
7. Monorepo Folder Structure
   peoplepay360/ ├── frontend/ │ ├── src/ │ │ ├── app/ # App shell, router, layout │ │ ├── components/ # Reusable primitives: Button, Card, Table, Modal, Badge │ │ ├── features/ │ │ │ ├── auth/ employees/ contracts/ schedules/ timeoff/ attendance/ │ │ │ ├── payroll/ # structures, rules, payrun wizard, payslips │ │ │ └── dashboard/ # KPIs, charts, ML widgets │ │ ├── api/ # axios instance + typed API functions │ │ ├── hooks/ store/ types/ │ │ ├── package.json vite.config.ts │ ├── backend/ │ ├── src/ │ │ ├── modules/ (auth/ employees/ contracts/ schedules/ timeoff/ attendance/ payroll/ payrun/ dashboard/) │ │ ├── middleware/ # jwt.middleware.ts, rbac.middleware.ts │ │ ├── services/ # pdf.service.ts, email.service.ts, ml-client.service.ts │ │ ├── db/seed.ts routes/index.ts server.ts │ ├── prisma/schema.prisma, migrations/ │ ├── package.json │ ├── ml-service/ │ ├── app/ │ │ ├── routers/ # warnings.py, anomalies.py, forecast.py, risk.py, nlp.py, predictions.py │ │ ├── models/ services/ schemas.py main.py │ ├── requirements.txt seed_synthetic_data.py │ ├── shared/ │ ├── api-contracts/ │ │ ├── openapi.yaml # Person 2 owns updates; others only read │ │ ├── ml-endpoints.md # Person 3 documents ML request/response shapes │ │ └── CHANGE-REQUESTS.md # anyone appends a request; owner actions it │ └── types/ # generated/mirrored shared TS/pydantic types │ ├── docs/ (this file + companion briefs) ├── docker-compose.yml # postgres + redis (optional) ├── .env.example └── README.md
8. Ownership Rule, Git Workflow & Shared Contract Handshake
   Ownership rule: a person's AI generator prompt only ever writes files inside their own top-level folder, or inside shared/ via the handshake below. If Person 1 needs a new backend field, they don't touch backend/ — they add a line to shared/api-contracts/CHANGE-REQUESTS.md and ping Person 2.
   Git workflow:
   main — always demo-able, protected. dev — daily integration branch.
   Feature branches: fe/<module-number></module>-<slug></slug>, be/<module-number></module>-<slug></slug>, ml/<module-number></module>-<slug></slug>.
   One module = one branch = one PR into dev, but many small commits inside it — one commit per fraction. This is what shows step-by-step work instead of one mega-commit.
   Commit format: [FE-03.2] Employee list wired to /employees API with loading state.
   Rebase on dev before opening a PR. Nobody force-pushes to dev/main.
   Shared contract handshake:
   Person 2 writes the DB schema + first-pass OpenAPI contract in Module BE-02, committed to shared/api-contracts/openapi.yaml immediately.
   Person 1 and Person 3 build against that contract with mocked responses — never blocked waiting on Person 2.
   Mid-build contract changes go through shared/api-contracts/CHANGE-REQUESTS.md (who/what/why); the folder owner actions it and clears the entry.
   ML endpoints follow the same pattern in shared/api-contracts/ml-endpoints.md, owned by Person 3, consumed by Person 2's ml-client.service.ts.
9. Build Method — Fractioned Development (mandatory)
   Because all three of us are heavily relying on AI code generators (Antigravity/Claude Code/etc.), no module is ever built with a single prompt. Every module is broken into fractions (typically 2–4), and each fraction:
   Gets its own prompt, scoped only to files needed for that fraction.
   Produces a reviewable diff before being accepted.
   Ends in its own git commit tagged [XX-NN.N].
   This keeps git history showing genuine incremental engineering and keeps merge conflicts near-zero since fractions stay inside one person's folder. Your own module-by-module fraction prompts are in Part 2 of this file, below.
10. Data Model (Entity Summary)
    Entity
    Key Fields & Relationships
    Employee
    id, name, email, department_id, manager_id (self-ref), schedule_id, job_position, status, bank_details
    Contract
    id, employee_id, start_date, end_date, wage, department_id, job_position, salary_structure_id, status
    WorkingSchedule
    id, name, type, lines[] → {day, start_time, end_time, break_mins}
    TimeOffType
    id, name, unit, requires_allocation, approval_mode, carry_over
    Allocation
    id, employee_id, type_id, number_of_days, date_from, date_to, status, taken, remaining
    LeaveRequest
    id, employee_id, type_id, allocation_id, date_from, date_to, duration, status, approver_id
    Attendance
    id, employee_id, check_in, check_out, worked_hours, status, is_corrected, original_check_in, corrected_by
    SalaryStructure
    id, name, is_active, rules[] → SalaryRule
    SalaryRule
    id, structure_id, name, code, category, sequence, computation, amount, percentage_base_code, formula
    Payrun
    id, name, structure_id, period_start, period_end, status, created_by
    Payslip
    id, payrun_id, employee_id, contract_id, status, worked_days, net_amount, lines[] → PayslipLine
    PayslipLine
    id, payslip_id, rule_id, rule_name, category, amount
    User
    id, employee_id (1-to-1), email, password_hash, role
11. Deliverables & Demo
    Fully operational platform, seeded data (20+ employees, 3+ departments, 6 months history, 3+ completed payruns).
    All 5 roles working with access restrictions enforced at API + UI level.
    Payslip PDF + bulk email delivery working end-to-end.
    Live Payroll Dashboard — every KPI/chart/alert reflecting real data.
    ML service live with at minimum: Smart Payroll Warnings, NLP Query Assistant, Attendance Health Score.
    5-minute Demo Day walkthrough, two end-to-end scenarios, plus a brief future roadmap.
    Demo A — Employee-to-Payslip: HR Payroll Manager → create employee → schedule + contract → Payrun wizard → Compute → review warnings/readiness score → Validate → Mark Paid → Print Payslip → Send Payslips. Demo B — Leave + ML Insights: Allocation → employee leave request → HR Manager approves (balance deducts) → Dashboard: Leave Prediction, Attendance Health Score, Attrition Risk column, live NLP query.
    Part 2 — Person 2 (Backend/Database): Your Module Breakdown & Prompts
    You own backend/. Never ask the AI generator to write files outside it — for frontend/ML needs, they'll come to you via the shared contract handshake in §8 above. Work through the modules in order; within a module, run one fraction at a time, review the diff, commit, then move to the next fraction.
