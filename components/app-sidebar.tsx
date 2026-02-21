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

const navigation = [
  { title: "About", href: "/ship/about", icon: FileText },
  { title: "Cabin Plan", href: "/ship/occupancy", icon: BedDouble },
  { title: "Checklists", href: "/ship/checklists", icon: CheckSquare },
  { title: "FAQ", href: "/ship/faq", icon: HelpCircle },
  { title: "Contact Details", href: "/ship/contact", icon: Contact },
  { title: "Links", href: "/ship/links", icon: LinkIcon },
  { title: "Cities", href: "/maps/cities", icon: MapPin },
  { title: "Recipes", href: "/recipes/recipes", icon: UtensilsCrossed },
  { title: "General", href: "/general", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold flex items-center gap-2">
            <Anchor className="h-5 w-5" />
            Ship Companion Editor
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
