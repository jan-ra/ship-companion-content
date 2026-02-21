"use client";

import { useAppDataStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Anchor, FileJson, Ship, Map, UtensilsCrossed, Settings } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { data } = useAppDataStore();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md m-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Anchor className="h-8 w-8" />
              <CardTitle className="text-2xl">Welcome to Ship Companion Editor</CardTitle>
            </div>
            <CardDescription>
              Import an app-data.json file to start editing your ship companion content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileJson className="h-4 w-4" />
              <span>Use the Import JSON button in the header to get started</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sections = [
    {
      title: "Ship Information",
      description: "Manage ship details, about page, occupancy, checklists, FAQ, and contacts",
      icon: Ship,
      href: "/ship/about",
      stats: [
        { label: "Cabins", value: data.data.cabins.length },
        { label: "Checklist Categories", value: data.data.checklists.length },
        { label: "FAQ Questions", value: data.data.questions.length },
      ],
    },
    {
      title: "Maps & Locations",
      description: "Edit cities and points of interest",
      icon: Map,
      href: "/maps/cities",
      stats: [
        { label: "Cities", value: data.data.cities.length },
        { label: "Points of Interest", value: data.data.points.length },
      ],
    },
    {
      title: "Recipes",
      description: "Manage recipes and cooking schedules",
      icon: UtensilsCrossed,
      href: "/recipes/recipes",
      stats: [
        { label: "Total Recipes", value: data.data.recipes.length },
        { label: "Favorites", value: data.data.recipes.filter((r) => r.isFavorite).length },
      ],
    },
    {
      title: "General Settings",
      description: "Edit ship name, version, and metadata",
      icon: Settings,
      href: "/general",
      stats: [
        { label: "Ship", value: data.shipName },
        { label: "Version", value: data.version },
      ],
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Ship Companion content for {data.shipName}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <section.icon className="h-6 w-6" />
                  <CardTitle>{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.stats.map((stat) => (
                    <div key={stat.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{stat.label}:</span>
                      <span className="font-medium">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
