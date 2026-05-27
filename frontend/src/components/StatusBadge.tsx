import type { TicketStatus } from "../lib/api";

export default function StatusBadge({ status }: { status: TicketStatus }) {
  const style =
    status === "Open"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : status === "In Progress"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-emerald-50 text-emerald-700 ring-emerald-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ${style}`}>
      {status}
    </span>
  );
}

