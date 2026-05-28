import type { TicketPriority } from "../lib/api";

export default function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const style =
    priority === "Urgent"
      ? "bg-red-50 text-red-700 ring-red-200"
      : priority === "High"
        ? "bg-orange-50 text-orange-700 ring-orange-200"
        : priority === "Low"
          ? "bg-slate-50 text-slate-700 ring-slate-200"
          : "bg-emerald-50 text-emerald-700 ring-emerald-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ${style}`}>
      {priority}
    </span>
  );
}
