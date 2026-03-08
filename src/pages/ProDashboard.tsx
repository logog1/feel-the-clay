import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProSidebar } from "@/components/admin/ProSidebar";
import { OverviewSection } from "@/components/admin/OverviewSection";
import { CustomersSection } from "@/components/admin/CustomersSection";
import { FinanceSection } from "@/components/admin/FinanceSection";
import { AccountingSection } from "@/components/admin/AccountingSection";
import { WorkshopsSection } from "@/components/admin/WorkshopsSection";
import { SalesSection } from "@/components/admin/SalesSection";
import { MarketingSection } from "@/components/admin/MarketingSection";
import { InventorySection } from "@/components/admin/InventorySection";
import { ProjectionsSection } from "@/components/admin/ProjectionsSection";
import { EmployeesSection } from "@/components/admin/EmployeesSection";
import { AutomationsSection } from "@/components/admin/AutomationsSection";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ProDashboard = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("role", "admin").maybeSingle();
      if (!roles) { await supabase.auth.signOut(); navigate("/admin/login"); return; }
      setAuthed(true);
    };
    checkAuth();
  }, [navigate]);

  if (!authed) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SEOHead title="Pro Dashboard" description="Advanced admin dashboard" path="/admin/pro" />
        <ProSidebar activeSection={activeSection} onNavigate={setActiveSection} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-50 h-14 flex items-center gap-3 border-b border-border/40 bg-card/95 backdrop-blur-md px-4">
            <SidebarTrigger />
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground rounded-xl" onClick={() => navigate("/admin")}>
              <ArrowLeft size={14} /> Simple View
            </Button>
            <h1 className="text-sm font-bold text-foreground ml-auto">Terraria Pro Dashboard</h1>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {activeSection === "overview" && <OverviewSection />}
            {activeSection === "workshops" && <WorkshopsSection />}
            {activeSection === "sales" && <SalesSection />}
            {activeSection === "customers" && <CustomersSection />}
            {activeSection === "marketing" && <MarketingSection />}
            {activeSection === "inventory" && <InventorySection />}
            {activeSection === "finance" && <FinanceSection />}
            {activeSection === "accounting" && <AccountingSection />}
            {activeSection === "projections" && <ProjectionsSection />}
            {activeSection === "employees" && <EmployeesSection />}
            {activeSection === "automations" && <AutomationsSection />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProDashboard;
