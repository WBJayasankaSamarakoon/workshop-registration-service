<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = AuditLog::orderBy('created_at', 'desc')->take(100)->get();

        return Inertia::render('audit-logs/index', [
            'logs' => $logs,
        ]);
    }
}
