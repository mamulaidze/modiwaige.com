export function RouteLoading() {
  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 pb-24 sm:px-6 md:py-8 md:pb-8 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="bg-card rounded-lg border p-4">
        <div className="border-primary size-5 animate-spin rounded-full border-2 border-t-transparent" />
        <h1 className="mt-3 text-lg font-semibold">Loading page</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Gaachuqe is preparing this view.
        </p>
      </div>
    </main>
  );
}
