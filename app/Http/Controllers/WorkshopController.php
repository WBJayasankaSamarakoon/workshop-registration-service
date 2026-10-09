<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Workshop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkshopController extends Controller
{
    /**
     * Display a listing of workshops with quick search and filters.
     */
    public function index(Request $request): Response
    {
        $query = Workshop::query()->withCount([
            'registrations as active_registrations_count' => function ($q) {
                $q->where('status', 'active');
            }
        ]);

        // Filter by keyword search (Code, Title, Instructor, Location)
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('instructor', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Filter by Status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Filter by Date Range / Quick Date Preset
        if ($datePreset = $request->input('date_preset')) {
            $now = now();
            if ($datePreset === 'today') {
                $query->whereDate('scheduled_at', $now->toDateString());
            } elseif ($datePreset === 'this_week') {
                $query->whereBetween('scheduled_at', [$now->startOfWeek()->toDateTimeString(), $now->endOfWeek()->toDateTimeString()]);
            } elseif ($datePreset === 'this_month') {
                $query->whereBetween('scheduled_at', [$now->startOfMonth()->toDateTimeString(), $now->endOfMonth()->toDateTimeString()]);
            }
        } elseif ($request->filled('date_from') || $request->filled('date_to')) {
            if ($request->filled('date_from')) {
                $query->whereDate('scheduled_at', '>=', $request->input('date_from'));
            }
            if ($request->filled('date_to')) {
                $query->whereDate('scheduled_at', '<=', $request->input('date_to'));
            }
        }

        // Filter by Seats Still Available
        if ($request->boolean('seats_available')) {
            $query->havingRaw('capacity > active_registrations_count');
        }

        $workshops = $query->orderBy('scheduled_at', 'asc')->get();

        return Inertia::render('workshops/index', [
            'workshops' => $workshops,
            'filters' => $request->only(['search', 'status', 'date_preset', 'date_from', 'date_to', 'seats_available']),
        ]);
    }

    /**
     * Store a newly created workshop in database (Manager only).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:workshops,code',
            'title' => 'required|string|max:255',
            'instructor' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:scheduled,completed,cancelled',
        ]);

        $validated['created_by_user_id'] = $request->user()->id;

        $workshop = Workshop::create($validated);

        AuditLog::record(
            $request->user(),
            'workshop_created',
            "Created workshop {$workshop->code} - {$workshop->title}",
            $workshop->toArray()
        );

        return redirect()->back()->with('success', 'Workshop created successfully.');
    }

    /**
     * Update the specified workshop in database (Manager only).
     */
    public function update(Request $request, Workshop $workshop)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:workshops,code,' . $workshop->id,
            'title' => 'required|string|max:255',
            'instructor' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|in:scheduled,completed,cancelled',
        ]);

        $validated['updated_by_user_id'] = $request->user()->id;

        $workshop->update($validated);

        AuditLog::record(
            $request->user(),
            'workshop_updated',
            "Updated workshop {$workshop->code} - {$workshop->title}",
            $workshop->toArray()
        );

        return redirect()->back()->with('success', 'Workshop updated successfully.');
    }
}
