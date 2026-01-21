"use client";

import { useState } from "react";
import { useAnalyticsStats, useUsageTimeline } from "@/lib/hooks";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Button } from "@workspace/ui/components/button";
import { BarChart3, TrendingUp, Clock, CheckCircle2, XCircle, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useAnalyticsStats();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const { data: timeline, isLoading: timelineLoading } = useUsageTimeline(timeRange);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-semibold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your podcast generation usage and performance
        </p>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground">Total Podcasts</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalPodcasts}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-green-500/10 p-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-3xl font-bold">{stats.completedPodcasts}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm text-muted-foreground">Success Rate</span>
            </div>
            <p className="text-3xl font-bold">{stats.successRate.toFixed(1)}%</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm text-muted-foreground">Total Minutes</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalMinutes}</p>
          </Card>
        </div>
      ) : null}

      {/* Subscription Usage */}
      {stats && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Subscription Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Podcasts</span>
                <span className="text-sm font-medium">
                  {stats.subscription.podcastsUsed} / {stats.subscription.podcastsLimit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(
                      (stats.subscription.podcastsUsed / stats.subscription.podcastsLimit) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Minutes</span>
                <span className="text-sm font-medium">
                  {stats.subscription.minutesUsed} / {stats.subscription.minutesLimit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(
                      (stats.subscription.minutesUsed / stats.subscription.minutesLimit) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Usage Timeline */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Usage Over Time</h2>
          <div className="flex gap-2">
            <Button
              variant={timeRange === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("week")}
            >
              Week
            </Button>
            <Button
              variant={timeRange === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("month")}
            >
              Month
            </Button>
            <Button
              variant={timeRange === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("year")}
            >
              Year
            </Button>
          </div>
        </div>

        {timelineLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : timeline && timeline.length > 0 ? (
          <div className="space-y-2">
            {timeline.map((item) => (
              <div key={item.date} className="flex items-center gap-4 py-2">
                <span className="text-sm text-muted-foreground w-24">
                  {new Date(item.date).toLocaleDateString()}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="h-2 bg-primary rounded-full"
                      style={{ width: `${Math.min((item.podcasts / 10) * 100, 100)}%` }}
                    />
                    <span className="text-sm font-medium">{item.podcasts} podcasts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-purple-500 rounded-full"
                      style={{ width: `${Math.min((item.minutes / 50) * 100, 100)}%` }}
                    />
                    <span className="text-sm text-muted-foreground">{item.minutes} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No usage data for this time period</p>
          </div>
        )}
      </Card>

      {/* Status Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold">{stats.completedPodcasts}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Processing</span>
            </div>
            <p className="text-2xl font-bold">{stats.processingPodcasts}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Failed</span>
            </div>
            <p className="text-2xl font-bold">{stats.failedPodcasts}</p>
          </Card>
        </div>
      )}
    </div>
  );
}
