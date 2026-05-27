import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import Toast from "../components/Toast";
import { listTickets, type TicketListItem, type TicketStatus } from "../lib/api";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "blue" | "amber" | "emerald";
}) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-50 text-blue-700 ring-blue-200"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : tone === "emerald"
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-slate-50 text-slate-700 ring-slate-200";

  return (
    <div className="card p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <div className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ${toneClass}`}>{label}</div>
      </div>
    </div>
  );
}

export default function TicketListPage() {
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<TicketListItem[]>([]);
  const [allItems, setAllItems] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  const query = useMemo(() => ({ status, search }), [status, search]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const run = async () => {
      try {
        const [data, all] = await Promise.all([listTickets(query), listTickets({ status: "", search: "" })]);
        setItems(data);
        setAllItems(all);
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

  const counts = useMemo(() => {
    const base = allItems.length ? allItems : items;
    return {
      total: base.length,
      open: base.filter((t) => t.status === "Open").length,
      progress: base.filter((t) => t.status === "In Progress").length,
      closed: base.filter((t) => t.status === "Closed").length,
    };
  }, [allItems, items]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied to clipboard");
    } catch {
      setToast("Copy failed");
    }
  }

  return (
    <div className="space-y-4">
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="card p-4">
        <div className="min-w-0">
          <div className="text-base font-semibold">Tickets</div>
          <div className="text-sm text-slate-600">Search, filter, and track customer issues.</div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, name, email, subject, description…"
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none ring-slate-200 placeholder:text-slate-400 focus:ring-2 sm:w-[360px]"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TicketStatus | "")}
            className="rounded-lg border bg-white px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
          >
            <option value="">All statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
          </div>
          <Link
            to="/tickets/new"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Create ticket
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={counts.total} tone="slate" />
        <StatCard label="Open" value={counts.open} tone="blue" />
        <StatCard label="In Progress" value={counts.progress} tone="amber" />
        <StatCard label="Closed" value={counts.closed} tone="emerald" />
      </div>

      {error ? (
        <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="card overflow-hidden">
        <div className="grid grid-cols-12 border-b bg-slate-50/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <div className="col-span-2">Ticket</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-4">Subject</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Created</div>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-sm text-slate-600">Loading tickets…</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-10 text-sm text-slate-600">
            <div className="text-base font-semibold text-slate-900">No results</div>
            <div className="mt-1">
              Try changing the status filter or search term — or{" "}
              <Link to="/tickets/new" className="font-medium text-slate-900 underline underline-offset-2">
                create a ticket
              </Link>
              .
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {items.map((t) => (
              <div
                key={t.ticket_id}
                className="grid grid-cols-12 items-center px-4 py-3 text-sm hover:bg-slate-50"
              >
                <div className="col-span-2 flex items-center gap-2">
                  <Link to={`/tickets/${t.ticket_id}`} className="font-medium text-slate-900 hover:underline">
                    {t.ticket_id}
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      void copy(t.ticket_id);
                    }}
                    className="rounded-md border bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                    title="Copy ticket ID"
                  >
                    Copy
                  </button>
                </div>
                <div className="col-span-3 truncate text-slate-700">{t.customer_name}</div>
                <div className="col-span-4 truncate text-slate-700">
                  <Link to={`/tickets/${t.ticket_id}`} className="hover:underline">
                    {t.subject}
                  </Link>
                </div>
                <div className="col-span-1">
                  <StatusBadge status={t.status} />
                </div>
                <div className="col-span-2 text-right text-slate-600">{formatDate(t.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

