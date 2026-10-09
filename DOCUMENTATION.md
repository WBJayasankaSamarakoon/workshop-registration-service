# Workshop Registration Service — Design & Architecture Document

## 1. Stack Choices & Rationale
- **Backend Framework**: Laravel 12 (PHP 8.2+)
  - *Why*: Built-in database transaction management, pessimistic locking (`lockForUpdate`), robust middleware authorization, and Eloquent ORM.
- **Frontend Stack**: React 19 + Inertia.js 2.0 + TypeScript + Tailwind CSS (Laravel React Starter Kit)
  - *Why*: Inertia.js links Laravel backend routing directly with React frontend components without client-side API boilerplate or route duplication, creating a fast SPA experience for non-technical staff.
- **Database**: SQLite / MySQL 8.0
  - *Why*: Relational database with full ACID transaction compliance and row-level locking needed for race condition prevention.

---

## 2. Preventing Over-Registration (Concurrency & Race Conditions)

### The Problem
When multiple staff members register phone callers for the last seat at the exact same moment, soft checks like `if (active_count >= capacity)` fail due to concurrent execution windows.

### The Solution (`RegistrationService.php`)
1. **DB Transaction**: Encloses registration logic inside `DB::transaction(...)`.
2. **Pessimistic Row Locking**: Calls `Workshop::where('id', $id)->lockForUpdate()->firstOrFail()`. This locks the workshop row at the database engine level until the transaction commits or rolls back.
3. **Atomic Count Guard**: Re-counts active registrations (`WHERE status = 'active'`) inside the locked transaction.
4. **Validation Guard**: Throws a `ValidationException` (*"Workshop capacity reached"*) if `active_count >= capacity`.
5. **Atomic Write**: Inserts the new registration record safely. Concurrent requests wait for the lock to release and then re-evaluate the updated count.

---

## 3. Access Control & Authorization (RBAC)
All security boundaries are enforced on the **backend via middleware (`EnsureRole.php`)**, preventing unauthorized API requests regardless of UI state:

| Action / Resource | Admin | Manager | Staff | Backend Enforcement |
| :--- | :---: | :---: | :---: | :--- |
| **Create user accounts & set roles** | ✅ Yes | ❌ No | ❌ No | `middleware('role:admin')` |
| **Add & edit workshops** | ❌ No | ✅ Yes | ❌ No | `middleware('role:manager')` |
| **Register & cancel attendees** | ❌ No | ✅ Yes | ✅ Yes | `middleware('role:manager,staff')` |
| **View workshops, registrations & history** | ❌ No | ✅ Yes | ✅ Yes | `middleware('role:manager,staff')` |

*Note: Public user self-registration (`/register`) is disabled. The initial Admin account is pre-seeded, and Admins explicitly provision staff credentials.*

---

## 4. Registration History & Audit Preservation
- **Never Hard-Deleted**: Cancelling a registration updates `status = 'cancelled'`, setting `cancelled_by_user_id` and `cancelled_at` timestamps.
- **Capacity Recovery**: Seat capacity is instantly recalculated upon cancellation (`capacity - active_count`).
- **Audit Logs**: Key actions (account creation, role changes, workshop edits, registrations, cancellations) are recorded in an immutable `audit_logs` table.
- **Waitlist Auto-Promotion**: Cancelling an active seat automatically promotes the next waitlisted attendee in order of registration.

---

## 5. Assumptions & Trade-offs / Skipped Items

### Assumptions Made
- Attendees are walk-in/phone callers represented by Name and Email (no user accounts needed).
- Staff members log into internal dashboard accounts assigned to one of three training centre locations.

### Skipped for Time (3-Hour Challenge Scope)
- **Queued SMTP Emails**: Registration confirmation emails are logged rather than dispatched via external SMTP services.
- **Batch Export**: CSV/Excel export for registration lists.
