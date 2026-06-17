import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  Eye,
  FileWarning,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import { useDialogFocusTrap } from '@/shared/hooks/use-dialog-focus-trap';
import { getLanguageLocale, useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { cn } from '@/shared/lib/cn';
import { getFriendlyErrorMessage } from '@/shared/lib/errors';

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
const ADMIN_PAGE_SIZE = 10;
const initialTableState = { page: 0, search: '' };

export function AdminDashboardPage() {
  const { language, t } = useI18n();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [usersState, setUsersState] = useState(initialTableState);
  const [postsState, setPostsState] = useState(initialTableState);
  const [reportsState, setReportsState] = useState(initialTableState);
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users', usersState.page, usersState.search],
    queryFn: () =>
      fetchAdminUsers({
        page: usersState.page,
        pageSize: ADMIN_PAGE_SIZE,
        search: usersState.search,
      }),
  });

  const postsQuery = useQuery({
    queryKey: ['admin-posts', postsState.page, postsState.search],
    queryFn: () =>
      fetchAdminPosts({
        page: postsState.page,
        pageSize: ADMIN_PAGE_SIZE,
        search: postsState.search,
      }),
  });

  const reportsQuery = useQuery({
    queryKey: ['admin-reports', reportsState.page, reportsState.search],
    queryFn: () =>
      fetchAdminReports({
        page: reportsState.page,
        pageSize: ADMIN_PAGE_SIZE,
        search: reportsState.search,
      }),
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
      <Seo
        noindex
        title={language === 'ge' ? 'ადმინ პანელი' : 'Admin dashboard'}
        description={
          language === 'ge'
            ? 'Gaachuqe-ის ადმინისტრირების პანელი მომხმარებლების, განცხადებების და რეპორტების სამართავად.'
            : 'Gaachuqe admin dashboard for users, posts, reports, and moderation.'
        }
      />
      <section className="premium-card rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <div className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-2xl shadow-[0_10px_24px_var(--theme-primary-shadow)]">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('Admin dashboard')}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('Review users, moderate posts, and triage reports.')}
            </p>
          </div>
        </div>
      </section>

      {statsQuery.data ? <StatsGrid stats={statsQuery.data} /> : null}

      <div className="glass-surface grid grid-cols-3 gap-1 rounded-3xl p-1">
        <TabButton
          active={activeTab === 'users'}
          label={t('Users')}
          onClick={() => setActiveTab('users')}
        />
        <TabButton
          active={activeTab === 'posts'}
          label={t('Posts')}
          onClick={() => setActiveTab('posts')}
        />
        <TabButton
          active={activeTab === 'reports'}
          label={t('Reports')}
          onClick={() => setActiveTab('reports')}
        />
      </div>

      {isLoading ? (
        <LoadingState
          title={t('Loading admin data')}
          description={t('Gaachuqe is loading moderation records.')}
          variant="admin"
        />
      ) : null}

      {error ? (
        <div className="premium-card rounded-3xl p-4" role="alert">
          <h2 className="text-destructive font-semibold">
            {t('Could not load admin tools')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t(getFriendlyErrorMessage(error))}
          </p>
        </div>
      ) : null}

      {!isLoading && !error && activeTab === 'users' ? (
        <UsersTable
          page={usersState.page}
          searchQuery={usersState.search}
          total={usersQuery.data?.total ?? 0}
          users={usersQuery.data?.items ?? []}
          onPageChange={(page) =>
            setUsersState((state) => ({ ...state, page }))
          }
          onSearchChange={(search) =>
            setUsersState({ page: 0, search })
          }
        />
      ) : null}

      {!isLoading && !error && activeTab === 'posts' ? (
        <PostsTable
          deletingPostId={deletePostMutation.variables ?? null}
          error={deletePostMutation.error}
          page={postsState.page}
          posts={postsQuery.data?.items ?? []}
          searchQuery={postsState.search}
          total={postsQuery.data?.total ?? 0}
          onDelete={(postId) => deletePostMutation.mutate(postId)}
          onPageChange={(page) =>
            setPostsState((state) => ({ ...state, page }))
          }
          onSearchChange={(search) =>
            setPostsState({ page: 0, search })
          }
        />
      ) : null}

      {!isLoading && !error && activeTab === 'reports' ? (
        <ReportsTable
          page={reportsState.page}
          reports={reportsQuery.data?.items ?? []}
          searchQuery={reportsState.search}
          total={reportsQuery.data?.total ?? 0}
          updatingReportId={reportStatusMutation.variables?.reportId ?? null}
          onPageChange={(page) =>
            setReportsState((state) => ({ ...state, page }))
          }
          onSearchChange={(search) =>
            setReportsState({ page: 0, search })
          }
          onStatusChange={(reportId, status) =>
            reportStatusMutation.mutate({ reportId, status })
          }
        />
      ) : null}
    </PageContainer>
  );
}

function StatsGrid({ stats }: { stats: AdminStats }) {
  const { t } = useI18n();

  return (
    <section
      aria-label={t('Admin statistics')}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      <StatCard label={t('Users')} value={stats.users} />
      <StatCard label={t('Posts')} value={stats.posts} />
      <StatCard label={t('Open reports')} value={stats.openReports} />
      <StatCard label={t('Reservations')} value={stats.reservations} />
      <StatCard label={t('Expired posts')} value={stats.expiredPosts} />
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="premium-card rounded-3xl p-4">
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
        'rounded-2xl px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground shadow-[0_10px_24px_var(--theme-primary-shadow)]'
          : 'text-muted-foreground hover:bg-[var(--theme-glass-hover)]',
      )}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function UsersTable({
  onPageChange,
  onSearchChange,
  page,
  searchQuery,
  total,
  users,
}: {
  onPageChange: (page: number) => void;
  onSearchChange: (query: string) => void;
  page: number;
  searchQuery: string;
  total: number;
  users: AdminUser[];
}) {
  const { language, t } = useI18n();

  if (users.length === 0 && !searchQuery) {
    return (
      <EmptyState
        title={t('No users')}
        description={t('Registered users will appear here.')}
      />
    );
  }

  return (
    <section className="space-y-3">
      <AdminSearch
        label={t('Search users')}
        value={searchQuery}
        onChange={onSearchChange}
      />

      {users.length === 0 ? (
        <EmptyState
          title={t('No matching results')}
          description={t('Try a different search.')}
        />
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <HeaderCell>{t('User')}</HeaderCell>
              <HeaderCell>{t('Role')}</HeaderCell>
              <HeaderCell>{t('Posts')}</HeaderCell>
              <HeaderCell>{t('Reservations')}</HeaderCell>
              <HeaderCell>{t('Joined')}</HeaderCell>
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
                <BodyCell>{formatValue(user.role, t)}</BodyCell>
                <BodyCell>{user.postCount}</BodyCell>
                <BodyCell>{user.reservationCount}</BodyCell>
                <BodyCell>{formatDate(user.createdAt, language)}</BodyCell>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <PaginationControls
        page={page}
        pageSize={ADMIN_PAGE_SIZE}
        total={total}
        onPageChange={onPageChange}
      />
    </section>
  );
}

function PostsTable({
  deletingPostId,
  error,
  onDelete,
  onPageChange,
  onSearchChange,
  page,
  posts,
  searchQuery,
  total,
}: {
  deletingPostId: string | null;
  error: unknown;
  onDelete: (postId: string) => void;
  onPageChange: (page: number) => void;
  onSearchChange: (query: string) => void;
  page: number;
  posts: AdminPost[];
  searchQuery: string;
  total: number;
}) {
  const { language, localizedPath, t } = useI18n();
  const [confirmingPostId, setConfirmingPostId] = useState<string | null>(null);

  if (posts.length === 0 && !searchQuery) {
    return (
      <EmptyState
        title={t('No posts')}
        description={t('Posts created by members will appear here.')}
      />
    );
  }

  return (
    <section className="space-y-3">
      <AdminSearch
        label={t('Search posts')}
        value={searchQuery}
        onChange={onSearchChange}
      />

      {posts.length === 0 ? (
        <EmptyState
          title={t('No matching results')}
          description={t('Try a different search.')}
        />
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <HeaderCell>{t('Post')}</HeaderCell>
              <HeaderCell>{t('Owner')}</HeaderCell>
              <HeaderCell>{t('Status')}</HeaderCell>
              <HeaderCell>{t('Reports')}</HeaderCell>
              <HeaderCell>{t('Expires')}</HeaderCell>
              <HeaderCell>{t('Action')}</HeaderCell>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const isDeleting = deletingPostId === post.id;

              return (
                <tr className="border-t" key={post.id}>
                  <BodyCell>
                    <Link
                      className="font-medium underline-offset-4"
                      to={localizedPath(`/posts/${post.id}`)}
                    >
                      {post.title}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {t(post.location)} - {formatValue(post.category, t)}
                    </p>
                  </BodyCell>
                  <BodyCell>{post.ownerName}</BodyCell>
                  <BodyCell>{formatValue(post.status, t)}</BodyCell>
                  <BodyCell>{post.reportCount}</BodyCell>
                  <BodyCell>{formatDate(post.expiresAt, language)}</BodyCell>
                  <BodyCell>
                    <Button
                      className="border-destructive text-destructive hover:bg-destructive hover:text-primary-foreground"
                      disabled={isDeleting}
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmingPostId(post.id)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      {isDeleting ? t('Deleting...') : t('Delete')}
                    </Button>
                  </BodyCell>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      )}

      <PaginationControls
        page={page}
        pageSize={ADMIN_PAGE_SIZE}
        total={total}
        onPageChange={onPageChange}
      />

      {error ? (
        <p
          className="text-destructive rounded-md border border-current p-3 text-sm"
          role="alert"
        >
          {t(getFriendlyErrorMessage(error, 'Could not delete post.'))}
        </p>
      ) : null}

      {confirmingPostId ? (
        <ConfirmDialog
          danger
          confirmLabel={t('Delete post')}
          description={t(
            'Delete this post permanently? This cannot be undone.',
          )}
          loadingLabel={t('Deleting...')}
          title={t('Delete post?')}
          onCancel={() => setConfirmingPostId(null)}
          onConfirm={() => {
            onDelete(confirmingPostId);
            setConfirmingPostId(null);
          }}
        />
      ) : null}
    </section>
  );
}

function ReportsTable({
  onStatusChange,
  onPageChange,
  onSearchChange,
  page,
  reports,
  searchQuery,
  total,
  updatingReportId,
}: {
  onPageChange: (page: number) => void;
  onSearchChange: (query: string) => void;
  onStatusChange: (reportId: string, status: AdminReport['status']) => void;
  page: number;
  reports: AdminReport[];
  searchQuery: string;
  total: number;
  updatingReportId: string | null;
}) {
  const { language, localizedPath, t } = useI18n();
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(
    null,
  );
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    reportId: string;
    status: AdminReport['status'];
  } | null>(null);

  if (reports.length === 0 && !searchQuery) {
    return (
      <EmptyState
        title={t('No reports')}
        description={t('Member reports will appear here.')}
      />
    );
  }

  return (
    <section className="space-y-3">
      <AdminSearch
        label={t('Search reports')}
        value={searchQuery}
        onChange={onSearchChange}
      />

      {reports.length === 0 ? (
        <EmptyState
          title={t('No matching results')}
          description={t('Try a different search.')}
        />
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <HeaderCell>{t('Report')}</HeaderCell>
              <HeaderCell>{t('Post')}</HeaderCell>
              <HeaderCell>{t('Reporter')}</HeaderCell>
              <HeaderCell>{t('Status')}</HeaderCell>
              <HeaderCell>{t('Created')}</HeaderCell>
              <HeaderCell>{t('Action')}</HeaderCell>
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
                      to={localizedPath(`/posts/${report.post.id}`)}
                    >
                      {report.post.title}
                    </Link>
                  ) : (
                    t('Deleted post')
                  )}
                </BodyCell>
                <BodyCell>{report.reporterName}</BodyCell>
                <BodyCell>
                  <select
                    aria-label={t('Report status')}
                    className="modern-input h-10 rounded-2xl px-3 text-sm outline-none"
                    disabled={updatingReportId === report.id}
                    value={report.status}
                    onChange={(event) =>
                      setPendingStatusChange({
                        reportId: report.id,
                        status: event.target.value as AdminReport['status'],
                      })
                    }
                  >
                    <option value="open">{t('OpenStatus')}</option>
                    <option value="reviewing">{t('Reviewing')}</option>
                    <option value="resolved">{t('Resolved')}</option>
                    <option value="dismissed">{t('Dismissed')}</option>
                  </select>
                </BodyCell>
                <BodyCell>{formatDate(report.createdAt, language)}</BodyCell>
                <BodyCell>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedReport(report)}
                  >
                    <Eye className="size-4" aria-hidden="true" />
                    {t('Details')}
                  </Button>
                </BodyCell>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      <PaginationControls
        page={page}
        pageSize={ADMIN_PAGE_SIZE}
        total={total}
        onPageChange={onPageChange}
      />

      {pendingStatusChange ? (
        <ConfirmDialog
          confirmLabel={t('Change status')}
          description={t('Update this report status?')}
          isLoading={updatingReportId === pendingStatusChange.reportId}
          loadingLabel={t('Saving...')}
          title={t('Update report status?')}
          onCancel={() => setPendingStatusChange(null)}
          onConfirm={() => {
            onStatusChange(
              pendingStatusChange.reportId,
              pendingStatusChange.status,
            );
            setPendingStatusChange(null);
          }}
        />
      ) : null}

      {selectedReport ? (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      ) : null}
    </section>
  );
}

function AdminSearch({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="glass-surface relative rounded-3xl p-2">
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <input
        aria-label={label}
        className="modern-input h-11 w-full rounded-2xl pr-3 pl-10 text-base outline-none"
        placeholder={label}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function PaginationControls({
  onPageChange,
  page,
  pageSize,
  total,
}: {
  onPageChange: (page: number) => void;
  page: number;
  pageSize: number;
  total: number;
}) {
  const { t } = useI18n();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-border/70 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        {from}-{to} {t('of')} {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          disabled={page === 0}
          type="button"
          variant="outline"
          onClick={() => onPageChange(Math.max(0, page - 1))}
        >
          {t('Previous')}
        </Button>
        <span className="text-muted-foreground px-2">
          {page + 1} / {pageCount}
        </span>
        <Button
          disabled={page + 1 >= pageCount}
          type="button"
          variant="outline"
          onClick={() => onPageChange(page + 1)}
        >
          {t('Next')}
        </Button>
      </div>
    </div>
  );
}

function ReportDetailModal({
  onClose,
  report,
}: {
  onClose: () => void;
  report: AdminReport;
}) {
  const { localizedPath, t } = useI18n();
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useDialogFocusTrap(dialogRef, {
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

  return (
    <div
      aria-labelledby="report-detail-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end bg-black/55 p-3 backdrop-blur-sm sm:items-center sm:justify-center"
      role="dialog"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="premium-card max-h-[90svh] w-full max-w-2xl overflow-y-auto rounded-3xl p-5 shadow-2xl"
        ref={dialogRef}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase">
              {t('Report details')}
            </p>
            <h2
              className="mt-1 text-xl font-semibold"
              id="report-detail-title"
            >
              {report.subject}
            </h2>
          </div>
          <Button
            aria-label={t('Close')}
            className="size-10 rounded-full p-0"
            ref={closeButtonRef}
            type="button"
            variant="outline"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-5 grid gap-4">
          <DetailBlock label={t('Reason')} value={report.subject} />
          <DetailBlock label={t('Report text')} value={report.body} />
          <DetailBlock label={t('Reporter')} value={report.reporterName} />
          <DetailBlock label={t('Status')} value={formatValue(report.status, t)} />

          <div className="rounded-2xl border border-border/70 p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase">
              {t('Post context')}
            </p>
            {report.post ? (
              <div className="mt-2 space-y-2">
                <Link
                  className="font-medium underline-offset-4 hover:underline"
                  to={localizedPath(`/posts/${report.post.id}`)}
                >
                  {report.post.title}
                </Link>
                <p className="text-muted-foreground text-sm">
                  {t(report.post.location)} - {formatValue(report.post.status, t)}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-2 text-sm">
                {t('Deleted post')}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-dashed border-border/80 p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase">
              {t('Status history')}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              {t('Status history is not available yet.')}
            </p>
            {/* TODO: Load report status history here after an admin audit log table is added. */}
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 p-4">
      <p className="text-muted-foreground text-xs font-semibold uppercase">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{value}</p>
    </div>
  );
}

function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="premium-card overflow-x-auto rounded-3xl">
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

function formatValue(value: string, t: (text: string) => string) {
  if (value === 'home') {
    return t('HomeCategory');
  }

  const label = value
    .replaceAll('_', ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase());

  return t(label);
}

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(getLanguageLocale(language), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
