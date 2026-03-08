import { useNavigate } from "react-router-dom";
import {
  BarChart3, Users, DollarSign, BookOpen, CalendarDays, ShoppingCart,
  Megaphone, Package, TrendingUp, UserCircle, Zap, ClipboardList,
  Shield, ListTodo, Settings, LogOut, LayoutGrid,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

export interface SidebarItem {
  id: string;
  title: string;
  icon: React.ElementType;
}

export const allSidebarItems: SidebarItem[] = [
  { id: "overview", title: "Overview", icon: LayoutGrid },
  { id: "workshops", title: "Workshops", icon: CalendarDays },
  { id: "workflow", title: "Workflow", icon: ClipboardList },
  { id: "sales", title: "Sales & Orders", icon: ShoppingCart },
  { id: "customers", title: "Customers", icon: Users },
  { id: "marketing", title: "Marketing", icon: Megaphone },
  { id: "inventory", title: "Needs", icon: Package },
  { id: "finance", title: "Finance", icon: DollarSign },
  { id: "accounting", title: "Accounting", icon: BookOpen },
  { id: "projections", title: "Projections", icon: TrendingUp },
  { id: "employees", title: "Employees", icon: UserCircle },
  { id: "access", title: "Access", icon: Shield },
  { id: "tasks", title: "Tasks", icon: ListTodo },
  { id: "automations", title: "Automations", icon: Zap },
  { id: "settings", title: "Settings", icon: Settings },
];

// Profile type → allowed section IDs. Admins always see all.
export const profileSections: Record<string, string[]> = {
  general: ["overview", "workshops", "workflow", "tasks"],
  instructor: ["overview", "workshops", "workflow", "customers", "inventory", "tasks"],
  manager: ["overview", "workshops", "workflow", "sales", "customers", "marketing", "inventory", "employees", "tasks"],
  finance: ["overview", "sales", "finance", "accounting", "projections", "tasks"],
};

interface Props {
  activeSection: string;
  onNavigate: (id: string) => void;
  visibleItems?: SidebarItem[];
}

export function ProSidebar({ activeSection, onNavigate, visibleItems }: Props) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const items = visibleItems || allSidebarItems;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0"
      style={{
        "--sidebar-background": "20 20% 14%",
        "--sidebar-foreground": "30 20% 85%",
        "--sidebar-accent": "24 90% 50%",
        "--sidebar-accent-foreground": "0 0% 100%",
        "--sidebar-border": "20 15% 22%",
        "--sidebar-primary": "24 90% 50%",
        "--sidebar-primary-foreground": "0 0% 100%",
      } as React.CSSProperties}
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[hsl(24,90%,50%)] flex items-center justify-center text-white font-bold text-sm shrink-0">
            T
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-[hsl(30,20%,92%)] truncate">Terraria</p>
              <p className="text-[10px] text-[hsl(30,15%,55%)]">Workshops Admin</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onNavigate(item.id)}
                      tooltip={item.title}
                      className={`
                        rounded-xl transition-all
                        ${isActive
                          ? "bg-[hsl(24,90%,50%)] text-white font-medium shadow-md"
                          : "text-[hsl(30,15%,60%)] hover:text-[hsl(30,20%,85%)] hover:bg-[hsl(20,15%,20%)]"
                        }
                      `}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="rounded-xl text-[hsl(30,15%,55%)] hover:text-[hsl(0,84%,60%)] hover:bg-[hsl(20,15%,20%)]"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
