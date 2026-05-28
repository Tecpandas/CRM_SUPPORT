export type AgentAuth = {
  name: string;
  email: string;
  token: string;
  team: string;
};

const STORAGE_KEY = "support-crm-agent";

export function getAuth(): AgentAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AgentAuth;
  } catch {
    return null;
  }
}

export function setAuth(agent: AgentAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agent));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function authHeaders(): Record<string, string> {
  const auth = getAuth();
  if (!auth) return {};
  return {
    Authorization: `Bearer ${auth.token}`,
    "X-Agent-Email": auth.email,
  };
}

export function isAuthenticated() {
  return getAuth() !== null;
}
