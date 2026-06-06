type LoadingStateProps = {
  title: string;
  description: string;
};

export function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <div
      className="bg-card rounded-lg border p-4"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="border-primary size-5 animate-spin rounded-full border-2 border-t-transparent" />
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </div>
  );
}
