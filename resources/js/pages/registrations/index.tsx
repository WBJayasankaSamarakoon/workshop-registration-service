import AppLayout from '@/layouts/app-layout';
import { Registration } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Ban, Filter, Search } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    registrations: Registration[];
    workshops: Array<{ id: number; code: string; title: string }>;
    filters: {
        workshop_id?: string;
        status?: string;
        search?: string;
    };
}

export default function RegistrationIndex({ registrations, workshops, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [workshopId, setWorkshopId] = useState(filters.workshop_id || '');
    const [status, setStatus] = useState(filters.status || '');

    const [cancelModalRegistration, setCancelModalRegistration] = useState<Registration | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/registrations', {
            search,
            workshop_id: workshopId,
            status,
        }, { preserveState: true });
    };

    const handleConfirmCancel = () => {
        if (!cancelModalRegistration) return;
        setIsCancelling(true);

        router.post(`/registrations/${cancelModalRegistration.id}/cancel`, {}, {
            onFinish: () => {
                setIsCancelling(false);
                setCancelModalRegistration(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Management', href: '/registrations' }, { title: 'Registrations & History', href: '/registrations' }]}>
            <Head title="Registrations & History" />

            <div className="p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 min-h-screen">
                {/* Pro Staff Styled Container Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs p-6 space-y-5">
                    {/* Header inside Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Registration Audit & History</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Complete historical record of all registrations and cancellations with staff audit timestamps.
                            </p>
                        </div>
                    </div>

                    {/* Filter Bar inside Card */}
                    <form onSubmit={handleFilterSubmit} className="bg-slate-50/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search attendee name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <select
                                value={workshopId}
                                onChange={(e) => setWorkshopId(e.target.value)}
                                className="w-full py-1.5 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Workshops</option>
                                {workshops.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.code} - {w.title}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full py-1.5 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active Only</option>
                                <option value="cancelled">Cancelled Only</option>
                            </select>
                        </div>

                        <div className="flex justify-end pt-1">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition"
                            >
                                <Filter className="w-3.5 h-3.5" /> Filter Results
                            </button>
                        </div>
                    </form>

                    {/* Table matching reference image */}
                    <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-700 pt-2">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Attendee</th>
                                    <th className="py-3.5 px-4">Workshop</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Registered By</th>
                                    <th className="py-3.5 px-4">Cancelled By</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                                {registrations.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                                        <td className="py-4 px-4">
                                            <div className="font-semibold text-slate-800 dark:text-slate-100">{reg.attendee_name}</div>
                                            <div className="text-[11px] text-slate-500">{reg.attendee_email}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {reg.workshop ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80">
                                                        {reg.workshop.code}
                                                    </span>
                                                    <span className="font-medium text-slate-700 dark:text-slate-200">{reg.workshop.title}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">Unknown Workshop</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            {reg.status === 'active' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100/80">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    Cancelled
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                                            <div>{reg.registered_by?.name || 'Staff User'}</div>
                                            <div className="text-[11px] text-slate-400">{new Date(reg.registered_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                                        </td>
                                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                                            {reg.status === 'cancelled' && reg.cancelled_by ? (
                                                <div>
                                                    <div className="text-rose-600 dark:text-rose-400 font-medium">{reg.cancelled_by.name}</div>
                                                    <div className="text-[11px] text-slate-400">{reg.cancelled_at ? new Date(reg.cancelled_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}</div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            {reg.status === 'active' && (
                                                <button
                                                    onClick={() => setCancelModalRegistration(reg)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 dark:text-rose-400 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 transition"
                                                >
                                                    <Ban className="w-3 h-3" /> Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {registrations.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">
                                            No registrations match the selected criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Pagination Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 text-xs text-slate-500">
                        <div>1 - {registrations.length} of {registrations.length} items</div>
                        <div className="flex items-center gap-2">
                            <button disabled className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed">Previous</button>
                            <button disabled className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed">Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Confirm Registration Cancellation */}
            {cancelModalRegistration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-5 h-5" />
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Cancel Registration</h2>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                            Are you sure you want to cancel the registration for <strong>{cancelModalRegistration.attendee_name}</strong> in workshop <strong>{cancelModalRegistration.workshop?.code}</strong>?
                        </p>
                        <p className="text-xs text-slate-500 mt-2 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            ℹ️ <strong>Rule:</strong> The seat will be freed up immediately, but this registration record will be permanently retained in history for audit compliance.
                        </p>

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={() => setCancelModalRegistration(null)}
                                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmCancel}
                                disabled={isCancelling}
                                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                            >
                                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
