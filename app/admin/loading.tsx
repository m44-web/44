export default function AdminLoading() {
  return (
    <div className="min-h-screen">
      <div className="bg-surface border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center py-2 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-white/10 p-4">
              <div className="h-3 bg-white/5 rounded w-16 mb-2 animate-pulse" />
              <div className="h-6 bg-white/10 rounded w-20 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-64 bg-surface rounded-xl border border-white/10 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-surface rounded-xl border border-white/10 animate-pulse" />
          <div className="space-y-6">
            <div className="h-48 bg-surface rounded-xl border border-white/10 animate-pulse" />
            <div className="h-32 bg-surface rounded-xl border border-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
