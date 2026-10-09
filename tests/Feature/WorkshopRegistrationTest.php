<?php

namespace Tests\Feature;

use App\Models\Registration;
use App\Models\User;
use App\Models\Workshop;
use App\Services\RegistrationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class WorkshopRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $manager;
    protected User $staff;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $this->manager = User::create([
            'name' => 'Manager User',
            'email' => 'manager@test.com',
            'password' => bcrypt('password'),
            'role' => 'manager',
        ]);

        $this->staff = User::create([
            'name' => 'Staff User',
            'email' => 'staff@test.com',
            'password' => bcrypt('password'),
            'role' => 'staff',
        ]);
    }

    #[Test]
    public function strict_capacity_limit_is_enforced_and_overbooking_is_prevented()
    {
        $workshop = Workshop::create([
            'code' => 'TEST-101',
            'title' => 'Limited Capacity Workshop',
            'instructor' => 'Test Instructor',
            'location' => 'Main Branch',
            'scheduled_at' => now()->addDay(),
            'capacity' => 2,
            'status' => 'scheduled',
            'created_by_user_id' => $this->manager->id,
        ]);

        $service = new RegistrationService();

        // 1. First registration (1/2) -> Success
        $service->registerAttendee($workshop, [
            'attendee_name' => 'Attendee 1',
            'attendee_email' => 'att1@test.com',
        ], $this->staff);

        // 2. Second registration (2/2) -> Success
        $service->registerAttendee($workshop, [
            'attendee_name' => 'Attendee 2',
            'attendee_email' => 'att2@test.com',
        ], $this->staff);

        $this->assertEquals(2, $workshop->fresh()->active_registrations_count);

        // 3. Third registration (3/2) -> Must throw ValidationException!
        $this->expectException(ValidationException::class);

        $service->registerAttendee($workshop, [
            'attendee_name' => 'Attendee 3',
            'attendee_email' => 'att3@test.com',
        ], $this->staff);
    }

    #[Test]
    public function cancelling_registration_frees_seat_and_preserves_historical_record()
    {
        $workshop = Workshop::create([
            'code' => 'TEST-102',
            'title' => 'Cancellation Test Workshop',
            'instructor' => 'Test Instructor',
            'location' => 'Main Branch',
            'scheduled_at' => now()->addDay(),
            'capacity' => 5,
            'status' => 'scheduled',
            'created_by_user_id' => $this->manager->id,
        ]);

        $service = new RegistrationService();

        $registration = $service->registerAttendee($workshop, [
            'attendee_name' => 'John Doe',
            'attendee_email' => 'john@test.com',
        ], $this->staff);

        $this->assertEquals(1, $workshop->fresh()->active_registrations_count);

        // Cancel registration
        $service->cancelRegistration($registration, $this->staff);

        // Active registration count should decrease to 0
        $this->assertEquals(0, $workshop->fresh()->active_registrations_count);

        // Historical record must still exist in database
        $this->assertDatabaseHas('registrations', [
            'id' => $registration->id,
            'status' => 'cancelled',
            'cancelled_by_user_id' => $this->staff->id,
        ]);
    }

    #[Test]
    public function backend_enforces_permissions_matrix_strictly()
    {
        // 1. Staff cannot create workshops -> 403
        $this->actingAs($this->staff)
            ->post('/workshops', [
                'code' => 'FAIL-101',
                'title' => 'Unauthorized Workshop',
                'instructor' => 'Fake',
                'location' => 'Branch',
                'scheduled_at' => now()->addDays(2)->toDateTimeString(),
                'capacity' => 10,
                'status' => 'scheduled',
            ])
            ->assertStatus(403);

        // 2. Staff cannot create users -> 403
        $this->actingAs($this->staff)
            ->post('/users', [
                'name' => 'Hacker User',
                'email' => 'hacker@test.com',
                'password' => 'password123',
                'role' => 'admin',
            ])
            ->assertStatus(403);

        // 3. Manager can create workshop -> 302 (Redirect with success)
        $this->actingAs($this->manager)
            ->post('/workshops', [
                'code' => 'MGR-101',
                'title' => 'Manager Workshop',
                'instructor' => 'Valid Instructor',
                'location' => 'Main Branch',
                'scheduled_at' => now()->addDays(2)->toDateTimeString(),
                'capacity' => 10,
                'status' => 'scheduled',
            ])
            ->assertStatus(302);

        // 4. Admin can create user -> 302
        $this->actingAs($this->admin)
            ->post('/users', [
                'name' => 'New Staff',
                'email' => 'newstaff@test.com',
                'password' => 'password123',
                'role' => 'staff',
            ])
            ->assertStatus(302);
    }
}
