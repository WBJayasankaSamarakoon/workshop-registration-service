import AppLayout from '@/layouts/app-layout';
import { SharedData, Workshop } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Calendar, CheckCircle2, Clock, Edit, Filter, MapPin, Plus, Search, User, Users } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    workshops: Workshop[];
    filters: {
        search?: string;
        status?: string;
        date_preset?: string;
        date_from?: string;
        date_to?: string;
        seats_available?: boolean;
    };
}

export default function WorkshopIndex({ workshops, filters }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isManager = auth.user?.role === 'manager';

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [datePreset, setDatePreset] = useState(filters.date_preset || '');
    const [seatsAvailable, setSeatsAvailable] = useState(Boolean(filters.seats_available));

    // Modals
    const [registerModalWorkshop, setRegisterModalWorkshop] = useState<Workshop | null>(null);
    const [waitlistModalWorkshop, setWaitlistModalWorkshop] = useState<Workshop | null>(null);
    const [workshopModal, setWorkshopModal] = useState<{ open: boolean; data: Workshop | null }>({ open: false, data: null });

    // Forms
    const registerForm = useForm({
        attendee_name: '',
        attendee_email: '',
    });

    const waitlistForm = useForm({
        attendee_name: '',
        attendee_email: '',
    });

    const workshopForm = useForm({
        code: '',
        title: '',
        instructor: '',
        location: 'Downtown Branch',
        description: '',
        scheduled_at: '',
        capacity: 10,
        status: 'scheduled',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/workshops', {
            search,
            status,
            date_preset: datePreset,
            seats_available: seatsAvailable ? '1' : '',
        }, { preserveState: true });
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!registerModalWorkshop) return;

        registerForm.post(`/workshops/${registerModalWorkshop.id}/register`, {
            onSuccess: () => {
                setRegisterModalWorkshop(null);
                registerForm.reset();
            },
        });
    };

    const handleWaitlistSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!waitlistModalWorkshop) return;

        waitlistForm.post(`/workshops/${waitlistModalWorkshop.id}/waitlist`, {
            onSuccess: () => {
                setWaitlistModalWorkshop(null);
                waitlistForm.reset();
            },
        });
    };

    const handleOpenWorkshopModal = (workshop: Workshop | null = null) => {
        if (workshop) {
            workshopForm.setData({
                code: workshop.code,
                title: workshop.title,
                instructor: workshop.instructor,
                location: workshop.location,
                description: workshop.description || '',
                scheduled_at: workshop.scheduled_at.replace(' ', 'T').slice(0, 16),
                capacity: workshop.capacity,
                status: workshop.status,
            });
        } else {
            workshopForm.setData({
                code: `WS-${Math.floor(100 + Math.random() * 900)}`,
                title: '',
                instructor: '',
                location: 'Downtown Branch',
                description: '',
                scheduled_at: '',
                capacity: 15,
                status: 'scheduled',
            });
        }
        setWorkshopModal({ open: true, data: workshop });
    };

    const handleWorkshopSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (workshopModal.data) {
            workshopForm.put(`/workshops/${workshopModal.data.id}`, {
                onSuccess: () => {
                    setWorkshopModal({ open: false, data: null });
                    workshopForm.reset();
                },
            });
        } else {
            workshopForm.post('/workshops', {
                onSuccess: () => {
                    setWorkshopModal({ open: false, data: null });
                    workshopForm.reset();
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Workshops', href: '/workshops' }, { title: 'Workshop Catalogue', href: '/workshops' }]}>
            <Head title="Workshop Catalogue" />

            <div className="p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 min-h-screen">
                {/* Main Container Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs p-6 space-y-5">
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Workshop Catalogue</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Browse upcoming short courses, track seat availability, and register attendees in real-time.
                            </p>
                        </div>
                        {isManager && (
                            <button
                                onClick={() => handleOpenWorkshopModal(null)}
                                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-medium transition shadow-xs self-start sm:self-auto"
                            >
                                <Plus className="w-4 h-4" /> Add Workshop
                            </button>
                        )}
                    </div>

                    {/* Search & Filter Bar */}
                    <form onSubmit={handleSearchSubmit} className="bg-slate-50/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search title, code, instructor..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full py-1.5 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <select
                                value={datePreset}
                                onChange={(e) => setDatePreset(e.target.value)}
                                className="w-full py-1.5 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Dates</option>
                                <option value="today">Today</option>
                                <option value="this_week">This Week</option>
                                <option value="this_month">This Month</option>
                            </select>

                            <div className="flex items-center px-1">
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={seatsAvailable}
                                        onChange={(e) => setSeatsAvailable(e.target.checked)}
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                                    />
                                    Seats Available Only
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('');
                                    setDatePreset('');
                                    setSeatsAvailable(false);
                                    router.get('/workshops');
                                }}
                                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 font-medium text-center"
                            >
                                Reset Filters
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition"
                            >
                                <Filter className="w-3.5 h-3.5" /> Apply Filters
                            </button>
                        </div>
                    </form>

                    {/* Enhanced Modern Workshop Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                        {workshops.map((ws) => {
                            const activeCount = ws.active_registrations_count ?? 0;
                            const remaining = ws.capacity - activeCount;
                            const isFull = remaining <= 0;
                            const fillPercent = Math.min(100, Math.round((activeCount / ws.capacity) * 100));

                            return (
                                <div
                                    key={ws.id}
                                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-200 p-5 flex flex-col justify-between group"
                                >
                                    <div>
                                        {/* Code & Status Row */}
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600/40">
                                                {ws.code}
                                            </span>

                                            {ws.status === 'scheduled' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Scheduled
                                                </span>
                                            ) : ws.status === 'completed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700/60 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600/40">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/50">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                    Cancelled
                                                </span>
                                            )}
                                        </div>

                                        {/* Title & Description */}
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                            {ws.title}
                                        </h3>
                                        {ws.description && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed min-h-[2rem]">
                                                {ws.description}
                                            </p>
                                        )}

                                        {/* Key Info Metadata Block */}
                                        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
                                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                                                    <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                    Instructor
                                                </span>
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">{ws.instructor}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                                                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                    Location
                                                </span>
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">{ws.location}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                                                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                                                    <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                    Date & Time
                                                </span>
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                    {new Date(ws.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Capacity & Seats Bar */}
                                        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60">
                                            <div className="flex justify-between items-center text-xs font-medium">
                                                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                                                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                                                    Capacity ({activeCount} / {ws.capacity})
                                                </span>
                                                {isFull ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50">
                                                        FULLY BOOKED
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                                                        {remaining} {remaining === 1 ? 'seat left' : 'seats left'}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mt-2">
                                                <div
                                                    className={`h-1.5 transition-all duration-500 rounded-full ${
                                                        fillPercent >= 100 ? 'bg-rose-500' : fillPercent > 75 ? 'bg-amber-500' : 'bg-indigo-600'
                                                    }`}
                                                    style={{ width: `${fillPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons Footer */}
                                    <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-2">
                                        {isManager && (
                                            <button
                                                onClick={() => handleOpenWorkshopModal(ws)}
                                                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl transition flex items-center gap-1.5 shrink-0"
                                            >
                                                <Edit className="w-3.5 h-3.5 text-slate-500" /> Edit
                                            </button>
                                        )}

                                        {isFull ? (
                                            <button
                                                onClick={() => {
                                                    waitlistForm.reset();
                                                    setWaitlistModalWorkshop(ws);
                                                }}
                                                disabled={ws.status !== 'scheduled'}
                                                className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2 px-3 rounded-xl text-xs font-semibold transition shadow-xs"
                                            >
                                                <AlertCircle className="w-4 h-4" /> Join Waitlist
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    registerForm.reset();
                                                    setRegisterModalWorkshop(ws);
                                                }}
                                                disabled={ws.status !== 'scheduled'}
                                                className="w-full inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2 px-3 rounded-xl text-xs font-semibold transition shadow-xs"
                                            >
                                                <CheckCircle2 className="w-4 h-4" /> Register Attendee
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {workshops.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Workshops Found</h3>
                                <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filters.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Pagination Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700">
                        <div>1 - {workshops.length} of {workshops.length} items</div>
                        <div className="flex items-center gap-2">
                            <button disabled className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed">Previous</button>
                            <button disabled className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed">Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Register Attendee */}
            {registerModalWorkshop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Register Attendee</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Registering for <strong>{registerModalWorkshop.code} - {registerModalWorkshop.title}</strong>
                        </p>

                        <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3.5">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Attendee Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. John Doe"
                                    value={registerForm.data.attendee_name}
                                    onChange={(e) => registerForm.setData('attendee_name', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {registerForm.errors.attendee_name && (
                                    <p className="text-xs text-rose-500 mt-1">{registerForm.errors.attendee_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Attendee Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="e.g. john@example.com"
                                    value={registerForm.data.attendee_email}
                                    onChange={(e) => registerForm.setData('attendee_email', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {registerForm.errors.attendee_email && (
                                    <p className="text-xs text-rose-500 mt-1">{registerForm.errors.attendee_email}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRegisterModalWorkshop(null)}
                                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={registerForm.processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                                >
                                    {registerForm.processing ? 'Registering...' : 'Confirm Registration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Join Waitlist */}
            {waitlistModalWorkshop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Join Waitlist</h2>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                            This workshop is full. Attendees on waitlist will be auto-promoted when a seat frees up.
                        </p>

                        <form onSubmit={handleWaitlistSubmit} className="mt-4 space-y-3.5">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Attendee Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. John Doe"
                                    value={waitlistForm.data.attendee_name}
                                    onChange={(e) => waitlistForm.setData('attendee_name', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Attendee Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="e.g. john@example.com"
                                    value={waitlistForm.data.attendee_email}
                                    onChange={(e) => waitlistForm.setData('attendee_email', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setWaitlistModalWorkshop(null)}
                                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={waitlistForm.processing}
                                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                                >
                                    {waitlistForm.processing ? 'Adding...' : 'Add to Waitlist'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Add/Edit Workshop */}
            {workshopModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 my-8">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            {workshopModal.data ? 'Edit Workshop' : 'Create New Workshop'}
                        </h2>

                        <form onSubmit={handleWorkshopSubmit} className="mt-4 space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Workshop Code
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={workshopForm.data.code}
                                        onChange={(e) => workshopForm.setData('code', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    {workshopForm.errors.code && (
                                        <p className="text-xs text-rose-500 mt-1">{workshopForm.errors.code}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Capacity (Max Seats)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={workshopForm.data.capacity}
                                        onChange={(e) => workshopForm.setData('capacity', Number(e.target.value))}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Workshop Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={workshopForm.data.title}
                                    onChange={(e) => workshopForm.setData('title', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Instructor Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={workshopForm.data.instructor}
                                        onChange={(e) => workshopForm.setData('instructor', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Location / Branch
                                    </label>
                                    <select
                                        value={workshopForm.data.location}
                                        onChange={(e) => workshopForm.setData('location', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="Downtown Branch">Downtown Branch</option>
                                        <option value="Tech Hub Branch">Tech Hub Branch</option>
                                        <option value="Westside Branch">Westside Branch</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Scheduled Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={workshopForm.data.scheduled_at}
                                        onChange={(e) => workshopForm.setData('scheduled_at', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={workshopForm.data.status}
                                        onChange={(e) => workshopForm.setData('status', e.target.value as any)}
                                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Description / Notes
                                </label>
                                <textarea
                                    rows={3}
                                    value={workshopForm.data.description}
                                    onChange={(e) => workshopForm.setData('description', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setWorkshopModal({ open: false, data: null })}
                                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={workshopForm.processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                                >
                                    {workshopForm.processing ? 'Saving...' : workshopModal.data ? 'Update Workshop' : 'Create Workshop'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
