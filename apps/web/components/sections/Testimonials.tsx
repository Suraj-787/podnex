"use client"

import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "PodNex transformed how I create content. I can now generate professional podcasts in minutes instead of hours. The AI voices sound incredibly natural!",
    author: "Alex Thompson",
    role: "Content Creator & Educator",
    avatar: "AT",
  },
  {
    quote: "The API is straightforward and powerful. I integrated PodNex into my workflow in less than an hour. Perfect for automating podcast generation at scale.",
    author: "Jordan Lee",
    role: "Developer & Tech Blogger",
    avatar: "JL",
  },
  {
    quote: "As someone who creates educational content, PodNex has been a game-changer. The quality is impressive and my audience can't tell it's AI-generated.",
    author: "Maria Garcia",
    role: "Online Course Instructor",
    avatar: "MG",
  },
];

const Testimonials = () => {
  return (
    <section className="py-32 relative">
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
            Testimonials
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight">
            Trusted by
            <br />
            <span className="italic text-slate-light">pioneers.</span>
          </h2>
        </motion.div>

        {/* Testimonial Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-8 border border-border/30 rounded-lg bg-surface/20 hover:bg-surface/40 transition-colors duration-300"
            >
              {/* Quote */}
              <blockquote className="mb-8">
                <p className="text-lg font-light text-foreground/90 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface border border-border/50 flex items-center justify-center">
                  <span className="text-sm font-light text-muted-foreground">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <p className="font-serif text-base text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="text-sm font-light text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

