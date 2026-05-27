import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import Toast from "../components/Toast";
import { getTicket, updateTicket, type TicketDetail, type TicketStatus } from "../lib/api";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [status, setStatus] = useState<TicketStatus>("Open");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function refresh() {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTicket(ticketId);
      setTicket(data);
      setStatus(data.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  async function save() {
    if (!ticketId) return;
    setSaving(true);
    setError(null);
    try {
      await updateTicket(ticketId, { status, notes: note.trim() ? note : undefined });
      setNote("");
      await refresh();
      setToast("Saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update ticket.");
    } finally {
      setSaving(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied to clipboard");
    } catch {
      setToast("Copy failed");
    }
  }

  if (loading) return <div className="text-sm text-slate-600">Loading…</div>;
  if (error)
    return (
      <div className="space-y-3">
        <div className="card border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        <Link to="/" className="text-sm font-medium text-slate-900 underline underline-offset-2">
          Back to tickets
        </Link>
      </div>
    );
  if (!ticket) return null;

  return (
    <div className="space-y-4">
      <Toast message={toast} onClose={() => setToast(null)} />

      <div className="card p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="text-base font-semibold">{ticket.ticket_id}</div>
                <button
                  type="button"
                  onClick={() => void copy(ticket.ticket_id)}
                  className="rounded-md border bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  title="Copy ticket ID"
                >
                  Copy
                </button>
              </div>
              <StatusBadge status={ticket.status} />
            </div>
            <div className="mt-1 text-sm text-slate-600">{ticket.subject}</div>
            <div className="mt-2 text-sm text-slate-700">
              <span className="font-medium">Customer:</span> {ticket.customer_name} ·{" "}
              <a className="underline underline-offset-2" href={`mailto:${ticket.customer_email}`}>
                {ticket.customer_email}
              </a>
            </div>
          </div>

          <div className="text-sm text-slate-600">
            <div>
              <span className="font-medium text-slate-700">Created:</span> {formatDate(ticket.created_at)}
            </div>
            <div>
              <span className="font-medium text-slate-700">Updated:</span> {formatDate(ticket.updated_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="text-sm font-semibold">Description</div>
        <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{ticket.description}</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <div className="text-sm font-semibold">Update</div>
          <div className="mt-3 space-y-3">
            <label className="block space-y-1">
              <div className="text-sm font-medium">Status</div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </label>

            <label className="block space-y-1">
              <div className="text-sm font-medium">Add note</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
                placeholder="Internal note / customer update…"
              />
            </label>

            <div className="flex items-center justify-end gap-3">
              <Link
                to="/"
                className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Back
              </Link>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="text-sm font-semibold">Notes</div>
          {ticket.notes.length === 0 ? (
            <div className="mt-2 text-sm text-slate-600">No notes yet.</div>
          ) : (
            <div className="mt-3 space-y-3">
              {ticket.notes.map((n, idx) => (
                <div key={`${n.created_at}-${idx}`} className="rounded-lg border bg-slate-50 p-3">
                  <div className="whitespace-pre-wrap text-sm text-slate-800">{n.note_text}</div>
                  <div className="mt-2 text-xs text-slate-600">{formatDate(n.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

