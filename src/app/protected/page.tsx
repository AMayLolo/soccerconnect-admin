"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Flag, Star, CheckCircle } from "lucide-react";

export default function ProtectedDashboard() {
  const cards = [
    {
      title: "Clubs",
      description: "Manage club profiles, update details, and verify league info.",
      icon: <Users className="h-6 w-6 text-primary" />,
      href: "/protected/clubs",
    },
    {
      title: "Flagged Reports",
      description: "Review and resolve reported reviews or content.",
      icon: <Flag className="h-6 w-6 text-red-500 dark:text-red-400" />,
      href: "/protected/flagged",
    },
    {
      title: "Approvals",
      description: "Approve or deny club updates and moderation changes.",
      icon: <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />,
      href: "/protected/approvals",
    },
    {
      title: "Reviews",
      description: "Moderate user reviews and feedback from across clubs.",
      icon: <Star className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />,
      href: "/protected/reviews",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back 👋 — use the panels below to manage SoccerConnect data.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
