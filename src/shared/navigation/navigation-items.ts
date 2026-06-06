import {
  Home,
  LogIn,
  PlusCircle,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

type NavigationItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  requiresAuth?: boolean;
  guestOnly?: boolean;
  adminOnly?: boolean;
};

export const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/create',
    label: 'Create',
    icon: PlusCircle,
    requiresAuth: true,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
    requiresAuth: true,
  },
  {
    href: '/admin',
    label: 'Admin',
    icon: ShieldCheck,
    requiresAuth: true,
    adminOnly: true,
  },
  {
    href: '/login',
    label: 'Login',
    icon: LogIn,
    guestOnly: true,
  },
  {
    href: '/register',
    label: 'Register',
    icon: UserPlus,
    guestOnly: true,
  },
];
