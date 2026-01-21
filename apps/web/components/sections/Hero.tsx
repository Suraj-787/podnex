"use client"

import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 lg:order-1"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-surface/50 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-light tracking-wider text-muted-foreground uppercase">
                Now Available
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight mb-6">
              <span className="text-foreground">Transform Notes</span>
              <br />
              <span className="text-foreground">into </span>
              <span className="italic text-slate-light">Podcasts</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl font-light text-muted-foreground leading-relaxed max-w-lg mb-10">
              Create professional AI-powered podcasts from your notes in minutes.
              Natural-sounding conversations with multiple voices, perfect for
              content creators, educators, and businesses.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button variant="primary" size="lg" className="group w-full sm:w-auto">
                  Start Creating
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="group w-full sm:w-auto">
                  <Play className="mr-2 w-4 h-4" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto lg:max-w-none">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[80%] h-[80%] rounded-full bg-muted/10 blur-3xl animate-pulse-slow" />
              </div>

              {/* Main image */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.5 }}
                className="relative z-10 w-full h-full animate-float"
              >
                <Image
                  src="/image.png"
                  alt="Abstract soundwave orb visualization"
                  width={600}
                  height={600}
                  className="w-full h-full object-contain"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-light tracking-wider text-muted-foreground uppercase">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-muted-foreground to-transparent" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
