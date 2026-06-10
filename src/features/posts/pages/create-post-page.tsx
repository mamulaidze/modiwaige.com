import { ImagePlus } from 'lucide-react';

import { useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { CreatePostForm } from '../components/create-post-form';

export function CreatePostPage() {
  const { t } = useI18n();

  return (
    <PageContainer className="gap-6">
      <section className="premium-card rounded-3xl p-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-primary text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-[0_10px_24px_hsl(154_54%_30%/0.24)]">
            <ImagePlus className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight [overflow-wrap:anywhere] break-words sm:text-2xl">
              {t('Create Post')}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm [overflow-wrap:anywhere] break-words">
              {t('Give away an unwanted item for free.')}
            </p>
          </div>
        </div>
      </section>

      <CreatePostForm />
    </PageContainer>
  );
}
