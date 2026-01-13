"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Upload,
  Clipboard,
  Check,
  FileText,
  Settings,
  Eye,
  Wand2,
  Zap,
  Volume2,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const steps = [
  { id: 1, name: "Content", icon: FileText },
  { id: 2, name: "Configure", icon: Settings },
  { id: 3, name: "Review", icon: Eye },
];

const createPodcastSchema = z.object({
  noteContent: z
    .string()
    .min(100, "Content must be at least 100 characters")
    .max(10000, "Content too long (max 10,000 characters)"),
  duration: z.enum(["SHORT", "LONG"], {
    required_error: "Please select a duration",
  }),
  title: z.string().max(100, "Title too long (max 100 characters)").optional(),
  hostVoice: z.string().optional(),
  guestVoice: z.string().optional(),
  webhookUrl: z
    .string()
    .url("Invalid webhook URL")
    .optional()
    .or(z.literal("")),
  noteId: z.string().optional(),
});

type CreatePodcastForm = z.infer<typeof createPodcastSchema>;

export default function NewPodcastPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const form = useForm<CreatePodcastForm>({
    resolver: zodResolver(createPodcastSchema),
    defaultValues: {
      noteContent: "",
      duration: "SHORT",
      title: "",
      hostVoice: "default",
      guestVoice: "default",
      webhookUrl: "",
      noteId: "",
    },
  });

  const noteContent = form.watch("noteContent");
  const characterCount = noteContent.length;
  const duration = form.watch("duration");
  const title = form.watch("title");
  const wordCount = noteContent.trim()
    ? noteContent.trim().split(/\s+/).length
    : 0;

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      form.setValue("noteContent", text);
      toast.success("Content pasted from clipboard");
    } catch (err) {
      toast.error("Failed to read clipboard");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain") {
      toast.error("Please upload a .txt file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      form.setValue("noteContent", text);
      toast.success("File content loaded");
    };
    reader.readAsText(file);
  };

  const handleVoicePreview = (voiceType: string) => {
    toast.info(`Playing ${voiceType} voice preview...`);
  };

  const onSubmit = async (data: CreatePodcastForm) => {
    setIsSubmitting(true);
    try {
      console.log("Creating podcast with data:", data);

      const response = await fetch('/api/podcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to create podcast');
      }

      const result = await response.json();
      console.log("Podcast created:", result);

      toast.success("Podcast created successfully!", {
        description: "Your podcast is being generated. This may take a few minutes.",
      });
      router.push("/dashboard/podcasts");
    } catch (error) {
      console.error("Error creating podcast:", error);
      toast.error("Failed to create podcast", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let isValid = false;

    if (step === 1) {
      isValid = await form.trigger("noteContent");
    } else if (step === 2) {
      isValid = await form.trigger([
        "duration",
        "title",
        "hostVoice",
        "guestVoice",
        "webhookUrl",
        "noteId",
      ]);
    }

    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="shrink-0 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="font-serif text-xl font-medium">
                  Create Podcast
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {steps.map((s, index) => (
                <div key={s.id} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (s.id < step) setStep(s.id);
                    }}
                    disabled={s.id > step}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      step === s.id && "bg-foreground text-background",
                      step > s.id &&
                      "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 cursor-pointer",
                      step < s.id &&
                      "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                        step === s.id && "bg-background text-foreground",
                        step > s.id && "bg-emerald-500 text-white",
                        step < s.id &&
                        "bg-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      {step > s.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <span className="text-[10px] font-bold">{s.id}</span>
                      )}
                    </div>
                    <span className="hidden sm:inline">{s.name}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-8 h-0.5 mx-1",
                        step > s.id ? "bg-emerald-500/50" : "bg-border"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <div className="space-y-6">
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-4">
                      <CardTitle className="font-serif text-xl lg:text-2xl font-medium">
                        What do you want to talk about?
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        Paste your notes, article, or any content to transform
                        into a podcast.{" "}
                        <span className="text-amber-600 font-medium">
                          Minimum 100 characters required.
                        </span>
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 pb-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePasteFromClipboard}
                        >
                          <Clipboard className="h-4 w-4 mr-2" />
                          Paste from Clipboard
                        </Button>
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload .txt File
                            </span>
                          </Button>
                          <input
                            id="file-upload"
                            type="file"
                            accept=".txt"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </Label>
                      </div>

                      <FormField
                        control={form.control}
                        name="noteContent"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={16}
                                placeholder={`Start typing or paste your content here...

Your content will be transformed into a natural conversation between a host and guest.

Tips for best results:
• Include key points you want discussed
• Longer, detailed content produces better podcasts
• Technical content works great for educational episodes`}
                                className="resize-none text-base leading-relaxed bg-background border-border focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{wordCount} words</span>
                          <span className="text-border">•</span>
                          <span
                            className={cn(
                              characterCount >= 100 &&
                              characterCount <= 10000 &&
                              "text-emerald-500",
                              characterCount > 10000 && "text-red-500"
                            )}
                          >
                            {characterCount.toLocaleString()} / 10,000 characters
                          </span>
                        </div>
                        {characterCount >= 100 && characterCount <= 10000 && (
                          <span className="text-sm text-emerald-500 flex items-center gap-1">
                            <Check className="h-4 w-4" />
                            Ready to continue
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={characterCount < 100}
                      size="lg"
                      className="px-8"
                    >
                      Continue to Configure
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-4">
                      <CardTitle className="font-serif text-xl lg:text-2xl font-medium">
                        Configure your podcast
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        Choose duration, title, and voice settings.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Duration</Label>
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => field.onChange("SHORT")}
                                  className={cn(
                                    "relative p-4 rounded-lg border-2 text-center transition-all",
                                    field.value === "SHORT"
                                      ? "border-foreground bg-foreground/5"
                                      : "border-border bg-background hover:border-foreground/30"
                                  )}
                                >
                                  {field.value === "SHORT" && (
                                    <Check className="absolute top-3 right-3 h-4 w-4 text-foreground" />
                                  )}
                                  <p className="font-semibold">Short · 3-5 min</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Quick overviews
                                  </p>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => field.onChange("LONG")}
                                  className={cn(
                                    "relative p-4 rounded-lg border-2 text-center transition-all",
                                    field.value === "LONG"
                                      ? "border-foreground bg-foreground/5"
                                      : "border-border bg-background hover:border-foreground/30"
                                  )}
                                >
                                  {field.value === "LONG" && (
                                    <Check className="absolute top-3 right-3 h-4 w-4 text-foreground" />
                                  )}
                                  <p className="font-semibold">Long · 8-10 min</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    In-depth analysis
                                  </p>
                                </button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Title{" "}
                                <span className="text-muted-foreground font-normal">
                                  (optional)
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Leave blank for auto-generated title"
                                  className="h-11 bg-background border-border focus:border-foreground/30"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                If not provided, we'll generate a title based on
                                your content
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-medium">
                          Voice Selection
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg border border-border bg-background space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Volume2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  Host Voice
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  handleVoicePreview(
                                    form.watch("hostVoice") || "default"
                                  )
                                }
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormField
                              control={form.control}
                              name="hostVoice"
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-10 bg-muted/30 border-border">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="default">
                                        Default (Warm & Friendly)
                                      </SelectItem>
                                      <SelectItem value="professional">
                                        Professional
                                      </SelectItem>
                                      <SelectItem value="casual">
                                        Casual
                                      </SelectItem>
                                      <SelectItem value="authoritative">
                                        Authoritative
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="p-4 rounded-lg border border-border bg-background space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Volume2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  Guest Voice
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  handleVoicePreview(
                                    form.watch("guestVoice") || "default"
                                  )
                                }
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormField
                              control={form.control}
                              name="guestVoice"
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-10 bg-muted/30 border-border">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="default">
                                        Default (Engaging)
                                      </SelectItem>
                                      <SelectItem value="energetic">
                                        Energetic
                                      </SelectItem>
                                      <SelectItem value="thoughtful">
                                        Thoughtful
                                      </SelectItem>
                                      <SelectItem value="curious">
                                        Curious
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <Collapsible
                        open={advancedOpen}
                        onOpenChange={setAdvancedOpen}
                      >
                        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform",
                              advancedOpen && "rotate-90"
                            )}
                          />
                          Advanced settings
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-4 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                            <FormField
                              control={form.control}
                              name="webhookUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-muted-foreground">
                                    Webhook URL
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="url"
                                      placeholder="https://..."
                                      className="h-10 bg-background border-border"
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs">
                                    Receive notifications when complete
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="noteId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-muted-foreground">
                                    Note ID
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Optional reference"
                                      className="h-10 bg-background border-border"
                                    />
                                  </FormControl>
                                  <FormDescription className="text-xs">
                                    Link to your existing notes
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Content
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      size="lg"
                      className="px-8"
                    >
                      Continue to Review
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-serif text-2xl lg:text-3xl font-medium">
                      Review & Create
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Double-check your settings before generating your podcast.
                    </p>
                  </div>

                  <Card className="border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 border-b border-border">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Content Summary
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start gap-8">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                            {noteContent.substring(0, 400)}
                            {noteContent.length > 400 && "..."}
                          </p>
                        </div>
                        <div className="shrink-0 text-center px-6 py-4 bg-muted/20 rounded-lg border border-border">
                          <p className="text-4xl font-bold">{wordCount}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            words
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {characterCount.toLocaleString()} chars
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-border bg-card overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 bg-muted/30 border-b border-border">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Configuration</span>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            Duration
                          </p>
                          <p className="text-lg font-semibold">
                            {duration === "SHORT" ? "Short" : "Long"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {duration === "SHORT" ? "3-5 min" : "8-10 min"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            Title
                          </p>
                          <p className="text-lg font-semibold truncate">
                            {title || "Auto-generated"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {title ? "Custom" : "Based on content"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            Host Voice
                          </p>
                          <p className="text-lg font-semibold capitalize">
                            {form.watch("hostVoice")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Main speaker
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            Guest Voice
                          </p>
                          <p className="text-lg font-semibold capitalize">
                            {form.watch("guestVoice")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Co-speaker
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="flex items-center justify-between p-5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                        <Zap className="h-5 w-5" />
                      </div>
                      <p className="text-sm">
                        This will use{" "}
                        <span className="text-emerald-500 font-semibold">
                          1 credit
                        </span>{" "}
                        from your account
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={prevStep}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="px-10 bg-foreground text-background hover:bg-foreground/90"
                    >
                      {isSubmitting ? (
                        <>
                          <Wand2 className="h-5 w-5 mr-2 animate-spin" />
                          Creating Podcast...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-5 w-5 mr-2" />
                          Create Podcast
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
