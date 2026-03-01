"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anchor,
  BookOpen,
  CheckSquare,
  Contact,
  FileText,
  HelpCircle,
  Link as LinkIcon,
  MapPin,
  Settings,
  UtensilsCrossed,
  BedDouble,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useT } from "@/lib/i18n";
import { useAppDataStore } from "@/lib/store";

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useT();
  const data = useAppDataStore((s) => s.data);

  // Hide sidebar on start screen when no data is loaded
  if (pathname === "/" && !data) {
    return null;
  }

  const generalNav = [
    { title: t("nav.general"), href: "/general", icon: Settings },
    { title: t("help.navLabel"), href: "/help", icon: BookOpen },
  ];

  const contentNav = [
    { title: t("nav.about"), href: "/ship/about", icon: FileText },
    { title: t("nav.cabinPlan"), href: "/ship/occupancy", icon: BedDouble },
    { title: t("nav.checklists"), href: "/ship/checklists", icon: CheckSquare },
    { title: t("nav.faq"), href: "/ship/faq", icon: HelpCircle },
    { title: t("nav.contactDetails"), href: "/ship/contact", icon: Contact },
    { title: t("nav.links"), href: "/ship/links", icon: LinkIcon },
    { title: t("nav.map"), href: "/maps/cities", icon: MapPin },
    { title: t("nav.recipes"), href: "/recipes/recipes", icon: UtensilsCrossed },
  ];

  const renderNavItems = (items: typeof generalNav) =>
    items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + "/")}>
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold flex items-center gap-2">
            <Anchor className="h-5 w-5" />
            {t("app.sidebarLabel")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(generalNav)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.groupContent")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(contentNav)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
