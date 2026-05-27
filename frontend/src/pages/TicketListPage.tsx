import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { listTickets, type TicketListItem, type TicketStatus } from "../lib/api";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function TicketListPage() {
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  const query = useMemo(() => ({ status, search }), [status, search]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const run = async () => {
      try {
        const data = await listTickets(query);
        setItems(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(run, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-base font-semibold">Tickets</div>
          <div className="text-sm text-slate-600">Search, filter, and track customer issues.</div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, name, email, subject, description…"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-slate-200 placeholder:text-slate-400 focus:ring-2 sm:w-[360px]"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TicketStatus | "")}
            className="rounded-md border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
          >
            <option value="">All statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="grid grid-cols-12 border-b bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <div className="col-span-2">Ticket</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-4">Subject</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Created</div>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-sm text-slate-600">Loading…</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-600">
            No tickets yet.{" "}
            <Link to="/tickets/new" className="font-medium text-slate-900 underline underline-offset-2">
              Create the first ticket
            </Link>
            .
          </div>
        ) : (
          <div className="divide-y">
            {items.map((t) => (
              <Link
                key={t.ticket_id}
                to={`/tickets/${t.ticket_id}`}
                className="grid grid-cols-12 items-center px-4 py-3 text-sm hover:bg-slate-50"
              >
                <div className="col-span-2 font-medium text-slate-900">{t.ticket_id}</div>
                <div className="col-span-3 truncate text-slate-700">{t.customer_name}</div>
                <div className="col-span-4 truncate text-slate-700">{t.subject}</div>
                <div className="col-span-1">
                  <StatusBadge status={t.status} />
                </div>
                <div className="col-span-2 text-right text-slate-600">{formatDate(t.created_at)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

