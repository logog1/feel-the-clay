import {
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  AlertTriangle,
  UserX,
} from "lucide-react";

// Color mapping for booking/order status pills used in AdminDashboard.
export const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-emerald-600 text-white border-emerald-700",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  no_show: "bg-zinc-200 text-zinc-700 border-zinc-300",
  delivered: "bg-blue-100 text-blue-800 border-blue-200",
  packed: "bg-purple-100 text-purple-800 border-purple-200",
  retour: "bg-orange-100 text-orange-800 border-orange-200",
  done: "bg-teal-100 text-teal-800 border-teal-200",
};

export const BookingStatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      statusColors[status] || statusColors.pending
    }`}
  >
    {status === "pending" && <Clock size={12} />}
    {(status === "confirmed" ||
      status === "delivered" ||
      status === "done" ||
      status === "completed") && <CheckCircle2 size={12} />}
    {status === "cancelled" && <XCircle size={12} />}
    {status === "no_show" && <UserX size={12} />}
    {status === "packed" && <Package size={12} />}
    {status === "retour" && <AlertTriangle size={12} />}
    {status === "no_show"
      ? "No-show"
      : status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);
