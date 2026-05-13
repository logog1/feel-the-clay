import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AvailabilityCalendar, GroupRequestsList } from "@/components/sofitel/AvailabilityCalendar";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function SofitelSection() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"availability" | "requests">("availability");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Sofitel × Terraria</h2>
          <p className="text-sm text-muted-foreground">Group availability and concierge requests from Sofitel Tamuda Bay.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/sofitel/admin")}>
            <ExternalLink size={14} className="mr-1.5" /> Full console
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/sofitel/hotel")}>
            <ExternalLink size={14} className="mr-1.5" /> Concierge view
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {([["availability","Availability calendar"],["requests","Group requests"]] as const).map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2.5 text-xs uppercase tracking-[0.18em] border-b-2 transition-colors"
            style={{ borderColor: tab === id ? "hsl(var(--primary))" : "transparent",
                     color: tab === id ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                     opacity: tab === id ? 1 : 0.6 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "availability" ? <AvailabilityCalendar variant="admin" /> : <GroupRequestsList />}
    </div>
  );
}
