<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use App\Models\Workshop;
use App\Services\RegistrationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    public function __construct(
        protected RegistrationService $registrationService
    ) {}

    /**
     * Display a listing of registrations and full history.
     */
    public function index(Request $request): Response
    {
        $query = Registration::with(['workshop', 'registeredBy', 'cancelledBy']);

        if ($workshopId = $request->input('workshop_id')) {
            $query->where('workshop_id', $workshopId);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('attendee_name', 'like', "%{$search}%")
                  ->orWhere('attendee_email', 'like', "%{$search}%");
            });
        }

        $registrations = $query->orderBy('created_at', 'desc')->get();
        $workshops = Workshop::select('id', 'code', 'title')->get();

        return Inertia::render('registrations/index', [
            'registrations' => $registrations,
            'workshops' => $workshops,
            'filters' => $request->only(['workshop_id', 'status', 'search']),
        ]);
    }

    /**
     * Store a new attendee registration for a workshop.
     */
    public function store(Request $request, Workshop $workshop)
    {
        $validated = $request->validate([
            'attendee_name' => 'required|string|max:255',
            'attendee_email' => 'required|email|max:255',
        ]);

        $this->registrationService->registerAttendee($workshop, $validated, $request->user());

        return redirect()->back()->with('success', 'Attendee registered successfully.');
    }

    /**
     * Cancel an active registration.
     */
    public function cancel(Request $request, Registration $registration)
    {
        $this->registrationService->cancelRegistration($registration, $request->user());

        return redirect()->back()->with('success', 'Registration cancelled successfully. Seat freed.');
    }
}
