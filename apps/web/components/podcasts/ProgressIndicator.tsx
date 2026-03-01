"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { Loader2 } from "lucide-react";
import { usePodcastStatus } from "@/lib/hooks";

interface ProgressIndicatorProps {
  podcastId: string;
}

export function ProgressIndicator({ podcastId }: ProgressIndicatorProps) {
  const { data: status } = usePodcastStatus(podcastId);

  const progress = status?.progress || 0;
  const currentStep = status?.currentStep || "Initializing...";

  const steps = [
    { label: "Analyzing content", value: 0 },
    { label: "Generating script", value: 25 },
    { label: "Creating audio", value: 50 },
    { label: "Processing voices", value: 75 },
    { label: "Finalizing", value: 90 },
  ];

  const getCurrentStepInfo = () => {
    for (let i = steps.length - 1; i >= 0; i--) {
      const step = steps[i];
      if (step && progress >= step.value) {
        return step;
      }
    }
    return steps[0];
  };

  const stepInfo = getCurrentStepInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          Generating Podcast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{currentStep || stepInfo?.label || "Initializing..."}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isComplete = progress > step.value;
            const isCurrent = progress >= step.value && (index === steps.length - 1 || progress < (steps[index + 1]?.value ?? Infinity));

            return (
              <div key={step.label} className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full transition-colors ${isComplete
                    ? "bg-green-500"
                    : isCurrent
                      ? "bg-blue-500 animate-pulse"
                      : "bg-muted"
                    }`}
                />
                <span
                  className={`text-sm ${isComplete || isCurrent
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                    }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4">
          <p className="text-sm text-muted-foreground">
            This usually takes 2-5 minutes depending on content length. You can leave this page and we'll notify you when it's ready.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
