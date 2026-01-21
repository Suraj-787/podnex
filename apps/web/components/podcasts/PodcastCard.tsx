"use client";

import { useState, useEffect } from "react";
import { Podcast, ViewMode } from "@/lib/types/podcast.types";
import { formatDistanceToNow } from "date-fns";
import { formatDuration } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Progress } from "@workspace/ui/components/progress";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Play,
  Clock,
  MoreHorizontal,
  Download,
  Share2,
  Trash2,
  RefreshCw,
  Eye,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from "lucide-react";

interface PodcastCardProps {
  podcast: Podcast;
  viewMode?: ViewMode;
  onPlay?: (podcast: Podcast) => void;
  onDelete?: (podcast: Podcast) => void;
  onRetry?: (podcast: Podcast) => void;
  onViewDetails?: (podcast: Podcast) => void;
}

const STATUS_CONFIG = {
  COMPLETED: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
    label: "Completed",
  },
  PROCESSING: {
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: Loader2,
    label: "Processing",
  },
  QUEUED: {
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: Clock3,
    label: "Queued",
  },
  FAILED: {
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: AlertCircle,
    label: "Failed",
  },
};

export function PodcastCard({
  podcast,
  viewMode = "grid",
  onPlay,
  onDelete,
  onRetry,
  onViewDetails,
}: PodcastCardProps) {
  // Force re-render every minute to update relative timestamps
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const statusConfig = STATUS_CONFIG[podcast.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.QUEUED;
  const StatusIcon = statusConfig.icon;
  const isPlayable = podcast.status === "COMPLETED" && podcast.audioUrl;

  // List View - Three-Zone Fixed Layout
  if (viewMode === "list") {
    return (
      <div
        className="group flex items-stretch rounded-xl border border-border bg-card hover:border-border/60 transition-colors overflow-hidden shadow-sm hover:shadow-md cursor-pointer"
        style={{ minHeight: "88px" }}
        onClick={() => onViewDetails?.(podcast)}
      >
        {/* LEFT ZONE: Status/Play Icon - Fixed Width */}
        <div
          className="flex items-center justify-center bg-muted/30 border-r border-border/50 flex-shrink-0"
          style={{ width: "88px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {isPlayable ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.(podcast);
              }}
              className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform shadow-md"
              aria-label={`Play ${podcast.title || "podcast"}`}
            >
              <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
            </button>
          ) : (
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center border-2",
              statusConfig.bg,
              statusConfig.border
            )}>
              <StatusIcon className={cn(
                "h-5 w-5",
                statusConfig.color,
                podcast.status === "PROCESSING" && "animate-spin"
              )} />
            </div>
          )}
        </div>

        {/* CENTER ZONE: Content - Flexible Width */}
        <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-center gap-2">
          {/* Title - Dominant Element */}
          <h3 className="font-semibold text-base text-foreground leading-tight truncate">
            {podcast.title || "Untitled Podcast"}
          </h3>

          {/* Metadata Row - Single Line */}
          <div className="flex items-center gap-3 text-xs">
            {/* STATUS BADGE: State indicator (Completed/Processing/Failed/Queued) */}
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-white",
              statusConfig.bg,
              statusConfig.border
            )}>
              <StatusIcon className={cn(
                "h-3.5 w-3.5 flex-shrink-0",
                podcast.status === "PROCESSING" && "animate-spin"
              )} />
              <span className="whitespace-nowrap">{statusConfig.label}</span>
            </div>

            {/* Retry Button - Beside Failed Badge */}
            {podcast.status === "FAILED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry?.(podcast);
                }}
                className="text-white border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50 h-7 px-2.5 text-xs"
                aria-label="Retry podcast generation"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Retry
              </Button>
            )}

            {/* Duration - Only for Completed */}
            {podcast.audioDuration && podcast.status === "COMPLETED" && (
              <div className="inline-flex items-center gap-1 text-muted-foreground/90">
                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">{formatDuration(podcast.audioDuration * 60)}</span>
              </div>
            )}

            {/* Progress - Only for Processing */}
            {podcast.status === "PROCESSING" && (
              <span className="text-muted-foreground/90">
                {podcast.progress || 0}% • {podcast.currentStep || "Processing"}
              </span>
            )}
          </div>

          {/* PROGRESS BAR: Linear completion indicator (separate from status badge) */}
          {podcast.status === "PROCESSING" && (
            <div className="max-w-md mt-1">
              <Progress value={podcast.progress || 0} className="h-1.5 bg-muted [&>div]:border [&>div]:border-white [&>div]:shadow-sm" />
            </div>
          )}
        </div>

        {/* RIGHT ZONE: Time & Actions - Fixed Width */}
        <div
          className="flex items-center gap-3 px-4 border-l border-border/50 bg-muted/20 flex-shrink-0"
          style={{ width: "200px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Timestamp - Aligned Vertically */}
          <div className="flex-1 min-w-0 text-xs text-muted-foreground/90 text-right">
            <span suppressHydrationWarning className="block truncate">
              {formatDistanceToNow(new Date(podcast.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Actions Group */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Overflow Menu - Always Visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  aria-label={`More options for ${podcast.title || "podcast"}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.(podcast);
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {isPlayable && (
                  <>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Audio
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Podcast
                    </DropdownMenuItem>
                  </>
                )}
                {podcast.status === "FAILED" && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onRetry?.(podcast);
                  }}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Generation
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(podcast);
                  }}
                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Podcast
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  }

  // Grid View - Stable, Consistent Layout
  return (
    <div className="group flex flex-col h-full rounded-xl border border-border bg-card hover:border-border/60 transition-colors overflow-hidden shadow-sm hover:shadow-md">
      {/* Header: Status Badge & Metadata - Fixed Height */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b border-border/30" style={{ minHeight: "64px" }}>
        {/* STATUS BADGE: Colored label showing podcast state (Completed/Processing/Failed/Queued) */}
        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm text-white",
          statusConfig.bg,
          statusConfig.border
        )}>
          <StatusIcon className={cn(
            "h-3.5 w-3.5 flex-shrink-0",
            podcast.status === "PROCESSING" && "animate-spin"
          )} />
          <span className="whitespace-nowrap">{statusConfig.label}</span>
        </div>

        {/* Duration Badge - Only for Completed */}
        {podcast.audioDuration && podcast.status === "COMPLETED" && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-foreground/80 border border-border/50 shadow-sm">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="whitespace-nowrap">{formatDuration(podcast.audioDuration * 60)}</span>
          </div>
        )}
      </div>

      {/* Content Area - Fixed Structure for All States */}
      <div className="flex flex-col flex-1 px-4 py-4">
        {/* Title - Fixed Position, Always Same Location */}
        <h3 className="font-semibold text-base text-foreground leading-snug mb-3" style={{ minHeight: "44px" }}>
          <span className="line-clamp-2">
            {podcast.title || "Untitled Podcast"}
          </span>
        </h3>

        {/* PROGRESS BAR: Visual indicator of processing completion (0-100%) */}
        {podcast.status === "PROCESSING" && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground truncate pr-2">
                {podcast.currentStep || "Processing podcast"}
              </span>
              <span className="text-white shrink-0">
                {podcast.progress || 0}%
              </span>
            </div>
            <div className="relative">
              <Progress value={podcast.progress || 0} className="h-1.5 bg-muted [&>div]:border [&>div]:border-white [&>div]:shadow-sm" />
            </div>
          </div>
        )}

        {/* Error Message - One Line Max, Only for Failed */}
        {podcast.status === "FAILED" && (
          <div className="text-xs text-red-500/90 mb-3 line-clamp-1">
            Generation failed. Please try again.
          </div>
        )}

        {/* Metadata - Pushed to Bottom */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground/90 mt-auto">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span suppressHydrationWarning className="truncate">
            {formatDistanceToNow(new Date(podcast.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Footer: Actions - Consistent Height, Subtle Divider */}
      <div className="mt-auto border-t border-border/30 bg-muted/20">
        <div className="px-4 py-3 flex items-center justify-between gap-2" style={{ minHeight: "56px" }}>
          {/* Left: Primary Action - Reserved Space */}
          <div className="flex items-center min-w-[80px]">
            {podcast.status === "FAILED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRetry?.(podcast)}
                className="text-white border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50 h-7 px-2.5 text-xs"
                aria-label="Retry podcast generation"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Retry
              </Button>
            )}
            {podcast.status === "COMPLETED" && isPlayable && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onPlay?.(podcast)}
                className="h-8 px-3 text-xs font-semibold shadow-sm"
                aria-label={`Play ${podcast.title || "podcast"}`}
              >
                <Play className="h-3.5 w-3.5 mr-1.5" fill="currentColor" />
                Play
              </Button>
            )}
          </div>

          {/* Right: More Menu - Always Visible */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 ml-auto"
                aria-label={`More options for ${podcast.title || "podcast"}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onViewDetails?.(podcast)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {isPlayable && (
                <>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download Audio
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Podcast
                  </DropdownMenuItem>
                </>
              )}
              {podcast.status === "FAILED" && (
                <DropdownMenuItem onClick={() => onRetry?.(podcast)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Generation
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(podcast)}
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Podcast
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
