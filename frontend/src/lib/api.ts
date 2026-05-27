export type TicketStatus = "Open" | "In Progress" | "Closed";

export type TicketListItem = {
  ticket_id: string;
  customer_name: string;
  subject: string;
  status: TicketStatus;
  created_at: string;
};

export type TicketDetail = {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  notes: { note_text: string; created_at: string }[];
};

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export async function createTicket(input: {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
}) {
  return http<{ ticket_id: string; created_at: string }>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listTickets(params: { status?: TicketStatus | ""; search?: string }) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.search?.trim()) qs.set("search", params.search.trim());
  const query = qs.toString();
  return http<TicketListItem[]>(`/api/tickets${query ? `?${query}` : ""}`);
}

export async function getTicket(ticketId: string) {
  return http<TicketDetail>(`/api/tickets/${encodeURIComponent(ticketId)}`);
}

export async function updateTicket(
  ticketId: string,
  input: { status?: TicketStatus; notes?: string },
) {
  return http<{ success: boolean; updated_at: string }>(`/api/tickets/${encodeURIComponent(ticketId)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

