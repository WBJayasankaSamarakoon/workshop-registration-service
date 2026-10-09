import AppLayout from '@/layouts/app-layout';
import { AuditLog } from '@/types';
import { Head } from '@inertiajs/react';
import { Clock, User } from 'lucide-react';

interface Props {
    logs: AuditLog[];
}

export default function AuditLogIndex({ logs }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '/audit-logs' }, { title: 'Audit Trail', href: '/audit-logs' }]}>
            <Head title="Audit Trail" />

            <div className="p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 min-h-screen">
                {/* Pro Staff Styled Container Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs p-6 space-y-5">
                    {/* Header inside Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Audit Trail & System History</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                System-wide immutable log of workshop changes, account provisioning, and registration events.
                            </p>
                        </div>
                    </div>

                    {/* Table matching reference image */}
                    <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-700 pt-2">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Timestamp</th>
                                    <th className="py-3.5 px-4">Performed By</th>
                                    <th className="py-3.5 px-4">Action Type</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Details & Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                                        <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-100">
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-indigo-500" />
                                                {log.user_name}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                                            {log.action}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100/80">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Logged
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                                            {log.description}
                                        </td>
                                    </tr>
                                ))}

                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                                            No audit logs recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Pagination Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 text-xs text-slate-500">
                        <div>1 - {logs.length} of {logs.length} items</div>
                        <div className="flex items-center gap-2">
                            <button disabled className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed">Previous</button>
                            <button disabled className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
