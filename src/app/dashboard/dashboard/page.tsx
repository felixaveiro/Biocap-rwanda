export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Welcome! Use the sidebar to navigate.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Posts", value: "0" },
          { label: "Drafts",      value: "0" },
          { label: "Published",   value: "0" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-indigo-600">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}