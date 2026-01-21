"use client"

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";

const faqs = [
  {
    question: "How does PodNex work?",
    answer: "Simply paste your notes or content into PodNex, choose your podcast duration and voices, and our AI transforms it into a natural-sounding conversation between a host and guest. The entire process takes just a few minutes.",
  },
  {
    question: "What voices are available?",
    answer: "We offer 15+ professional AI voices with different personalities and speaking styles. You can choose separate voices for the host and guest to create engaging, dynamic conversations.",
  },
  {
    question: "Can I use the generated podcasts commercially?",
    answer: "Yes! All podcasts generated through PodNex are yours to use however you like—commercially, for education, marketing, or personal projects. You retain full rights to your content.",
  },
  {
    question: "How long does it take to generate a podcast?",
    answer: "Most podcasts are generated in 2-5 minutes depending on length and current server load. You'll receive real-time updates on the progress and can download your podcast as soon as it's ready.",
  },
  {
    question: "Do you offer an API?",
    answer: "Yes! Pro plan subscribers get full API access with webhook support. This allows you to integrate podcast generation directly into your applications and workflows. Check our documentation for implementation details.",
  },
  {
    question: "What if I'm not satisfied with the result?",
    answer: "You can regenerate podcasts as many times as you want within your plan limits. Try different voice combinations, adjust your content, or change the duration to get the perfect result.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-32 relative bg-surface/30">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Column - Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:sticky lg:top-32 lg:self-start"
          >
            <span className="text-xs font-light tracking-wider text-muted-foreground uppercase mb-4 block">
              FAQ
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-6">
              Questions,
              <br />
              <span className="italic text-slate-light">answered.</span>
            </h2>
            <p className="text-lg font-light text-muted-foreground leading-relaxed">
              Everything you need to know about PodNex.
              Can't find what you're looking for? Reach out to our team.
            </p>
          </motion.div>

          {/* Right Column - Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border/30 rounded-lg px-6 bg-background data-[state=open]:bg-surface/50 transition-colors"
                >
                  <AccordionTrigger className="font-serif text-lg font-medium text-foreground hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base font-light text-muted-foreground leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
