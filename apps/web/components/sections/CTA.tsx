"use client"

import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="py-32 relative">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto text-center"
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-border" />

          <span className="text-xs font-light tracking-wider text-muted-foreground uppercase mb-6 block">
            Ready to Begin?
          </span>

          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] mb-8">
            Start creating
            <br />
            <span className="italic text-slate-light">podcasts today.</span>
          </h2>

          <p className="text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
            Join content creators, educators, and businesses who are using
            PodNex to transform their ideas into engaging podcast conversations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button variant="primary" size="xl" className="group w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#pricing">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm font-light text-muted-foreground">
            Free plan available · No credit card required · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;

