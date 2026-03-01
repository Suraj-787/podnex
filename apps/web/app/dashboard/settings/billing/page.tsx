"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Badge } from "@workspace/ui/components/badge";
import { Check, Zap, Crown, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Plan {
    id: "FREE" | "STARTER" | "PRO" | "BUSINESS";
    name: string;
    price: {
        monthly: number;
        yearly: number;
    };
    features: string[];
    limits: {
        podcasts: number;
        minutes: number;
        storage: string;
    };
    popular?: boolean;
}

const PLANS: Plan[] = [
    {
        id: "FREE",
        name: "Free",
        price: { monthly: 0, yearly: 0 },
        features: [
            "5 podcasts per month",
            "25 minutes of audio",
            "1GB storage",
            "Basic voices",
            "Email support",
        ],
        limits: {
            podcasts: 5,
            minutes: 25,
            storage: "1GB",
        },
    },
    {
        id: "STARTER",
        name: "Starter",
        price: { monthly: 19, yearly: 190 },
        features: [
            "50 podcasts per month",
            "250 minutes of audio",
            "10GB storage",
            "Premium voices",
            "API access",
            "Priority support",
        ],
        limits: {
            podcasts: 50,
            minutes: 250,
            storage: "10GB",
        },
    },
    {
        id: "PRO",
        name: "Pro",
        price: { monthly: 49, yearly: 490 },
        features: [
            "200 podcasts per month",
            "1000 minutes of audio",
            "50GB storage",
            "All premium voices",
            "Custom voices",
            "API access",
            "Webhooks",
            "Priority support",
        ],
        limits: {
            podcasts: 200,
            minutes: 1000,
            storage: "50GB",
        },
        popular: true,
    },
    {
        id: "BUSINESS",
        name: "Business",
        price: { monthly: 199, yearly: 1990 },
        features: [
            "Unlimited podcasts",
            "Unlimited minutes",
            "500GB storage",
            "All features",
            "Custom voice training",
            "Dedicated support",
            "SLA guarantee",
        ],
        limits: {
            podcasts: -1,
            minutes: -1,
            storage: "500GB",
        },
    },
];

function BillingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedPlanParam = searchParams.get("plan")?.toUpperCase();

    const [currentPlan, setCurrentPlan] = useState<string>("FREE");
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [usage, setUsage] = useState({
        podcasts: 0,
        minutes: 0,
        podcastLimit: 5,
        minuteLimit: 25,
    });
    const [loading, setLoading] = useState(false);
    const [upgradingTo, setUpgradingTo] = useState<string | null>(null);
    const [highlightedPlan, setHighlightedPlan] = useState<string | null>(selectedPlanParam || null);

    const planRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        fetchSubscription();
        fetchUsage();
    }, []);

    // Scroll to and highlight the selected plan from query param
    useEffect(() => {
        if (selectedPlanParam && planRefs.current[selectedPlanParam]) {
            setTimeout(() => {
                planRefs.current[selectedPlanParam]?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);

            // Remove highlight after 3 seconds
            setTimeout(() => {
                setHighlightedPlan(null);
            }, 3000);
        }
    }, [selectedPlanParam]);

    const fetchSubscription = async () => {
        try {
            const response = await fetch("/api/user/subscription");
            if (response.ok) {
                const data = await response.json();
                setCurrentPlan(data.data.plan || "FREE");
            }
        } catch (error) {
            console.error("Error fetching subscription:", error);
        }
    };

    const fetchUsage = async () => {
        try {
            const response = await fetch("/api/user/usage");
            if (response.ok) {
                const data = await response.json();
                setUsage({
                    podcasts: data.data.currentPodcastCount || 0,
                    minutes: data.data.currentMinutesUsed || 0,
                    podcastLimit: data.data.monthlyPodcastLimit || 5,
                    minuteLimit: data.data.monthlyMinutesLimit || 25,
                });
            }
        } catch (error) {
            console.error("Error fetching usage:", error);
        }
    };

    const handleUpgrade = async (plan: Plan) => {
        if (plan.id === currentPlan) {
            toast.info("You're already on this plan");
            return;
        }

        if (plan.id === "FREE") {
            toast.error("Cannot downgrade to free plan from here");
            return;
        }

        setUpgradingTo(plan.id);
        setLoading(true);

        try {
            const response = await fetch("/api/billing/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan: plan.id,
                    billingCycle,
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

    const getPlanIcon = (planId: string) => {
        switch (planId) {
            case "FREE":
                return <Zap className="w-6 h-6" />;
            case "STARTER":
                return <Zap className="w-6 h-6 text-blue-500" />;
            case "PRO":
                return <Crown className="w-6 h-6 text-purple-500" />;
            case "BUSINESS":
                return <Building2 className="w-6 h-6 text-orange-500" />;
            default:
                return <Zap className="w-6 h-6" />;
        }
    };

    const podcastsPercentage = (usage.podcasts / usage.podcastLimit) * 100;
    const minutesPercentage = (usage.minutes / usage.minuteLimit) * 100;

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
                <p className="text-muted-foreground">
                    Manage your subscription and view usage
                </p>
            </div>

            {/* Current Usage */}
            <Card className="p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Current Usage</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Podcasts</span>
                            <span className="text-sm text-muted-foreground">
                                {usage.podcasts} / {usage.podcastLimit}
                            </span>
                        </div>
                        <Progress value={podcastsPercentage} className="h-2" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Minutes</span>
                            <span className="text-sm text-muted-foreground">
                                {usage.minutes} / {usage.minuteLimit}
                            </span>
                        </div>
                        <Progress value={minutesPercentage} className="h-2" />
                    </div>
                </div>
            </Card>

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-4 p-1 bg-muted rounded-lg">
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-6 py-2 rounded-md transition-colors ${billingCycle === "monthly"
                            ? "bg-background shadow-sm"
                            : "hover:bg-background/50"
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle("yearly")}
                        className={`px-6 py-2 rounded-md transition-colors ${billingCycle === "yearly"
                            ? "bg-background shadow-sm"
                            : "hover:bg-background/50"
                            }`}
                    >
                        Yearly
                        <Badge variant="secondary" className="ml-2">
                            Save 17%
                        </Badge>
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PLANS.map((plan) => {
                    const price = billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly;
                    const pricePerMonth = billingCycle === "yearly" ? Math.round(price / 12) : price;
                    const isCurrentPlan = plan.id === currentPlan;
                    const isUpgrading = upgradingTo === plan.id;
                    const isHighlighted = highlightedPlan === plan.id;

                    return (
                        <Card
                            key={plan.id}
                            ref={(el) => { planRefs.current[plan.id] = el; }}
                            className={`relative p-6 transition-all duration-300 ${plan.popular ? "border-2 border-primary" : ""
                                } ${isCurrentPlan ? "bg-muted/50" : ""} ${isHighlighted ? "ring-4 ring-primary/50 shadow-2xl scale-105" : ""
                                }`}
                        >
                            {plan.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    Most Popular
                                </Badge>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                {getPlanIcon(plan.id)}
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">${pricePerMonth}</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                                {billingCycle === "yearly" && price > 0 && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        ${price} billed yearly
                                    </p>
                                )}
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className="w-full"
                                variant={isCurrentPlan ? "outline" : "default"}
                                disabled={isCurrentPlan || loading}
                                onClick={() => handleUpgrade(plan)}
                            >
                                {isUpgrading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : isCurrentPlan ? (
                                    "Current Plan"
                                ) : (
                                    "Upgrade"
                                )}
                            </Button>
                        </Card>
                    );
                })}
            </div>

            {/* Manage Subscription */}
            {currentPlan !== "FREE" && (
                <Card className="p-6 mt-8">
                    <h2 className="text-xl font-semibold mb-4">Manage Subscription</h2>
                    <p className="text-muted-foreground mb-4">
                        Update payment method, view invoices, or cancel your subscription
                    </p>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                const response = await fetch("/api/billing/portal");
                                if (response.ok) {
                                    const data = await response.json();
                                    window.open(data.portalUrl, "_blank");
                                }
                            } catch (error) {
                                toast.error("Failed to open customer portal");
                            }
                        }}
                    >
                        Open Customer Portal
                    </Button>
                </Card>
            )}
        </div>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={<div className="container mx-auto p-6"><div className="animate-pulse h-8 bg-muted rounded w-48 mb-4" /></div>}>
            <BillingContent />
        </Suspense>
    );
}
