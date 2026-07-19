"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, isPending: sessionPending } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "API", href: "/#api" },
    { label: "Docs", href: "/docs" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6"
    >
      <div 
        className={`w-[95%] md:w-[60%] transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg py-2" 
            : "bg-transparent border border-transparent py-4"
        } ${isMobileMenuOpen ? "rounded-3xl" : "rounded-full"}`}
      >
        <div className="px-6 md:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                PodNex
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 lg:gap-12">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {sessionPending ? (
                // Session hook re-fetches on every fresh mount (e.g. landing
                // on /docs via a full route change) — better to show nothing
                // for a moment than confidently show the wrong CTA to an
                // already-signed-in user.
                <div className="h-9 w-[148px]" aria-hidden />
              ) : session?.user ? (
                <Button
                  variant="primary"
                  className="text-sm h-9 px-6 rounded-full"
                  asChild
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="text-sm font-light h-9 px-4 rounded-full"
                    asChild
                  >
                    <Link href="/signin">Sign In</Link>
                  </Button>
                  <Button
                    variant="primary"
                    className="text-sm h-9 px-6 rounded-full"
                    asChild
                  >
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4"
            >
              <div className="flex flex-col gap-4 pt-6 px-2">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t border-border/50 mt-2">
                  {sessionPending ? null : session?.user ? (
                    <Button
                      variant="primary"
                      className="text-sm rounded-xl"
                      asChild
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="justify-start text-sm font-light rounded-xl"
                        asChild
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link href="/signin">Sign In</Link>
                      </Button>
                      <Button
                        variant="primary"
                        className="text-sm rounded-xl"
                        asChild
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link href="/signup">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
