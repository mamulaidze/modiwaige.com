import { PackageOpen } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="premium-card rounded-3xl p-5">
      <PackageOpen className="text-primary size-5" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </div>
  );
}
