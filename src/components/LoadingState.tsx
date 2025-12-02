// Skeleton loading states for better UX

export function FeedItemSkeleton() {
  return (
    <div className="block p-4 border-b border-slate-800 animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div className="h-5 w-24 bg-slate-800 rounded"></div>
        <div className="h-4 w-12 bg-slate-800 rounded"></div>
      </div>
      <div className="h-5 w-full bg-slate-800 rounded mb-2"></div>
      <div className="h-5 w-3/4 bg-slate-800 rounded mb-3"></div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-slate-800 rounded"></div>
        <div className="h-4 w-20 bg-slate-800 rounded"></div>
      </div>
    </div>
  );
}

export function SourceCardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="w-12 h-12 bg-slate-800 rounded"></div>
        <div className="h-5 w-16 bg-slate-800 rounded"></div>
      </div>
      <div className="h-6 w-full bg-slate-800 rounded mb-2"></div>
      <div className="h-4 w-2/3 bg-slate-800 rounded mb-3"></div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
        <div className="h-4 w-24 bg-slate-800 rounded"></div>
        <div className="h-4 w-4 bg-slate-800 rounded-full"></div>
      </div>
    </div>
  );
}

export function FeedGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <FeedItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function SourceGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SourceCardSkeleton key={i} />
      ))}
    </div>
  );
}
