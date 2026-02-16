import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  Zap,
  FileText,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const sidebarNavItems: NavItem[] = [
  {
    label: "Início",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Pedidos",
    href: "/dashboard/pedidos",
    icon: ShoppingBag,
  },
  {
    label: "PDV (Balcão)",
    href: "/dashboard/pos",
    icon: ShoppingBag,
  },
  {
    label: "Ordem de Serviço",
    href: "/dashboard/ordens-servico",
    icon: ClipboardList,
  },
  {
    label: "Produtos",
    href: "/dashboard/produtos",
    icon: Package,
  },
  {
    label: "Clientes",
    href: "/dashboard/clientes",
    icon: Users,
  },
  {
    label: "WhatsApp",
    href: "/dashboard/whatsapp",
    icon: MessageSquare,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "CRM",
    href: "/dashboard/crm",
    icon: Zap,
  },
  {
    label: "SEO",
    href: "/dashboard/seo",
    icon: FileText,
  },
  {
    label: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
  },
];
