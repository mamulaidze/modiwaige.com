import { Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MobileHeader() {
  return (
    <div className="mx-auto flex min-h-16 w-full max-w-5xl items-center px-4 py-3 md:hidden">
      <Link className="flex items-center gap-3" to="/">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
          <Gift className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-base leading-none font-semibold">Gaachuqe</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Free giving in Georgia
          </p>
        </div>
      </Link>
    </div>
  );
}
