export default function BotDetailsLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <p role="status" className="sr-only">
          Loading recent bot requests
        </p>
        <div
          aria-hidden="true"
          className="animate-pulse"
          aria-busy="true"
        >
          <div className="h-4 w-36 rounded bg-gray-200" />
          <div className="mt-4 h-8 w-56 rounded bg-gray-200" />
          <div className="mt-2 mb-6 h-4 w-64 rounded bg-gray-200" />
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-5 w-40 rounded bg-gray-200" />
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 border-b border-gray-100 pb-3"
                >
                  <div className="h-4 rounded bg-gray-100" />
                  <div className="h-4 rounded bg-gray-100" />
                  <div className="h-4 rounded bg-gray-100" />
                  <div className="h-4 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
