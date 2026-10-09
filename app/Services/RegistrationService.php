<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Registration;
use App\Models\User;
use App\Models\Waitlist;
use App\Models\Workshop;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RegistrationService
{
    /**
     * Register an attendee to a workshop with pessimistic concurrency locking.
     */
    public function registerAttendee(Workshop $workshop, array $data, User $staffUser): Registration
    {
        return DB::transaction(function () use ($workshop, $data, $staffUser) {
            // Lock the workshop row to prevent concurrent overbooking
            $lockedWorkshop = Workshop::where('id', $workshop->id)->lockForUpdate()->firstOrFail();

            if ($lockedWorkshop->status !== 'scheduled') {
                throw ValidationException::withMessages([
                    'workshop' => 'Registrations are only allowed for scheduled workshops.',
                ]);
            }

            // Count active registrations within the locked transaction
            $activeCount = Registration::where('workshop_id', $lockedWorkshop->id)
                ->where('status', 'active')
                ->count();

            if ($activeCount >= $lockedWorkshop->capacity) {
                throw ValidationException::withMessages([
                    'attendee_email' => "Workshop capacity reached ({$lockedWorkshop->capacity} seats). No seats remaining.",
                ]);
            }

            // Prevent duplicate active registration for the same attendee email in the same workshop
            $existing = Registration::where('workshop_id', $lockedWorkshop->id)
                ->where('attendee_email', strtolower(trim($data['attendee_email'])))
                ->where('status', 'active')
                ->first();

            if ($existing) {
                throw ValidationException::withMessages([
                    'attendee_email' => 'This attendee is already registered for this workshop.',
                ]);
            }

            $registration = Registration::create([
                'workshop_id' => $lockedWorkshop->id,
                'attendee_name' => trim($data['attendee_name']),
                'attendee_email' => strtolower(trim($data['attendee_email'])),
                'status' => 'active',
                'registered_by_user_id' => $staffUser->id,
                'registered_at' => now(),
            ]);

            AuditLog::record(
                $staffUser,
                'attendee_registered',
                "Registered {$registration->attendee_name} ({$registration->attendee_email}) for {$lockedWorkshop->code} - {$lockedWorkshop->title}",
                ['registration_id' => $registration->id, 'workshop_id' => $lockedWorkshop->id]
            );

            return $registration;
        });
    }

    /**
     * Cancel an active registration and auto-promote waitlisted attendee if present.
     */
    public function cancelRegistration(Registration $registration, User $staffUser): Registration
    {
        return DB::transaction(function () use ($registration, $staffUser) {
            if ($registration->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'registration' => 'This registration is already cancelled.',
                ]);
            }

            $registration->update([
                'status' => 'cancelled',
                'cancelled_by_user_id' => $staffUser->id,
                'cancelled_at' => now(),
            ]);

            AuditLog::record(
                $staffUser,
                'registration_cancelled',
                "Cancelled registration for {$registration->attendee_name} in workshop {$registration->workshop->code}",
                ['registration_id' => $registration->id]
            );

            // Auto-promote first waiting person on waitlist if available
            $nextWaitlist = Waitlist::where('workshop_id', $registration->workshop_id)
                ->where('status', 'waiting')
                ->orderBy('id', 'asc')
                ->first();

            if ($nextWaitlist) {
                Registration::create([
                    'workshop_id' => $registration->workshop_id,
                    'attendee_name' => $nextWaitlist->attendee_name,
                    'attendee_email' => $nextWaitlist->attendee_email,
                    'status' => 'active',
                    'registered_by_user_id' => $staffUser->id,
                    'registered_at' => now(),
                ]);

                $nextWaitlist->update(['status' => 'promoted']);

                AuditLog::record(
                    $staffUser,
                    'waitlist_promoted',
                    "Auto-promoted {$nextWaitlist->attendee_name} from waitlist to freed seat in {$registration->workshop->code}"
                );
            }

            return $registration;
        });
    }

    /**
     * Add attendee to waitlist when workshop is at full capacity.
     */
    public function addToWaitlist(Workshop $workshop, array $data, User $staffUser): Waitlist
    {
        return DB::transaction(function () use ($workshop, $data, $staffUser) {
            $waitlist = Waitlist::create([
                'workshop_id' => $workshop->id,
                'attendee_name' => trim($data['attendee_name']),
                'attendee_email' => strtolower(trim($data['attendee_email'])),
                'status' => 'waiting',
                'added_by_user_id' => $staffUser->id,
            ]);

            AuditLog::record(
                $staffUser,
                'waitlist_added',
                "Added {$waitlist->attendee_name} to waitlist for {$workshop->code}"
            );

            return $waitlist;
        });
    }
}
