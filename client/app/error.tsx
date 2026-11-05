'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="px-5 py-2 mx-auto w-full max-w-7xl">
      <div className="mt-5 flex flex-col items-center gap-4 rounded-xl border border-dashed py-12 text-center">
        <p className="text-muted-foreground">No se pudieron cargar los datos</p>
        <Button onClick={() => retry()}>Reintentar</Button>
      </div>
    </main>
  );
}
