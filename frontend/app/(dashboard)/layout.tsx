/**
 * Dashboard layout with simple header.
 * Wraps all creator-side pages (form list, builder, results).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple header */}
      <header className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-neutral-900">
            Typeform Clone
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
