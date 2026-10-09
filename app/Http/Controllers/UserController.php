<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display listing of staff accounts (Admin only).
     */
    public function index(): Response
    {
        $users = User::orderBy('created_at', 'desc')->get();

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created user account (Admin only).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', Password::defaults()],
            'role' => 'required|in:admin,manager,staff',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        AuditLog::record(
            $request->user(),
            'user_created',
            "Created user account {$user->email} with role {$user->role}",
            ['user_id' => $user->id, 'role' => $user->role]
        );

        return redirect()->back()->with('success', 'User account created successfully.');
    }

    /**
     * Update user role (Admin only).
     */
    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|in:admin,manager,staff',
        ]);

        $oldRole = $user->role;
        $user->update(['role' => $validated['role']]);

        AuditLog::record(
            $request->user(),
            'role_updated',
            "Updated role for {$user->email} from {$oldRole} to {$user->role}",
            ['user_id' => $user->id, 'old_role' => $oldRole, 'new_role' => $user->role]
        );

        return redirect()->back()->with('success', 'User role updated successfully.');
    }
}
