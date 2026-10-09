import AppLayout from '@/layouts/app-layout';
import { User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Edit, MoreVertical, Plus, Shield, UserPlus } from 'lucide-react';
import React, { useState } from 'react';

interface Props {
    users: User[];
}

export default function UserIndex({ users }: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editRoleUser, setEditRoleUser] = useState<User | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: 'password123',
        role: 'staff',
    });

    const editRoleForm = useForm({
        role: 'staff',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/users', {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditRoleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editRoleUser) return;

        editRoleForm.put(`/users/${editRoleUser.id}/role`, {
            onSuccess: () => {
                setEditRoleUser(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Management', href: '/users' }, { title: 'User Management', href: '/users' }]}>
            <Head title="User Management" />

            <div className="p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 min-h-screen">
                {/* Main Pro Staff Styled Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs p-6 space-y-5">
                    {/* Header inside Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Manage staff user accounts and assign access roles across locations.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    createForm.reset();
                                    setCreateModalOpen(true);
                                }}
                                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-medium transition shadow-xs"
                            >
                                <Plus className="w-4 h-4" /> Add New User
                            </button>
                        </div>
                    </div>

                    {/* Table matching reference image */}
                    <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-700 pt-2">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3.5 px-4">Staff Member</th>
                                    <th className="py-3.5 px-4">Email Address</th>
                                    <th className="py-3.5 px-4">Assigned Role</th>
                                    <th className="py-3.5 px-4">Account Status</th>
                                    <th className="py-3.5 px-4">Created Date</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition">
                                        <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-100">
                                            {u.name}
                                        </td>
                                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                                            {u.email}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="capitalize font-medium text-slate-700 dark:text-slate-200">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-900/40">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Active
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-slate-500">
                                            {new Date(u.created_at).toLocaleDateString([], { dateStyle: 'medium' })}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() => {
                                                    editRoleForm.setData('role', u.role as any);
                                                    setEditRoleUser(u);
                                                }}
                                                className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                                title="Edit Role"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Pagination Bar matching reference image */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 text-xs text-slate-500">
                        <div>1 - {users.length} of {users.length} items</div>
                        <div className="flex items-center gap-2">
                            <button disabled className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed">Previous</button>
                            <button disabled className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed">Next</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Create User Account */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Create Staff Account</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Add a new staff member or manager account.</p>

                        <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Alice Smith"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {createForm.errors.name && (
                                    <p className="text-xs text-rose-500 mt-1">{createForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="e.g. alice@workshop.com"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                {createForm.errors.email && (
                                    <p className="text-xs text-rose-500 mt-1">{createForm.errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Initial Password
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Access Role
                                </label>
                                <select
                                    value={createForm.data.role}
                                    onChange={(e) => createForm.setData('role', e.target.value as any)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="staff">Staff (Register & Cancel attendees)</option>
                                    <option value="manager">Manager (Add/Edit workshops & Registrations)</option>
                                    <option value="admin">Admin (Manage user accounts & roles)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                                >
                                    {createForm.processing ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit User Role */}
            {editRoleUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Update Access Role</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Updating role for <strong>{editRoleUser.email}</strong></p>

                        <form onSubmit={handleEditRoleSubmit} className="mt-4 space-y-3.5">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Select New Role
                                </label>
                                <select
                                    value={editRoleForm.data.role}
                                    onChange={(e) => editRoleForm.setData('role', e.target.value as any)}
                                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditRoleUser(null)}
                                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editRoleForm.processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                                >
                                    {editRoleForm.processing ? 'Updating...' : 'Update Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
