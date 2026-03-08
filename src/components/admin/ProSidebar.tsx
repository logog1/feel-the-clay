import { BarChart3, Users, DollarSign, BookOpen, CalendarDays, ShoppingCart, Megaphone, Package, TrendingUp, UserCircle, Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { id: "overview", title: "Overview", icon: BarChart3 },
  { id: "workshops", title: "Workshops", icon: CalendarDays },
  { id: "sales", title: "Sales", icon: ShoppingCart },
  { id: "customers", title: "Customers", icon: Users },
  { id: "marketing", title: "Marketing", icon: Megaphone },
  { id: "inventory", title: "Inventory", icon: Package },
  { id: "finance", title: "Finance", icon: DollarSign },
  { id: "accounting", title: "Accounting", icon: BookOpen },
  { id: "projections", title: "Projections", icon: TrendingUp },
  { id: "employees", title: "Employees", icon: UserCircle },
  { id: "automations", title: "Automations", icon: Zap },
];

interface Props {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function ProSidebar({ activeSection, onNavigate }: Props) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && "Dashboard"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.id)}
                    className={activeSection === item.id ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
