import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-foreground/10",
        className
      )}
    />
  );
}

export function ImageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-foreground/20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-5">
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <div>
        <Skeleton className="h-4 w-40 mb-2" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  );
}

export function ButtonLoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
