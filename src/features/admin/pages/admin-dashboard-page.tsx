import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  Eye,
  FileWarning,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/shared/components/confirm-dialog';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { getLanguageLocale, useI18n } from '@/shared/i18n/i18n';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { PageContainer } from '@/shared/layouts/page-container';
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
  const debouncedUserSearch = useDebouncedValue(usersState.search, 400);
  const debouncedPostSearch = useDebouncedValue(postsState.search, 400);
  const debouncedReportSearch = useDebouncedValue(reportsState.search, 400);

  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users', usersState.page, debouncedUserSearch],
    queryFn: () =>
      fetchAdminUsers({
        page: usersState.page,
        pageSize: ADMIN_PAGE_SIZE,
        search: debouncedUserSearch,
      }),
    enabled: activeTab === 'users',
  });

  const postsQuery = useQuery({
    queryKey: ['admin-posts', postsState.page, debouncedPostSearch],
    queryFn: () =>
      fetchAdminPosts({
        page: postsState.page,
        pageSize: ADMIN_PAGE_SIZE,
        search: debouncedPostSearch,
      }),
    enabled: activeTab === 'posts',
  });

  const reportsQuery = useQuery({
    queryKey: ['admin-reports', reportsState.page, debouncedReportSearch],
    queryFn: () =>
      fetchAdminReports({
        page: reportsState.page,
        pageSize: ADMIN_PAGE_SIZE,
        search: debouncedReportSearch,
      }),
    enabled: activeTab === 'reports',
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
      toast.success(t('Post deleted.'));
    },
    onError: (mutationError) =>
      toast.error(
        t(getFriendlyErrorMessage(mutationError, 'Could not delete post.')),
      ),
  });

  const reportStatusMutation = useMutation({
    mutationFn: (input: { reportId: string; status: AdminReport['status'] }) =>
      updateReportStatus(input.reportId, input.status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
      ]);
      toast.success(t('Report status updated.'));
    },
    onError: (mutationError) =>
      toast.error(t(getFriendlyErrorMessage(mutationError))),
  });

  const activeQuery =
    activeTab === 'users'
      ? usersQuery
      : activeTab === 'posts'
        ? postsQuery
        : reportsQuery;
  const isLoading = statsQuery.isLoading || activeQuery.isLoading;
  const error = statsQuery.error ?? activeQuery.error;

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
      <section className="premium-card rounded-[14px] p-5">
        <div className="flex items-start gap-3">
          <div className="bg-accent text-primary flex size-10 items-center justify-center rounded-[10px]">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl leading-[30px] font-bold tracking-tight">
              {t('Admin dashboard')}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('Review users, moderate posts, and triage reports.')}
            </p>
          </div>
        </div>
      </section>

      {statsQuery.data ? <StatsGrid stats={statsQuery.data} /> : null}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AdminTab)}
      >
        <TabsList className="grid-cols-3" aria-label={t('Admin dashboard')}>
          <TabsTrigger value="users">{t('Users')}</TabsTrigger>
          <TabsTrigger value="posts">{t('Posts')}</TabsTrigger>
          <TabsTrigger value="reports">{t('Reports')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <LoadingState
          title={t('Loading admin data')}
          description={t('Gaachuqe is loading moderation records.')}
          variant="admin"
        />
      ) : null}

      {error ? (
        <div className="premium-card rounded-[14px] p-4" role="alert">
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
          onSearchChange={(search) => setUsersState({ page: 0, search })}
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
          onSearchChange={(search) => setPostsState({ page: 0, search })}
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
          onSearchChange={(search) => setReportsState({ page: 0, search })}
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
    <div className="premium-card rounded-[14px] p-4">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <BarChart3 className="size-4" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
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
                  <Select
                    disabled={updatingReportId === report.id}
                    value={report.status}
                    onValueChange={(status) =>
                      setPendingStatusChange({
                        reportId: report.id,
                        status: status as AdminReport['status'],
                      })
                    }
                  >
                    <SelectTrigger
                      aria-label={t('Report status')}
                      className="h-10 min-w-36 text-sm"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">{t('OpenStatus')}</SelectItem>
                      <SelectItem value="reviewing">
                        {t('Reviewing')}
                      </SelectItem>
                      <SelectItem value="resolved">{t('Resolved')}</SelectItem>
                      <SelectItem value="dismissed">
                        {t('Dismissed')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
    <div className="border-border bg-card relative rounded-[14px] border p-2">
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <input
        aria-label={label}
        className="modern-input h-11 w-full rounded-[10px] pr-3 pl-10 text-base outline-none"
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
    <div className="border-border flex flex-col gap-3 rounded-[14px] border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
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

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-2xl" closeLabel={t('Close')}>
        <div className="pr-10">
          <p className="text-muted-foreground text-xs font-semibold uppercase">
            {t('Report details')}
          </p>
          <DialogTitle className="mt-1 text-xl font-semibold">
            {report.subject}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('Report details')}
          </DialogDescription>
        </div>

        <div className="mt-5 grid gap-4">
          <DetailBlock label={t('Reason')} value={report.subject} />
          <DetailBlock label={t('Report text')} value={report.body} />
          <DetailBlock label={t('Reporter')} value={report.reporterName} />
          <DetailBlock
            label={t('Status')}
            value={formatValue(report.status, t)}
          />

          <div className="border-border rounded-[10px] border p-4">
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
                  {t(report.post.location)} -{' '}
                  {formatValue(report.post.status, t)}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground mt-2 text-sm">
                {t('Deleted post')}
              </p>
            )}
          </div>

          <div className="border-border rounded-[10px] border border-dashed p-4">
            <p className="text-muted-foreground text-xs font-semibold uppercase">
              {t('Status history')}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              {t('Status history is not available yet.')}
            </p>
            {/* TODO: Load report status history here after an admin audit log table is added. */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border rounded-[10px] border p-4">
      <p className="text-muted-foreground text-xs font-semibold uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="premium-card overflow-x-auto rounded-[14px]">
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
