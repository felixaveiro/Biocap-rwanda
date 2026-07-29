import { BLOG_STATUS_LABELS, BlogStatus } from "@/types";

const STYLES: Record<string, string> = {
  // Lowercase API variants
  draft: "bg-slate-100 text-slate-600",
  pending_review: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  published: "bg-sky-100 text-sky-700",
  rejected: "bg-rose-100 text-rose-700",
  changes_requested: "bg-orange-100 text-orange-700",

  // Legacy / Uppercase fallbacks
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  PUBLISHED: "bg-sky-100 text-sky-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

const DEFAULT_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
  changes_requested: "Changes Requested",
};

export default function StatusBadge({ status }: { status: BlogStatus }) {
  const statusKey = (status as string) || "draft";

  // Resolve style and label safely
  const styleClass = STYLES[statusKey] || "bg-slate-100 text-slate-600";
  const label =
    BLOG_STATUS_LABELS[status as keyof typeof BLOG_STATUS_LABELS] ||
    DEFAULT_LABELS[statusKey] ||
    statusKey;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styleClass}`}
    >
      {label}
    </span>
  );
}