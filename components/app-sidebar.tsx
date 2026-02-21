"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anchor,
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

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useT();

  const navigation = [
    { title: t("nav.about"), href: "/ship/about", icon: FileText },
    { title: t("nav.cabinPlan"), href: "/ship/occupancy", icon: BedDouble },
    { title: t("nav.checklists"), href: "/ship/checklists", icon: CheckSquare },
    { title: t("nav.faq"), href: "/ship/faq", icon: HelpCircle },
    { title: t("nav.contactDetails"), href: "/ship/contact", icon: Contact },
    { title: t("nav.links"), href: "/ship/links", icon: LinkIcon },
    { title: t("nav.cities"), href: "/maps/cities", icon: MapPin },
    { title: t("nav.recipes"), href: "/recipes/recipes", icon: UtensilsCrossed },
    { title: t("nav.general"), href: "/general", icon: Settings },
  ];

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
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + "/")}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
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
