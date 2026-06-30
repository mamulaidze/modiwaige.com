import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  ImagePlus,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { fetchProfileSummary } from '@/features/account/api/profile-api';
import { useAuth } from '@/features/auth/context/use-auth';
import { LoadingState } from '@/shared/components/loading-state';
import { Seo } from '@/shared/components/seo';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { CreatePostForm } from '../components/create-post-form';

export function CreatePostPage() {
  const { user } = useAuth();
  const { language, localizedPath, t } = useI18n();
  const profileQuery = useQuery({
    queryKey: ['profile-summary', user?.id],
    queryFn: () => fetchProfileSummary(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });
  const hasPhoneNumber = Boolean(profileQuery.data?.phoneNumber?.trim());

  return (
    <PageContainer className="max-w-6xl gap-4 pb-36 md:gap-6 md:pb-10">
      <Seo
        noindex
        title={language === 'ge' ? 'განცხადების დამატება' : 'Create post'}
        description={
          language === 'ge'
            ? 'დაამატეთ უფასო ნივთის განცხადება Gaachuqe-ზე და დაეხმარეთ მას ახალი მფლობელის პოვნაში.'
            : 'Create a free giveaway post on Gaachuqe and help a useful item find a new owner.'
        }
      />
      <section className="premium-card rounded-[16px] p-4 sm:p-5">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-[12px]">
              <ImagePlus className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl leading-7 font-bold tracking-tight [overflow-wrap:anywhere] break-words sm:text-2xl sm:leading-[30px]">
                {t('Create Post')}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm [overflow-wrap:anywhere] break-words">
                {t('Give away an unwanted item for free.')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs sm:w-[330px]">
            <CreatePostSignal
              icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
              label={t('Free')}
            />
            <CreatePostSignal
              icon={<ImagePlus className="size-4" aria-hidden="true" />}
              label={t('Photos')}
            />
            <CreatePostSignal
              icon={<MapPin className="size-4" aria-hidden="true" />}
              label={t('Pickup')}
            />
          </div>
        </div>
      </section>

      <section className="border-border bg-card/70 rounded-[14px] border p-3 text-sm sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-accent text-primary flex size-9 shrink-0 items-center justify-center rounded-[10px]">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </div>
          <p className="text-muted-foreground leading-6">
            {t(
              'Posts are always free. Add clear photos and pickup details so people know exactly what they are requesting.',
            )}
          </p>
        </div>
      </section>

      {profileQuery.isLoading ? (
        <LoadingState
          title={t('Loading profile')}
          description={t('Gaachuqe is loading your account.')}
          variant="account"
        />
      ) : null}

      {profileQuery.isError ? (
        <div className="bg-card rounded-lg border p-4" role="alert">
          <h2 className="text-destructive font-semibold">
            {t('Could not load profile')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t('Please try again.')}
          </p>
        </div>
      ) : null}

      {!profileQuery.isLoading && !profileQuery.isError && hasPhoneNumber ? (
        <CreatePostForm />
      ) : null}

      {!profileQuery.isLoading && !profileQuery.isError && !hasPhoneNumber ? (
        <section className="border-border bg-card rounded-[14px] border p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-[10px]">
              <Phone className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg leading-6 font-bold">
                {t('Phone number required')}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
                {t(
                  'Add a Georgian mobile number in profile settings before creating posts or reserving items.',
                )}
              </p>
              <Button asChild className="mt-4">
                <Link to={localizedPath('/profile?tab=settings')}>
                  {t('Add phone number')}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </PageContainer>
  );
}

function CreatePostSignal({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="soft-surface flex min-w-0 items-center justify-center gap-1.5 rounded-[10px] px-2 py-2 font-semibold">
      <span className="text-primary shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}
