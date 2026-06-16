"use client"

import { motion } from "framer-motion";
import Link from "next/link";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "API", href: "#api" },
  { label: "Pricing", href: "#pricing" },
];

const Footer = () => {
  return (
    <footer className="py-20 border-t border-border/30">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 mb-16">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link href="#" className="inline-block mb-4">
              <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                PodNex
              </span>
            </Link>
            <p className="text-sm font-light text-muted-foreground leading-relaxed max-w-xs">
              The architecture of conversation. AI-driven podcast creation
              for visionaries.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-serif text-sm font-medium text-foreground mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/30">
          <p className="text-xs font-light text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} PodNex. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

