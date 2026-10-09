import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Calendar, ClipboardList, ShieldAlert, Users } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const role = auth.user?.role;

    const navItems: NavItem[] = [];

    if (role === 'admin') {
        navItems.push(
            {
                title: 'Staff Accounts',
                url: '/users',
                icon: Users,
            },
            {
                title: 'Audit Logs',
                url: '/audit-logs',
                icon: ShieldAlert,
            }
        );
    } else {
        navItems.push(
            {
                title: 'Workshop Catalogue',
                url: '/workshops',
                icon: Calendar,
            },
            {
                title: 'Registrations & History',
                url: '/registrations',
                icon: ClipboardList,
            }
        );

        if (role === 'manager') {
            navItems.push({
                title: 'Audit Logs',
                url: '/audit-logs',
                icon: ShieldAlert,
            });
        }
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
