import { PackageOpen } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="border-border bg-card rounded-[14px] border border-dashed p-6 text-center">
      <span className="bg-accent text-primary mx-auto flex size-10 items-center justify-center rounded-full">
        <PackageOpen className="size-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg leading-6 font-bold">{title}</h2>
      <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm leading-5">
        {description}
      </p>
    </div>
  );
}
