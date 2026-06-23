import { ImagePlus } from 'lucide-react';

import { Seo } from '@/shared/components/seo';
import { useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { CreatePostForm } from '../components/create-post-form';

export function CreatePostPage() {
  const { language, t } = useI18n();

  return (
    <PageContainer className="gap-6">
      <Seo
        noindex
        title={language === 'ge' ? 'განცხადების დამატება' : 'Create post'}
        description={
          language === 'ge'
            ? 'დაამატეთ უფასო ნივთის განცხადება Gaachuqe-ზე და დაეხმარეთ მას ახალი მფლობელის პოვნაში.'
            : 'Create a free giveaway post on Gaachuqe and help a useful item find a new owner.'
        }
      />
      <section className="border-border bg-card rounded-[14px] border p-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-accent text-primary flex size-10 shrink-0 items-center justify-center rounded-[10px]">
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
      </section>

      <CreatePostForm />
    </PageContainer>
  );
}
