export default function Loading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg border p-6 space-y-2 animate-pulse bg-white dark:bg-[#333] shadow-sm"
        >
          <div className="h-8 w-1/2 bg-muted rounded" />
          <div className="h-6 w-3/4 bg-muted/60 rounded" />
          <div className="h-6 w-2/3 bg-muted/60 rounded" />
          <div className="h-6 w-full bg-muted/60 rounded" />
        </div>
      ))}
    </div>
  );
}
