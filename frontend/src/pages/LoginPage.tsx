import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAgent, type AgentAuth } from "../lib/api";
import { setAuth } from "../lib/auth";

export default function LoginPage({ onLogin }: { onLogin: (agent: AgentAuth) => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const agent = await loginAgent({ email, token });
      setAuth(agent);
      onLogin(agent);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="text-xl font-semibold">Support agent login</div>
        <div className="mt-2 text-sm text-slate-600">Use your agent credentials to manage tickets and customer replies.</div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-lg border bg-white p-6">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Agent email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
            placeholder="agent@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Agent token</span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            className="w-full rounded-md border px-3 py-2 text-sm outline-none ring-slate-200 focus:ring-2"
            placeholder="Enter your token"
          />
        </label>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
