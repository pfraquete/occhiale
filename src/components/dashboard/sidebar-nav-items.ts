import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
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
    label: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
  },
];
