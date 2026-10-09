import { LucideIcon } from 'lucide-react';

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'staff';
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Workshop {
    id: number;
    code: string;
    title: string;
    instructor: string;
    location: string;
    description?: string | null;
    scheduled_at: string;
    capacity: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    created_by_user_id: number;
    updated_by_user_id?: number | null;
    active_registrations_count?: number;
    seats_remaining?: number;
    created_at: string;
    updated_at: string;
}

export interface Registration {
    id: number;
    workshop_id: number;
    attendee_name: string;
    attendee_email: string;
    status: 'active' | 'cancelled';
    registered_by_user_id: number;
    registered_at: string;
    cancelled_by_user_id?: number | null;
    cancelled_at?: string | null;
    created_at: string;
    updated_at: string;
    workshop?: Workshop;
    registered_by?: User;
    cancelled_by?: User;
}

export interface Waitlist {
    id: number;
    workshop_id: number;
    attendee_name: string;
    attendee_email: string;
    status: 'waiting' | 'promoted' | 'cancelled';
    added_by_user_id: number;
    created_at: string;
    updated_at: string;
}

export interface AuditLog {
    id: number;
    user_id: number;
    user_name: string;
    action: string;
    description: string;
    payload?: Record<string, unknown> | null;
    created_at: string;
}

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}
