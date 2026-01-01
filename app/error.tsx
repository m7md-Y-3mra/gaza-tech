'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { parseZodErrorClient } from '@/lib/zod-error';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="from-background to-muted/20 flex h-screen items-center justify-center bg-gradient-to-br">
      <div className="mx-4 flex max-w-md flex-col items-center justify-center gap-6 text-center">
        <div className="relative">
          <div className="bg-destructive/20 absolute inset-0 animate-ping rounded-full blur-xl" />
          <div className="bg-destructive/10 relative rounded-full p-6">
            <AlertCircle className="text-destructive h-16 w-16" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Oops!</h1>
          <h2 className="text-muted-foreground text-xl font-semibold">
            Something went wrong
          </h2>
          <p className="text-muted-foreground/80 text-sm font-bold">
            {error.name === 'ZodError'
              ? parseZodErrorClient(error.message)
              : error.message ||
                'An unexpected error occurred. Please try again.'}
          </p>
          {error.digest && (
            <p className="text-muted-foreground/60 text-xs">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={reset} size="lg" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
