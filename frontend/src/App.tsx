import { Link, Route, Routes } from "react-router-dom";
import TicketListPage from "./pages/TicketListPage";
import NewTicketPage from "./pages/NewTicketPage";
import TicketDetailPage from "./pages/TicketDetailPage";

function TopBar() {
  return (
    <div className="border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Support CRM
        </Link>
        <div className="flex items-center gap-3">
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
  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-slate-100">
      <TopBar />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<TicketListPage />} />
          <Route path="/tickets/new" element={<NewTicketPage />} />
          <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
        </Routes>
      </div>
    </div>
  );
}

