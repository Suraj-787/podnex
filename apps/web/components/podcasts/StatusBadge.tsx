import { Badge } from "@workspace/ui/components/badge";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { PodcastStatus } from "@/lib/types/podcast.types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: PodcastStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<PodcastStatus, {
    label: string;
    icon: typeof Clock;
    className: string;
    animate?: boolean;
  }> = {
    QUEUED: {
      label: "Queued",
      icon: Clock,
      className: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    },
    PROCESSING: {
      label: "Processing",
      icon: Loader2,
      className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      animate: true,
    },
    COMPLETED: {
      label: "Completed",
      icon: CheckCircle2,
      className: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    FAILED: {
      label: "Failed",
      icon: XCircle,
      className: "bg-red-500/10 text-red-400 border-red-500/20",
    },
  };

  const config = statusConfig[status] || statusConfig.QUEUED;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-sans text-xs font-medium flex items-center gap-1.5 px-2.5 py-1",
        config.className,
        className
      )}
    >
      <Icon
        className={cn("h-3 w-3", config.animate && "animate-spin")}
      />
      {config.label}
    </Badge>
  );
}
