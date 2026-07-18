"use client"

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { CodeBlock } from "@/components/docs/CodeBlock";

const codeSnippet = `const response = await fetch("https://api.podnex.tech/api/v1/podcasts", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.PODNEX_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    noteContent: "Your article, notes, or outline goes here...",
    duration: "SHORT",   // "SHORT" (3-5 min) or "LONG" (8-10 min)
    hostVoice: "Sierra",
    guestVoice: "Daniel",
  }),
});

const podcast = await response.json();
console.log(podcast.data.status); // "QUEUED"`;

const APISection = () => {
  return (
    <section id="api" className="py-32 relative bg-surface/30">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs font-light tracking-wider text-muted-foreground uppercase mb-4 block">
              Developer API
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-6">
              Audio Architecture
              <br />
              <span className="italic text-slate-light">for builders.</span>
            </h2>
            <p className="text-lg font-light text-muted-foreground leading-relaxed mb-8">
              A single, elegant API that handles the complexity of podcast production.
              Voice synthesis, conversation generation, and broadcast-ready mastering—all
              in a few lines of code.
            </p>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-px h-full bg-border" />
                <div>
                  <h4 className="font-serif text-lg mb-1 text-foreground">RESTful API</h4>
                  <p className="text-sm font-light text-muted-foreground">
                    Authenticate with an API key and generate episodes with simple HTTP calls.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-px h-full bg-border" />
                <div>
                  <h4 className="font-serif text-lg mb-1 text-foreground">Webhooks</h4>
                  <p className="text-sm font-light text-muted-foreground">
                    Get notified when an episode finishes generating.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/dashboard/settings/api-keys">
                <Button variant="outline" size="lg">
                  Get API Access
                </Button>
              </Link>
              <Link
                href="/docs"
                className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Read the docs
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Code Block */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <CodeBlock code={codeSnippet} filename="generate-episode.ts" />

            {/* Decorative element */}
            <div className="absolute -z-10 -inset-4 bg-gradient-to-r from-muted/20 to-transparent rounded-2xl blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default APISection;
