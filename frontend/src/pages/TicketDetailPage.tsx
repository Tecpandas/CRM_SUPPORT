import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import Toast from "../components/Toast";
import {
  getTicket,
  updateTicket,
  uploadTicketAttachment,
  type TicketDetail,
  type TicketPriority,
  type TicketStatus,
} from "../lib/api";
import { getAuth } from "../lib/auth";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [status, setStatus] = useState<TicketStatus>("Open");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedTeam, setAssignedTeam] = useState("");
  const [note, setNote] = useState("");
  const [noteVisibility, setNoteVisibility] = useState("Internal");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      setPriority(data.priority);
      setAssignedTo(data.assigned_to ?? "");
      setAssignedTeam(data.assigned_team ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!getAuth()) {
      navigate("/login");
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, navigate]);

  async function save() {
    if (!ticketId) return;
    setSaving(true);
    setError(null);
    try {
      await updateTicket(ticketId, {
        status,
        priority,
        assigned_to: assignedTo || undefined,
        assigned_team: assignedTeam || undefined,
        notes: note.trim() ? note : undefined,
        note_visibility: note.trim() ? noteVisibility : undefined,
      });
      setNote("");
      setNoteVisibility("Internal");
      await refresh();
      setToast("Saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update ticket.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadAttachment() {
    if (!ticketId || !attachmentFile) return;
    setUploading(true);
    setError(null);
    try {
      await uploadTicketAttachment(ticketId, attachmentFile);
      setAttachmentFile(null);
      await refresh();
      setToast("Attachment uploaded");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload attachment.");
    } finally {
      setUploading(false);
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
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
              <div className="flex items-center gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>
            <div className="mt-1 text-sm text-slate-600">{ticket.subject}</div>
            {ticket.order_number ? (
              <div className="mt-2 text-sm text-slate-500">Order: {ticket.order_number}</div>
            ) : null}
            <div className="mt-2 text-sm text-slate-700">
              <span className="font-medium">Customer:</span> {ticket.customer_name} ·{" "}
              <a className="underline underline-offset-2" href={`mailto:${ticket.customer_email}`}>
                {ticket.customer_email}
              </a>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
              <div>
                <span className="font-medium">Assigned to:</span> {ticket.assigned_to ?? "Unassigned"}
              </div>
              <div>
                <span className="font-medium">Team:</span> {ticket.assigned_team ?? "Any"}
              </div>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
              <div>
                <span className="font-medium">Customer replies:</span> {ticket.customer_replies_count}
              </div>
              {ticket.last_customer_reply_at ? (
                <div>
                  <span className="font-medium">Last customer reply:</span> {formatDate(ticket.last_customer_reply_at)}
                </div>
              ) : null}
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
          <div className="text-sm font-semibold">Update ticket</div>
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
              <div className="text-sm font-medium">Priority</div>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
              >
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
                <option value="Low">Low</option>
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <div className="text-sm font-medium">Assigned to</div>
                <input
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
                  placeholder="Agent email"
                />
              </label>
              <label className="space-y-1">
                <div className="text-sm font-medium">Team</div>
                <input
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
                  placeholder="Billing, Support, Escalations"
                />
              </label>
            </div>
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
            <label className="block space-y-1">
              <div className="text-sm font-medium">Note visibility</div>
              <select
                value={noteVisibility}
                onChange={(e) => setNoteVisibility(e.target.value)}
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
              >
                <option value="Internal">Internal</option>
                <option value="Customer">Customer</option>
              </select>
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
          <div className="text-sm font-semibold">Files & notes</div>
          <div className="mt-3 space-y-4">
            <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-medium text-slate-900">Attachments</div>
              {ticket.attachments.length === 0 ? (
                <div className="mt-2 text-slate-600">No files uploaded yet.</div>
              ) : (
                <ul className="mt-2 space-y-2">
                  {ticket.attachments.map((attachment) => (
                    <li key={attachment.url} className="flex flex-col gap-1 rounded-md border bg-white p-3">
                      <a
                        className="font-medium text-slate-900 underline underline-offset-2"
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {attachment.file_name}
                      </a>
                      <div className="text-xs text-slate-500">
                        Uploaded by {attachment.uploaded_by ?? "unknown"} · {formatDate(attachment.created_at)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-medium text-slate-900">Upload attachment</div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)}
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={uploadAttachment}
                  disabled={uploading || !attachmentFile}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Upload file"}
                </button>
              </div>
            </div>
            <div className="rounded-lg border bg-slate-50 p-3">
              <div className="text-sm font-medium text-slate-900">Notes</div>
              {ticket.notes.length === 0 ? (
                <div className="mt-2 text-sm text-slate-600">No notes yet.</div>
              ) : (
                <div className="mt-3 space-y-3">
                  {ticket.notes.map((n, idx) => (
                    <div key={`${n.created_at}-${idx}`} className="rounded-lg border bg-white p-3">
                      <div className="flex flex-col gap-1 text-sm text-slate-800 sm:flex-row sm:items-center sm:justify-between">
                        <div className="font-medium text-slate-900">{n.author_name ?? n.author_email ?? "System"}</div>
                        <div className="text-xs text-slate-500">{n.visibility}</div>
                      </div>
                      <div className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{n.note_text}</div>
                      <div className="mt-2 text-xs text-slate-500">{formatDate(n.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

