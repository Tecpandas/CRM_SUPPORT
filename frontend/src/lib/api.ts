import { authHeaders } from "./auth";

export type TicketStatus = "Open" | "In Progress" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export type Attachment = {
  file_name: string;
  content_type: string;
  url: string;
  uploaded_by: string | null;
  created_at: string;
};

export type TicketListItem = {
  ticket_id: string;
  order_number: string | null;
  customer_name: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  assigned_team: string | null;
  customer_replies_count: number;
  created_at: string;
};

export type TicketDetail = {
  ticket_id: string;
  order_number: string | null;
  priority: TicketPriority;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: TicketStatus;
  assigned_to: string | null;
  assigned_team: string | null;
  customer_replies_count: number;
  last_customer_reply_at: string | null;
  created_at: string;
  updated_at: string;
  notes: { note_text: string; author_name: string | null; author_email: string | null; visibility: string; created_at: string }[];
  attachments: Attachment[];
};

export type AgentAuth = {
  name: string;
  email: string;
  team: string;
  token: string;
};

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
    ...authHeaders(),
  };

  if (!(init?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export async function loginAgent(input: { email: string; token: string }) {
  return http<AgentAuth>("/api/agents/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createTicket(input: {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  order_number?: string;
  priority?: TicketPriority;
  assigned_to?: string;
  assigned_team?: string;
}) {
  return http<{
    ticket_id: string;
    created_at: string;
    order_number: string | null;
    priority: TicketPriority;
    assigned_to: string | null;
    assigned_team: string | null;
  }>("/api/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listTickets(params: {
  status?: TicketStatus | "";
  priority?: TicketPriority | "";
  search?: string;
}) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.priority) qs.set("priority", params.priority);
  if (params.search?.trim()) qs.set("search", params.search.trim());
  const query = qs.toString();
  return http<TicketListItem[]>(`/api/tickets${query ? `?${query}` : ""}`);
}

export async function getTicket(ticketId: string) {
  return http<TicketDetail>(`/api/tickets/${encodeURIComponent(ticketId)}`);
}

export async function updateTicket(
  ticketId: string,
  input: {
    status?: TicketStatus;
    priority?: TicketPriority;
    notes?: string;
    note_visibility?: string;
    assigned_to?: string;
    assigned_team?: string;
  },
) {
  return http<{ success: boolean; updated_at: string }>(`/api/tickets/${encodeURIComponent(ticketId)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function uploadTicketAttachment(ticketId: string, file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}/attachments`, {
    method: "POST",
    body: form,
    headers: {
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed: ${res.status}`);
  }

  return (await res.json()) as Attachment;
}

