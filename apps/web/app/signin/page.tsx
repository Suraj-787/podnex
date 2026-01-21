"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    setIsLoading(true);
    try {
      await signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: "/dashboard",
      }, {
        onSuccess: () => {
          toast.success("Signed in successfully");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setIsLoading(false);
        }
      });
    } catch (error) {
      toast.error("An error occurred");
      setIsLoading(false);
    }
  }



  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      {/* Grain overlay */}
      <div className="grain-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl font-semibold tracking-tight text-foreground">
              PodNex
            </span>
          </Link>
          <h1 className="font-serif text-2xl font-medium mt-4">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-2 font-light">
            Sign in to continue creating
          </p>
        </div>

        <Card className="border-border/30 bg-surface/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="sr-only">Sign In</CardTitle>
            <CardDescription className="sr-only">
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          {...field}
                          className="bg-background/50 border-border/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="#"
                          className="text-xs font-light text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="bg-background/50 border-border/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  variant="primary"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Sign In
                </Button>
              </form>
            </Form>


          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm font-light text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-foreground hover:underline transition-all">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

