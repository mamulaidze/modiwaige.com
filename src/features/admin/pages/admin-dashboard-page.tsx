import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  FileWarning,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Button } from '@/shared/components/ui/button';
import { PageContainer } from '@/shared/layouts/page-container';
import { cn } from '@/shared/lib/cn';

import {
  deleteAdminPost,
  fetchAdminPosts,
  fetchAdminReports,
  fetchAdminStats,
  fetchAdminUsers,
  updateReportStatus,
  type AdminPost,
  type AdminReport,
  type AdminStats,
  type AdminUser,
} from '../api/admin-api';

type AdminTab = 'users' | 'posts' | 'reports';

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
  });

  const postsQuery = useQuery({
    queryKey: ['admin-posts'],
    queryFn: fetchAdminPosts,
  });

  const reportsQuery = useQuery({
    queryKey: ['admin-reports'],
    queryFn: fetchAdminReports,
  });

  const deletePostMutation = useMutation({
    mutationFn: deleteAdminPost,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-posts'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['feed'] }),
      ]);
    },
  });

  const reportStatusMutation = useMutation({
    mutationFn: (input: { reportId: string; status: AdminReport['status'] }) =>
      updateReportStatus(input.reportId, input.status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
      ]);
    },
  });

  const isLoading =
    statsQuery.isLoading ||
    usersQuery.isLoading ||
    postsQuery.isLoading ||
    reportsQuery.isLoading;
  const error =
    statsQuery.error ??
    usersQuery.error ??
    postsQuery.error ??
    reportsQuery.error;

  return (
    <PageContainer className="gap-6">
      <section className="bg-card rounded-lg border p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-md">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Admin dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Review users, moderate posts, and triage reports.
            </p>
          </div>
        </div>
      </section>

      {statsQuery.data ? <StatsGrid stats={statsQuery.data} /> : null}

      <div className="bg-card grid grid-cols-3 gap-1 rounded-lg border p-1">
        <TabButton
          active={activeTab === 'users'}
          label="Users"
          onClick={() => setActiveTab('users')}
        />
        <TabButton
          active={activeTab === 'posts'}
          label="Posts"
          onClick={() => setActiveTab('posts')}
        />
        <TabButton
          active={activeTab === 'reports'}
          label="Reports"
          onClick={() => setActiveTab('reports')}
        />
      </div>

      {isLoading ? (
        <LoadingState
          title="Loading admin data"
          description="Gaachuqe is loading moderation records."
        />
      ) : null}

      {error ? (
        <div className="bg-card rounded-lg border p-4" role="alert">
          <h2 className="text-destructive font-semibold">
            Could not load admin tools
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {error instanceof Error ? error.message : 'Please try again.'}
          </p>
        </div>
      ) : null}

      {!isLoading && !error && activeTab === 'users' ? (
        <UsersTable users={usersQuery.data ?? []} />
      ) : null}

      {!isLoading && !error && activeTab === 'posts' ? (
        <PostsTable
          deletingPostId={deletePostMutation.variables ?? null}
          error={deletePostMutation.error}
          posts={postsQuery.data ?? []}
          onDelete={(postId) => deletePostMutation.mutate(postId)}
        />
      ) : null}

      {!isLoading && !error && activeTab === 'reports' ? (
        <ReportsTable
          reports={reportsQuery.data ?? []}
          updatingReportId={reportStatusMutation.variables?.reportId ?? null}
          onStatusChange={(reportId, status) =>
            reportStatusMutation.mutate({ reportId, status })
          }
        />
      ) : null}
    </PageContainer>
  );
}

function StatsGrid({ stats }: { stats: AdminStats }) {
  return (
    <section
      aria-label="Admin statistics"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      <StatCard label="Users" value={stats.users} />
      <StatCard label="Posts" value={stats.posts} />
      <StatCard label="Open reports" value={stats.openReports} />
      <StatCard label="Reservations" value={stats.reservations} />
      <StatCard label="Expired posts" value={stats.expiredPosts} />
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <BarChart3 className="size-4" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        'rounded-md px-3 py-2 text-sm font-medium',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent',
      )}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function UsersTable({ users }: { users: AdminUser[] }) {
  if (users.length === 0) {
    return (
      <EmptyState
        title="No users"
        description="Registered users will appear here."
      />
    );
  }

  return (
    <AdminTable>
      <thead>
        <tr>
          <HeaderCell>User</HeaderCell>
          <HeaderCell>Role</HeaderCell>
          <HeaderCell>Posts</HeaderCell>
          <HeaderCell>Reservations</HeaderCell>
          <HeaderCell>Joined</HeaderCell>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr className="border-t" key={user.id}>
            <BodyCell>
              <div className="flex items-center gap-2">
                <Users className="text-muted-foreground size-4" />
                <div>
                  <p className="font-medium">{user.displayName}</p>
                  <p className="text-muted-foreground text-xs">
                    {user.location}
                  </p>
                </div>
              </div>
            </BodyCell>
            <BodyCell>{formatValue(user.role)}</BodyCell>
            <BodyCell>{user.postCount}</BodyCell>
            <BodyCell>{user.reservationCount}</BodyCell>
            <BodyCell>{formatDate(user.createdAt)}</BodyCell>
          </tr>
        ))}
      </tbody>
    </AdminTable>
  );
}

function PostsTable({
  deletingPostId,
  error,
  onDelete,
  posts,
}: {
  deletingPostId: string | null;
  error: unknown;
  onDelete: (postId: string) => void;
  posts: AdminPost[];
}) {
  const [confirmingPostId, setConfirmingPostId] = useState<string | null>(null);

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts"
        description="Posts created by members will appear here."
      />
    );
  }

  return (
    <section className="space-y-3">
      <AdminTable>
        <thead>
          <tr>
            <HeaderCell>Post</HeaderCell>
            <HeaderCell>Owner</HeaderCell>
            <HeaderCell>Status</HeaderCell>
            <HeaderCell>Reports</HeaderCell>
            <HeaderCell>Expires</HeaderCell>
            <HeaderCell>Action</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => {
            const isConfirming = confirmingPostId === post.id;
            const isDeleting = deletingPostId === post.id;

            return (
              <tr className="border-t" key={post.id}>
                <BodyCell>
                  <Link
                    className="font-medium underline-offset-4"
                    to={`/posts/${post.id}`}
                  >
                    {post.title}
                  </Link>
                  <p className="text-muted-foreground text-xs">
                    {post.location} - {formatValue(post.category)}
                  </p>
                </BodyCell>
                <BodyCell>{post.ownerName}</BodyCell>
                <BodyCell>{formatValue(post.status)}</BodyCell>
                <BodyCell>{post.reportCount}</BodyCell>
                <BodyCell>{formatDate(post.expiresAt)}</BodyCell>
                <BodyCell>
                  <Button
                    className="border-destructive text-destructive hover:bg-destructive hover:text-primary-foreground"
                    disabled={isDeleting}
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!isConfirming) {
                        setConfirmingPostId(post.id);
                        return;
                      }

                      onDelete(post.id);
                    }}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    {isDeleting
                      ? 'Deleting...'
                      : isConfirming
                        ? 'Confirm'
                        : 'Delete'}
                  </Button>
                </BodyCell>
              </tr>
            );
          })}
        </tbody>
      </AdminTable>
      {error ? (
        <p
          className="text-destructive rounded-md border border-current p-3 text-sm"
          role="alert"
        >
          {error instanceof Error ? error.message : 'Could not delete post.'}
        </p>
      ) : null}
    </section>
  );
}

function ReportsTable({
  onStatusChange,
  reports,
  updatingReportId,
}: {
  onStatusChange: (reportId: string, status: AdminReport['status']) => void;
  reports: AdminReport[];
  updatingReportId: string | null;
}) {
  if (reports.length === 0) {
    return (
      <EmptyState
        title="No reports"
        description="Member reports will appear here."
      />
    );
  }

  return (
    <AdminTable>
      <thead>
        <tr>
          <HeaderCell>Report</HeaderCell>
          <HeaderCell>Post</HeaderCell>
          <HeaderCell>Reporter</HeaderCell>
          <HeaderCell>Status</HeaderCell>
          <HeaderCell>Created</HeaderCell>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <tr className="border-t align-top" key={report.id}>
            <BodyCell>
              <div className="flex items-start gap-2">
                <FileWarning className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">{report.subject}</p>
                  <p className="text-muted-foreground mt-1 max-w-md text-xs leading-5">
                    {report.body}
                  </p>
                </div>
              </div>
            </BodyCell>
            <BodyCell>
              {report.post ? (
                <Link
                  className="underline-offset-4"
                  to={`/posts/${report.post.id}`}
                >
                  {report.post.title}
                </Link>
              ) : (
                'Deleted post'
              )}
            </BodyCell>
            <BodyCell>{report.reporterName}</BodyCell>
            <BodyCell>
              <select
                className="border-input bg-background h-10 rounded-md border px-2 text-sm"
                disabled={updatingReportId === report.id}
                value={report.status}
                onChange={(event) =>
                  onStatusChange(
                    report.id,
                    event.target.value as AdminReport['status'],
                  )
                }
              >
                <option value="open">Open</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </BodyCell>
            <BodyCell>{formatDate(report.createdAt)}</BodyCell>
          </tr>
        ))}
      </tbody>
    </AdminTable>
  );
}

function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-muted-foreground px-4 py-3 text-xs font-semibold uppercase">
      {children}
    </th>
  );
}

function BodyCell({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}

function formatValue(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
