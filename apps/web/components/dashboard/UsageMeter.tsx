"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"
import { useSubscription, useUsage } from "@/lib/hooks"

export function UsageMeter() {
    const { data: subscription, isLoading: subLoading } = useSubscription();
    const { data: usage, isLoading: usageLoading } = useUsage();

    const isLoading = subLoading || usageLoading;

    const planName = subscription?.plan || "FREE";
    const currentPodcasts = subscription?.currentPodcasts || 0;
    const podcastsLimit = subscription?.podcastsLimit || 5;
    const usagePercent = podcastsLimit > 0 ? (currentPodcasts / podcastsLimit) * 100 : 0;

    return (
        <div className="px-2 py-2">
            <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-2">
                <div className="flex items-center justify-between font-medium">
                    <span className="text-foreground">
                        {isLoading ? "Loading..." : `${planName.charAt(0)}${planName.slice(1).toLowerCase()} Plan`}
                    </span>
                    {planName === "FREE" && (
                        <Link href="/dashboard/settings/subscription" className="text-primary hover:underline flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Upgrade
                        </Link>
                    )}
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Podcasts</span>
                        <span className="font-medium">
                            {isLoading ? "..." : `${currentPodcasts}/${podcastsLimit}`}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary/80 rounded-full transition-all"
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
