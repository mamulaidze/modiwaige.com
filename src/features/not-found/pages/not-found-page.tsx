import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col items-start justify-center gap-4 px-4">
      <p className="text-primary text-sm font-medium">404</p>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">
        The page you requested does not exist in Gaachuqe.
      </p>
      <Button asChild>
        <Link to="/">Go home</Link>
      </Button>
    </main>
  );
}
