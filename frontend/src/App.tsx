import { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import TicketListPage from "./pages/TicketListPage";
import NewTicketPage from "./pages/NewTicketPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import LoginPage from "./pages/LoginPage";
import { AgentAuth, clearAuth, getAuth } from "./lib/auth";

function TopBar({ agent, onLogout }: { agent: AgentAuth | null; onLogout: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Support CRM
        </Link>

        <div className="flex items-center gap-3">
          {agent ? (
            <>
              <div className="text-sm text-slate-600">
                Logged in as <span className="font-semibold text-slate-900">{agent.name}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearAuth();
                  onLogout();
                  navigate("/login");
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              Agent login
            </Link>
          )}
          <Link
            to="/tickets/new"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            New Ticket
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [agent, setAgent] = useState<AgentAuth | null>(null);

  useEffect(() => {
    setAgent(getAuth());
  }, []);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-slate-100">
      <TopBar agent={agent} onLogout={() => setAgent(null)} />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<TicketListPage />} />
          <Route path="/tickets/new" element={<NewTicketPage />} />
          <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
          <Route path="/login" element={<LoginPage onLogin={setAgent} />} />
        </Routes>
      </div>
    </div>
  );
}

