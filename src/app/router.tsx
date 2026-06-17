import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from '@/shared/layouts/app-layout';
import { RouteLoading } from '@/shared/components/route-loading';
import { ProtectedRoute } from '@/features/auth/routes/protected-route';
import { NotFoundPage } from '@/features/not-found/pages/not-found-page';

const AccountPage = lazy(() =>
  import('@/features/account/pages/account-page').then((module) => ({
    default: module.AccountPage,
  })),
);
const CreatePostPage = lazy(() =>
  import('@/features/posts/pages/create-post-page').then((module) => ({
    default: module.CreatePostPage,
  })),
);
const AdminDashboardPage = lazy(() =>
  import('@/features/admin/pages/admin-dashboard-page').then((module) => ({
    default: module.AdminDashboardPage,
  })),
);
const HomePage = lazy(() =>
  import('@/features/home/pages/home-page').then((module) => ({
    default: module.HomePage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/forgot-password-page').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const LoginPage = lazy(() =>
  import('@/features/auth/pages/login-page').then((module) => ({
    default: module.LoginPage,
  })),
);
const ContactPage = lazy(() =>
  import('@/features/legal/pages/legal-pages').then((module) => ({
    default: module.ContactPage,
  })),
);
const PrivacyPolicyPage = lazy(() =>
  import('@/features/legal/pages/legal-pages').then((module) => ({
    default: module.PrivacyPolicyPage,
  })),
);
const SafetyRulesPage = lazy(() =>
  import('@/features/legal/pages/legal-pages').then((module) => ({
    default: module.SafetyRulesPage,
  })),
);
const TermsPage = lazy(() =>
  import('@/features/legal/pages/legal-pages').then((module) => ({
    default: module.TermsPage,
  })),
);
const PostDetailsPage = lazy(() =>
  import('@/features/posts/pages/post-details-page').then((module) => ({
    default: module.PostDetailsPage,
  })),
);
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/register-page').then((module) => ({
    default: module.RegisterPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/reset-password-page').then((module) => ({
    default: module.ResetPasswordPage,
  })),
);

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to="/ge" />,
  },
  {
    path: '/homepage',
    element: <Navigate replace to="/ge/homepage" />,
  },
  {
    path: '/login',
    element: <Navigate replace to="/ge/login" />,
  },
  {
    path: '/forgot-password',
    element: <Navigate replace to="/ge/forgot-password" />,
  },
  {
    path: '/reset-password',
    element: <Navigate replace to="/ge/reset-password" />,
  },
  {
    path: '/register',
    element: <Navigate replace to="/ge/register" />,
  },
  {
    path: '/create',
    element: <Navigate replace to="/ge/create" />,
  },
  {
    path: '/profile',
    element: <Navigate replace to="/ge/profile" />,
  },
  {
    path: '/admin',
    element: <Navigate replace to="/ge/admin" />,
  },
  {
    path: '/privacy',
    element: <Navigate replace to="/ge/privacy" />,
  },
  {
    path: '/terms',
    element: <Navigate replace to="/ge/terms" />,
  },
  {
    path: '/safety',
    element: <Navigate replace to="/ge/safety" />,
  },
  {
    path: '/contact',
    element: <Navigate replace to="/ge/contact" />,
  },
  {
    path: '/posts/:postId',
    element: <Navigate replace to="/ge" />,
  },
  {
    path: '/:lang',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: withSuspense(<HomePage />),
      },
      {
        path: 'homepage',
        element: withSuspense(<HomePage />),
      },
      {
        path: 'login',
        element: withSuspense(<LoginPage />),
      },
      {
        path: 'forgot-password',
        element: withSuspense(<ForgotPasswordPage />),
      },
      {
        path: 'reset-password',
        element: withSuspense(<ResetPasswordPage />),
      },
      {
        path: 'register',
        element: withSuspense(<RegisterPage />),
      },
      {
        path: 'create',
        element: withSuspense(
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: 'posts/:postId',
        element: withSuspense(<PostDetailsPage />),
      },
      {
        path: 'privacy',
        element: withSuspense(<PrivacyPolicyPage />),
      },
      {
        path: 'terms',
        element: withSuspense(<TermsPage />),
      },
      {
        path: 'safety',
        element: withSuspense(<SafetyRulesPage />),
      },
      {
        path: 'contact',
        element: withSuspense(<ContactPage />),
      },
      {
        path: 'profile',
        element: withSuspense(
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: 'admin',
        element: withSuspense(
          <ProtectedRoute requireAdmin>
            <AdminDashboardPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
