"use client"

import { motion } from "framer-motion";
import { Mic, Users, Wand2, Zap, Shield, Globe } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "AI-Powered Conversations",
    description: "Transform your notes into natural-sounding podcast conversations between host and guest with realistic dialogue.",
  },
  {
    icon: Users,
    title: "Multiple Voice Options",
    description: "Choose from 15+ professional AI voices with different personalities and speaking styles for your podcasts.",
  },
  {
    icon: Wand2,
    title: "Instant Generation",
    description: "Create complete podcast episodes in minutes. Just provide your content and let AI handle the rest.",
  },
  {
    icon: Zap,
    title: "Flexible Duration",
    description: "Generate podcasts from 2 to 15 minutes. Perfect for quick updates or in-depth discussions.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your content is encrypted and secure. We never share your data or use it for training purposes.",
  },
  {
    icon: Globe,
    title: "API Access",
    description: "Integrate podcast generation into your workflow with our simple REST API and webhook support.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mb-20"
        >
          <span className="text-xs font-light tracking-wider text-muted-foreground uppercase mb-4 block">
            Features
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-6">
            Everything you need
            <br />
            <span className="italic text-slate-light">to create podcasts.</span>
          </h2>
          <p className="text-lg font-light text-muted-foreground leading-relaxed">
            Powerful features designed for content creators, educators, and businesses.
            Create professional podcasts without recording equipment or editing skills.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-background p-10 hover:bg-surface/50 transition-colors duration-500"
            >
              <div className="mb-6">
                <feature.icon
                  className="w-8 h-8 text-slate-light group-hover:text-foreground transition-colors duration-300"
                  strokeWidth={1}
                />
              </div>
              <h3 className="font-serif text-xl font-medium mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

