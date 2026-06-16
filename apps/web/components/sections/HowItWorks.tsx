"use client"

import { motion } from "framer-motion";
import { FileText, Mic, Headphones, Share2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Write Your Script",
    description: "Create your podcast script or import from any text source. Our AI understands natural conversation flow.",
  },
  {
    number: "02",
    icon: Mic,
    title: "Choose Voices",
    description: "Pick a host and guest voice from our library of natural-sounding AI voices.",
  },
  {
    number: "03",
    icon: Headphones,
    title: "Generate & Master",
    description: "AI synthesizes the dialogue and applies loudness-normalized audio mastering in minutes.",
  },
  {
    number: "04",
    icon: Share2,
    title: "Download & Share",
    description: "Download your finished episode as an MP3, ready to publish wherever you like.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 relative bg-surface/20">
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
            How It Works
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-6">
            From script to
            <br />
            <span className="italic text-slate-light">broadcast.</span>
          </h2>
          <p className="text-lg font-light text-muted-foreground leading-relaxed">
            Four steps to transform your ideas into professional podcasts.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-border/50 to-transparent -translate-x-4" />
              )}
              
              {/* Step number */}
              <div className="mb-6">
                <span className="font-serif text-4xl text-border/50 group-hover:text-border transition-colors duration-300">
                  {step.number}
                </span>
              </div>
              
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg border border-border/30 bg-surface/50 flex items-center justify-center mb-6 group-hover:border-slate-light/30 transition-colors duration-300">
                <step.icon className="w-5 h-5 text-slate-light" strokeWidth={1.5} />
              </div>
              
              {/* Content */}
              <h3 className="font-serif text-xl font-medium mb-3 text-foreground">
                {step.title}
              </h3>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

