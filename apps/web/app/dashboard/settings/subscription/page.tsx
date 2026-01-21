"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import { useSubscription, useUsage } from "@/lib/hooks";
import { ArrowLeft, Sparkles, Check, Zap, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

const plans = [
    {
        name: "FREE",
        displayName: "Free",
        price: "$0",
        period: "forever",
        features: [
            "5 podcasts per month",
            "Up to 5 minutes per podcast",
            "Basic voices",
            "Standard quality",
        ],
        podcastsLimit: 5,
        minutesLimit: 25,
    },
    {
        name: "STARTER",
        displayName: "Starter",
        price: "$9",
        period: "per month",
        features: [
            "25 podcasts per month",
            "Up to 10 minutes per podcast",
            "Premium voices",
            "High quality audio",
            "Priority processing",
        ],
        podcastsLimit: 25,
        minutesLimit: 250,
        popular: true,
    },
    {
        name: "PRO",
        displayName: "Pro",
        price: "$29",
        period: "per month",
        features: [
            "100 podcasts per month",
            "Up to 15 minutes per podcast",
            "All premium voices",
            "Highest quality audio",
            "Priority processing",
            "API access",
            "Webhook support",
        ],
        podcastsLimit: 100,
        minutesLimit: 1500,
    },
    {
        name: "BUSINESS",
        displayName: "Business",
        price: "$99",
        period: "per month",
        features: [
            "Unlimited podcasts",
            "Up to 30 minutes per podcast",
            "All premium voices",
            "Highest quality audio",
            "Fastest processing",
            "Full API access",
            "Webhook support",
            "Dedicated support",
        ],
        podcastsLimit: 999999,
        minutesLimit: 999999,
    },
];

export default function SubscriptionPage() {
    const router = useRouter();
    const { data: subscription, isLoading: subLoading } = useSubscription();
    const { data: usage, isLoading: usageLoading } = useUsage();

    const isLoading = subLoading || usageLoading;

    const currentPlan = subscription?.plan || "FREE";
    const podcastsUsed = subscription?.currentPodcasts || 0;
    const podcastsLimit = subscription?.podcastsLimit || 5;
    const minutesUsed = usage?.thisMonthMinutes || 0;
    const minutesLimit = subscription?.minutesLimit || 25;

    const podcastsPercent = (podcastsUsed / podcastsLimit) * 100;
    const minutesPercent = (minutesUsed / minutesLimit) * 100;

    const [loading, setLoading] = useState(false);
    const [upgradingTo, setUpgradingTo] = useState<string | null>(null);

    const handleUpgrade = async (planName: string) => {
        if (planName === currentPlan) {
            toast.info("You're already on this plan");
            return;
        }

        if (planName === "FREE") {
            toast.error("Cannot downgrade to free plan from here");
            return;
        }

        setUpgradingTo(planName);
        setLoading(true);

        try {
            const response = await fetch("/api/billing/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan: planName,
                    billingCycle: "monthly", // Default to monthly
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create checkout session");
            }

            const data = await response.json();

            // Redirect to Dodo checkout
            if (data.data.checkoutUrl) {
                window.location.href = data.data.checkoutUrl;
            } else {
                throw new Error("No checkout URL received");
            }
        } catch (error) {
            console.error("Upgrade error:", error);
            toast.error("Failed to start checkout", {
                description: "Please try again or contact support.",
            });
            setUpgradingTo(null);
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/dashboard/settings")}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="font-serif text-3xl font-medium">Subscription</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your plan and billing
                    </p>
                </div>
            </div>

            {/* Current Plan */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>
                        You are currently on the {currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()} plan
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">
                                    {currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()} Plan
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {subscription?.status === "ACTIVE" ? "Active" : subscription?.status}
                                </p>
                            </div>
                        </div>
                        {currentPlan !== "BUSINESS" && (
                            <Button onClick={() => handleUpgrade("PRO")} disabled={loading}>
                                {upgradingTo === "PRO" ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Upgrade Plan
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Usage Stats */}
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium">Podcasts this month</p>
                                <p className="text-sm text-muted-foreground">
                                    {podcastsUsed} / {podcastsLimit}
                                </p>
                            </div>
                            <Progress value={Math.min(podcastsPercent, 100)} className="h-2" />
                            {podcastsPercent >= 80 && (
                                <p className="text-xs text-amber-500 mt-1">
                                    You're running low on podcasts. Consider upgrading your plan.
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium">Minutes this month</p>
                                <p className="text-sm text-muted-foreground">
                                    {minutesUsed} / {minutesLimit}
                                </p>
                            </div>
                            <Progress value={Math.min(minutesPercent, 100)} className="h-2" />
                            {minutesPercent >= 80 && (
                                <p className="text-xs text-amber-500 mt-1">
                                    You're running low on minutes. Consider upgrading your plan.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Billing Period */}
                    {subscription?.periodStart && subscription?.periodEnd && (
                        <div className="pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                                Current billing period:{" "}
                                <span className="text-foreground font-medium">
                                    {new Date(subscription.periodStart).toLocaleDateString()} -{" "}
                                    {new Date(subscription.periodEnd).toLocaleDateString()}
                                </span>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Available Plans */}
            <div>
                <h3 className="text-xl font-semibold mb-4">Available Plans</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {plans.map((plan) => {
                        const isCurrent = plan.name === currentPlan;
                        const isUpgrade = plans.findIndex((p) => p.name === currentPlan) < plans.findIndex((p) => p.name === plan.name);

                        return (
                            <Card
                                key={plan.name}
                                className={`relative ${plan.popular ? "border-primary shadow-lg" : ""
                                    } ${isCurrent ? "bg-primary/5 border-primary" : ""}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-primary text-primary-foreground">
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}
                                {isCurrent && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-green-500 text-white">
                                            Current Plan
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-lg">{plan.displayName}</CardTitle>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold">{plan.price}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {plan.period}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        className="w-full"
                                        variant={isCurrent ? "outline" : isUpgrade ? "default" : "outline"}
                                        disabled={isCurrent || loading}
                                        onClick={() => handleUpgrade(plan.name)}
                                    >
                                        {upgradingTo === plan.name ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : isCurrent ? (
                                            "Current Plan"
                                        ) : isUpgrade ? (
                                            <>
                                                <Zap className="h-4 w-4 mr-2" />
                                                Upgrade
                                            </>
                                        ) : (
                                            "Downgrade"
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Billing Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>
                        Manage your payment method and billing details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div>
                            <p className="font-medium">Payment Method</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {currentPlan === "FREE"
                                    ? "No payment method required"
                                    : "Managed through Dodo Payments"}
                            </p>
                        </div>
                        {currentPlan !== "FREE" && (
                            <Button variant="outline" onClick={() => router.push("/dashboard/settings/billing")}>
                                Manage Billing
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
