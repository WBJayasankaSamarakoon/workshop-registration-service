<?php

namespace App\Http\Controllers;

use App\Models\Workshop;
use App\Services\RegistrationService;
use Illuminate\Http\Request;

class WaitlistController extends Controller
{
    public function __construct(
        protected RegistrationService $registrationService
    ) {}

    public function store(Request $request, Workshop $workshop)
    {
        $validated = $request->validate([
            'attendee_name' => 'required|string|max:255',
            'attendee_email' => 'required|email|max:255',
        ]);

        $this->registrationService->addToWaitlist($workshop, $validated, $request->user());

        return redirect()->back()->with('success', 'Attendee added to waitlist successfully.');
    }
}
