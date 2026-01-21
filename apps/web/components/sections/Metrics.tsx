"use client"

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const stats = [
  { value: 10000, suffix: "+", label: "Podcasts Generated", prefix: "" },
  { value: 500, suffix: "+", label: "Active Users", prefix: "" },
  { value: 99.5, suffix: "%", label: "Success Rate", prefix: "" },
  { value: 15, suffix: "+", label: "Voice Options", prefix: "" },
];

const AnimatedNumber = ({ value, suffix, prefix }: { value: number; suffix: string; prefix: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const stepValue = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += stepValue;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toFixed(value % 1 !== 0 ? 1 : 0);
  };

  return (
    <span ref={ref} className="font-serif text-5xl md:text-6xl text-foreground">
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
};

const Metrics = () => {
  return (
    <section className="py-24 relative border-y border-border/20">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              <p className="text-sm font-light text-muted-foreground mt-2">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Metrics;

