<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WaitlistController;
use App\Http\Controllers\WorkshopController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home / Dashboard redirect based on role
Route::get('/', function () {
    if (! Auth::check()) {
        return redirect()->route('login');
    }

    $user = Auth::user();
    if ($user->isAdmin()) {
        return redirect()->route('users.index');
    }

    return redirect()->route('workshops.index');
})->name('home');

Route::get('/dashboard', function () {
    return redirect()->route('home');
})->middleware('auth')->name('dashboard');

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    // Admin-only Routes: User Accounts & Roles
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.update-role');
    });

    // Manager-only Routes: Add & Edit Workshops
    Route::middleware(['role:manager'])->group(function () {
        Route::post('/workshops', [WorkshopController::class, 'store'])->name('workshops.store');
        Route::put('/workshops/{workshop}', [WorkshopController::class, 'update'])->name('workshops.update');
    });

    // Manager & Staff Shared Routes: View Workshops, Register/Cancel Attendees
    Route::middleware(['role:manager,staff'])->group(function () {
        Route::get('/workshops', [WorkshopController::class, 'index'])->name('workshops.index');
        Route::get('/registrations', [RegistrationController::class, 'index'])->name('registrations.index');
        Route::post('/workshops/{workshop}/register', [RegistrationController::class, 'store'])->name('registrations.store');
        Route::post('/registrations/{registration}/cancel', [RegistrationController::class, 'cancel'])->name('registrations.cancel');
        Route::post('/workshops/{workshop}/waitlist', [WaitlistController::class, 'store'])->name('waitlists.store');
    });

    // Audit Logs (Admin & Manager)
    Route::middleware(['role:admin,manager'])->group(function () {
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
