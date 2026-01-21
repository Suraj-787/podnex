"use client"

import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentPodcasts } from "@/components/dashboard/RecentPodcasts";
import { Button } from "@workspace/ui/components/button";
import { Mic, Clock, Zap, Plus } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { usePodcastStats, useUsage } from "@/lib/hooks";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";
  const firstName = userName.split(" ")[0];

  // Fetch real data from backend
  const { data: stats, isLoading: statsLoading } = usePodcastStats();
  const { data: usage, isLoading: usageLoading } = useUsage();

  const isLoading = statsLoading || usageLoading;

  // Calculate plan usage percentage
  const planUsagePercent = usage?.subscription
    ? Math.round((usage.subscription.currentPodcasts / usage.subscription.podcastsLimit) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-medium">Welcome back, {firstName}</h2>
          <p className="text-muted-foreground mt-1">Here's what's happening with your podcasts.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="lg" className="md:w-auto w-full">
            <Link href="/dashboard/podcasts/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Podcast
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Podcasts"
          value={isLoading ? "..." : (stats?.totalPodcasts?.toString() || "0")}
          icon={Mic}
          description="Lifetime generated"
        />
        <StatsCard
          title="Minutes Generated"
          value={isLoading ? "..." : `${Math.round(stats?.totalMinutes || 0)}m`}
          icon={Clock}
          description="Total audio duration"
        />
        <StatsCard
          title="Plan Usage"
          value={isLoading ? "..." : `${planUsagePercent}%`}
          icon={Zap}
          description={
            usage?.subscription
              ? `${usage.subscription.currentPodcasts}/${usage.subscription.podcastsLimit} podcasts this month`
              : "Loading..."
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <div className="col-span-1 lg:col-span-3">
          <RecentPodcasts />
        </div>
      </div>
    </div>
  );
}
