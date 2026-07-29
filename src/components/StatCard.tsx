export default function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 group-hover:text-[#E52B67] transition-colors">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-slate-400 font-medium">
          {hint}
        </p>
      )}
    </div>
  );
}