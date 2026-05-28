import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket, type TicketPriority } from "../lib/api";
import { getAuth } from "../lib/auth";

export default function NewTicketPage() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedTeam, setAssignedTeam] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAuth()) {
      navigate("/login");
    }
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createTicket({
        customer_name: customerName,
        customer_email: customerEmail,
        subject,
        description,
        order_number: orderNumber || undefined,
        priority,
        assigned_to: assignedTo || undefined,
        assigned_team: assignedTeam || undefined,
      });
      navigate(`/tickets/${res.ticket_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4">
        <div className="text-base font-semibold">Create ticket</div>
        <div className="text-sm text-slate-600">Capture customer info and route the request to the right support team.</div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <div className="text-sm font-medium">Customer name</div>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
              placeholder="e.g. Priya Sharma"
            />
          </label>
          <label className="space-y-1">
            <div className="text-sm font-medium">Customer email</div>
            <input
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              type="email"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
              placeholder="priya@example.com"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <div className="text-sm font-medium">Order number (optional)</div>
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
              placeholder="e.g. ORD-1001"
            />
          </label>
          <label className="space-y-1">
            <div className="text-sm font-medium">Priority</div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <div className="text-sm font-medium">Assigned to (optional)</div>
            <input
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
              placeholder="Agent email"
            />
          </label>
          <label className="space-y-1">
            <div className="text-sm font-medium">Team (optional)</div>
            <input
              value={assignedTeam}
              onChange={(e) => setAssignedTeam(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
              placeholder="e.g. Billing"
            />
          </label>
        </div>

        <label className="block space-y-1">
          <div className="text-sm font-medium">Issue title</div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
            placeholder="e.g. Unable to track my order"
          />
        </label>

        <label className="block space-y-1">
          <div className="text-sm font-medium">Description</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={6}
            className="w-full resize-y rounded-md border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
            placeholder="Describe the problem in detail…"
          />
        </label>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-md border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}

