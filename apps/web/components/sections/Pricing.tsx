"use client"

import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for trying out PodNex.",
    features: [
      "5 podcasts per month",
      "Up to 5 minutes per podcast",
      "Basic voices",
      "Standard quality",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Starter",
    price: "9",
    description: "For regular content creators.",
    features: [
      "25 podcasts per month",
      "Up to 10 minutes per podcast",
      "Premium voices",
      "High quality audio",
      "Priority processing",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Pro",
    price: "29",
    description: "For professional creators and businesses.",
    features: [
      "100 podcasts per month",
      "Up to 15 minutes per podcast",
      "All premium voices",
      "Highest quality audio",
      "Priority processing",
      "API access",
      "Webhook support",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-32 relative bg-surface/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="text-xs font-light tracking-wider text-muted-foreground uppercase mb-4 block">
            Pricing
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-6">
            Simple, transparent
            <br />
            <span className="italic text-slate-light">pricing.</span>
          </h2>
          <p className="text-lg font-light text-muted-foreground leading-relaxed">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative p-8 lg:p-10 rounded-lg ${plan.popular
                  ? "border-2 border-slate-light/30 bg-surface"
                  : "border border-border/30 bg-background"
                }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-light tracking-wider uppercase bg-background border border-slate-light/30 rounded-full">
                  Most Popular
                </span>
              )}

              <div className="mb-8">
                <h3 className="font-serif text-2xl font-medium mb-2 text-foreground">
                  {plan.name}
                </h3>
                <p className="text-sm font-light text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  {plan.price !== "Custom" && (
                    <span className="text-sm font-light text-muted-foreground">$</span>
                  )}
                  <span className="font-serif text-5xl text-foreground">{plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className="text-sm font-light text-muted-foreground">/month</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-slate-light mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-light text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "primary" : "outline"}
                className="w-full"
                size="lg"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
