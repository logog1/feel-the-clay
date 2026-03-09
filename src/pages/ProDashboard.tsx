import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProSidebar, allSidebarItems, profileSections } from "@/components/admin/ProSidebar";
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
import { WorkflowSection } from "@/components/admin/WorkflowSection";
import { AccessSection } from "@/components/admin/AccessSection";
import { TasksSection } from "@/components/admin/TasksSection";
import { SettingsSection } from "@/components/admin/SettingsSection";
import { BlogSection } from "@/components/admin/BlogSection";
import { ThemeManagerSection } from "@/components/admin/ThemeManagerSection";
import { MediaManagerSection } from "@/components/admin/MediaManagerSection";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun } from "lucide-react";

const sectionTitles: Record<string, string> = {
  overview: "Overview",
  workshops: "Workshops",
  workflow: "Workflow",
  sales: "Sales & Orders",
  customers: "Customers",
  marketing: "Marketing",
  inventory: "Needs / Inventory",
  finance: "Finance",
  accounting: "Accounting",
  projections: "Projections",
  employees: "Employees",
  access: "Access Management",
  tasks: "Tasks",
  automations: "Automations",
  media: "Media Manager",
  blog: "Blog",
  themes: "Seasonal Themes",
  settings: "Settings",
};

const ProDashboard = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileType, setProfileType] = useState("general");
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("role", "admin")
        .maybeSingle();

      if (!roles) { await supabase.auth.signOut(); navigate("/admin/login"); return; }
      setIsAdmin(true);

      // Fetch profile type
      const { data: pt } = await supabase.rpc("get_my_profile_type");
      if (pt) setProfileType(pt);

      setAuthed(true);
    };
    checkAuth();
  }, [navigate]);

  if (!authed) return null;

  // Admins see everything; others see profile-filtered sections
  const visibleItems = isAdmin
    ? allSidebarItems
    : allSidebarItems.filter((item) => {
        const allowed = profileSections[profileType] || profileSections.general;
        return allowed.includes(item.id);
      });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SEOHead title="Pro Dashboard" description="Advanced admin dashboard" path="/admin/pro" />
        <ProSidebar activeSection={activeSection} onNavigate={setActiveSection} visibleItems={visibleItems} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-50 h-14 flex items-center gap-3 border-b border-border/40 bg-card/95 backdrop-blur-md px-4">
            <SidebarTrigger />
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground rounded-xl" onClick={() => navigate("/admin")}>
              <ArrowLeft size={14} /> Simple
            </Button>
            <div className="ml-auto flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={toggleDark} title={dark ? "Light mode" : "Dark mode"}>
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </Button>
              {!isAdmin && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{profileType}</span>
              )}
              <span className="text-sm font-bold text-foreground">{sectionTitles[activeSection] || "Dashboard"}</span>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {activeSection === "overview" && <OverviewSection />}
            {activeSection === "workshops" && <WorkshopsSection />}
            {activeSection === "workflow" && <WorkflowSection />}
            {activeSection === "sales" && <SalesSection />}
            {activeSection === "customers" && <CustomersSection />}
            {activeSection === "marketing" && <MarketingSection />}
            {activeSection === "inventory" && <InventorySection />}
            {activeSection === "finance" && <FinanceSection />}
            {activeSection === "accounting" && <AccountingSection />}
            {activeSection === "projections" && <ProjectionsSection />}
            {activeSection === "employees" && <EmployeesSection />}
            {activeSection === "access" && <AccessSection />}
            {activeSection === "tasks" && <TasksSection />}
            {activeSection === "automations" && <AutomationsSection />}
            {activeSection === "media" && <MediaManagerSection />}
            {activeSection === "themes" && <ThemeManagerSection />}
            {activeSection === "settings" && <SettingsSection />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProDashboard;
