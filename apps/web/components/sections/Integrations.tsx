"use client"

import { motion } from "framer-motion";
import { Badge } from "@workspace/ui/components/badge";

const integrations = [
  { name: "Spotify", category: "Distribution" },
  { name: "Apple Podcasts", category: "Distribution" },
  { name: "YouTube", category: "Distribution" },
  { name: "Anchor", category: "Hosting" },
  { name: "Buzzsprout", category: "Hosting" },
  { name: "Transistor", category: "Hosting" },
  { name: "Zapier", category: "Automation" },
  { name: "Notion", category: "Productivity" },
  { name: "Slack", category: "Communication" },
  { name: "AWS S3", category: "Storage" },
  { name: "Google Cloud", category: "Storage" },
  { name: "Dropbox", category: "Storage" },
];

const Integrations = () => {
  return (
    <section className="py-32 relative">
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
              Integrations
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-6">
              Connects to
              <br />
              <span className="italic text-slate-light">everything.</span>
            </h2>
            <p className="text-lg font-light text-muted-foreground leading-relaxed mb-8">
              PodNex integrates seamlessly with your existing workflow.
              Publish directly to major platforms, sync with your tools,
              and automate your entire podcast pipeline.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-surface border-2 border-background flex items-center justify-center"
                  >
                    <span className="text-xs text-muted-foreground">{integrations[i]?.name.charAt(0)}</span>
                  </div>
                ))}
              </div>
              <span className="text-sm font-light text-muted-foreground">
                +{integrations.length - 4} more integrations
              </span>
            </div>
          </motion.div>

          {/* Right Column - Integration Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-3 gap-4"
          >
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group p-4 rounded-lg border border-border/30 bg-surface/20 hover:bg-surface/50 hover:border-border/50 transition-all duration-300 text-center"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-surface border border-border/30 flex items-center justify-center group-hover:border-slate-light/20 transition-colors">
                  <span className="text-sm font-serif text-muted-foreground group-hover:text-foreground transition-colors">
                    {integration.name.charAt(0)}
                  </span>
                </div>
                <p className="text-xs font-light text-foreground mb-1 truncate">
                  {integration.name}
                </p>
                <Badge variant="secondary" className="text-[10px] px-2 py-0">
                  {integration.category}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
