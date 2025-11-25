export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
      <div className="text-center space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Dashboard</p>
        <h1 className="text-4xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">
          The page you are looking for doesn&apos;t exist. Use the navigation to return
          to the central fuel dashboard.
        </p>
      </div>
    </div>
  );
}
