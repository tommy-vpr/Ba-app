import { IconMapPin } from "@tabler/icons-react";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full max-w-[1200px] mx-auto">
      <div className="h-8 w-36 rounded-sm animate-pulse bg-white dark:bg-white/10" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
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
    </div>
  );
}
