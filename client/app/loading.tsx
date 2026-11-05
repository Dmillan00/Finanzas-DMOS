export default function Loading() {
  return (
    <main className="px-5 py-2 mx-auto w-full max-w-7xl">
      <div className="h-9 w-48 rounded-lg bg-muted animate-pulse" />
      <div className="mt-1 h-5 w-24 rounded bg-muted animate-pulse" />

      <div className="mt-5 flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </main>
  );
}
