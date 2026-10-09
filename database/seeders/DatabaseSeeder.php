<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Registration;
use App\Models\User;
use App\Models\Workshop;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users
        $admin = User::create([
            'name' => 'System Administrator',
            'email' => 'admin@workshop.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        $manager = User::create([
            'name' => 'Programme Manager (Alice)',
            'email' => 'manager@workshop.com',
            'password' => Hash::make('password123'),
            'role' => 'manager',
        ]);

        $staff1 = User::create([
            'name' => 'Front Desk Staff (Bob)',
            'email' => 'staff@workshop.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
        ]);

        $staff2 = User::create([
            'name' => 'Front Desk Staff (Carol)',
            'email' => 'staff2@workshop.com',
            'password' => Hash::make('password123'),
            'role' => 'staff',
        ]);

        // 2. Seed Workshops
        $ws1 = Workshop::create([
            'code' => 'WS-101',
            'title' => 'Beginner Pottery & Ceramics',
            'instructor' => 'Clara Oswald',
            'location' => 'Downtown Branch',
            'description' => 'Hands-on clay sculpting and wheel throwing workshop for beginners.',
            'scheduled_at' => now()->addDays(1)->setHour(10)->setMinute(0),
            'capacity' => 5,
            'status' => 'scheduled',
            'created_by_user_id' => $manager->id,
        ]);

        $ws2 = Workshop::create([
            'code' => 'WS-102',
            'title' => 'Python & Web API Workshop',
            'instructor' => 'Dr. Marcus Vance',
            'location' => 'Tech Hub Branch',
            'description' => 'Build robust Web APIs using modern Python tools.',
            'scheduled_at' => now()->addDays(2)->setHour(14)->setMinute(0),
            'capacity' => 3,
            'status' => 'scheduled',
            'created_by_user_id' => $manager->id,
        ]);

        $ws3 = Workshop::create([
            'code' => 'WS-103',
            'title' => 'Community Fitness & Pilates',
            'instructor' => 'Sarah Jenkins',
            'location' => 'Westside Branch',
            'description' => 'Energizing group workout and core stability training.',
            'scheduled_at' => now()->addDays(4)->setHour(9)->setMinute(0),
            'capacity' => 8,
            'status' => 'scheduled',
            'created_by_user_id' => $manager->id,
        ]);

        $ws4 = Workshop::create([
            'code' => 'WS-104',
            'title' => 'Watercolor Painting Masterclass',
            'instructor' => 'David Miller',
            'location' => 'Downtown Branch',
            'description' => 'Expressive landscape painting techniques.',
            'scheduled_at' => now()->addDays(7)->setHour(11)->setMinute(0),
            'capacity' => 4,
            'status' => 'scheduled',
            'created_by_user_id' => $manager->id,
        ]);

        // 3. Seed Registrations for WS-101 (4 Active, 1 Cancelled)
        Registration::create([
            'workshop_id' => $ws1->id,
            'attendee_name' => 'John Doe',
            'attendee_email' => 'john.doe@example.com',
            'status' => 'active',
            'registered_by_user_id' => $staff1->id,
            'registered_at' => now()->subHours(5),
        ]);

        Registration::create([
            'workshop_id' => $ws1->id,
            'attendee_name' => 'Jane Smith',
            'attendee_email' => 'jane.smith@example.com',
            'status' => 'active',
            'registered_by_user_id' => $staff2->id,
            'registered_at' => now()->subHours(4),
        ]);

        Registration::create([
            'workshop_id' => $ws1->id,
            'attendee_name' => 'Michael Brown',
            'attendee_email' => 'michael.b@example.com',
            'status' => 'active',
            'registered_by_user_id' => $staff1->id,
            'registered_at' => now()->subHours(3),
        ]);

        Registration::create([
            'workshop_id' => $ws1->id,
            'attendee_name' => 'Emily Davis',
            'attendee_email' => 'emily.d@example.com',
            'status' => 'active',
            'registered_by_user_id' => $staff2->id,
            'registered_at' => now()->subHours(2),
        ]);

        // Cancelled registration example (History record)
        Registration::create([
            'workshop_id' => $ws1->id,
            'attendee_name' => 'Robert Taylor',
            'attendee_email' => 'robert.t@example.com',
            'status' => 'cancelled',
            'registered_by_user_id' => $staff1->id,
            'registered_at' => now()->subHours(10),
            'cancelled_by_user_id' => $staff2->id,
            'cancelled_at' => now()->subHours(1),
        ]);

        // 4. Seed Registrations for WS-102 (3 Active - Capacity 3 = Fully Booked!)
        Registration::create([
            'workshop_id' => $ws2->id,
            'attendee_name' => 'Alice Cooper',
            'attendee_email' => 'alice@example.com',
            'status' => 'active',
            'registered_by_user_id' => $staff1->id,
            'registered_at' => now()->subHours(6),
        ]);

        Registration::create([
            'workshop_id' => $ws2->id,
            'attendee_name' => 'Charlie Day',
            'attendee_email' => 'charlie@example.com',
            'status' => 'active',
            'registered_by_user_id' => $staff2->id,
            'registered_at' => now()->subHours(4),
        ]);

        Registration::create([
            'workshop_id' => $ws2->id,
            'attendee_name' => 'Diana Prince',
            'attendee_email' => 'diana@example.com',
            'status' => 'active',
            'registered_by_user_id' => $staff1->id,
            'registered_at' => now()->subHours(1),
        ]);

        // 5. Seed Audit Trail
        AuditLog::record($admin, 'user_created', "Seeded system users with roles admin, manager, staff");
        AuditLog::record($manager, 'workshop_created', "Created workshop WS-101 (Beginner Pottery & Ceramics)");
        AuditLog::record($staff1, 'attendee_registered', "Registered John Doe for WS-101");
        AuditLog::record($staff2, 'registration_cancelled', "Cancelled registration for Robert Taylor in WS-101");
    }
}
