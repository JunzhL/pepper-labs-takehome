/**
 * Reusable feedback UI blocks for loading and error states.
 * Provides consistent loading spinner and retryable error panel.
 * Keeps page components focused on data logic and avoids duplicated state UI markup.
 */
interface LoadingStateProps {
    label?: string;
}

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export function LoadingState({ label = "Loading products..." }: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-3 text-sm">{label}</p>
        </div>
    );
}

export function ErrorState({
    title = "Could not load products",
    message,
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm font-semibold text-destructive">{title}</p>
            <p className="mt-1 text-sm text-destructive/90">{message}</p>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 inline-flex h-9 items-center rounded-md border border-destructive/40 bg-background px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
                >
                    Retry
                </button>
            )}
        </div>
    );
}