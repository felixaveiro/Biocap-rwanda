import { BLOG_STATUS_LABELS, BlogStatus } from "@/types";

const STYLES: Record<BlogStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

export default function StatusBadge({ status }: { status: BlogStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {BLOG_STATUS_LABELS[status]}
    </span>
  );
}