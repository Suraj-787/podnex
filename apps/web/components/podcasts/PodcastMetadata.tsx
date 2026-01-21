"use client";

import { Podcast } from "@/lib/types/podcast.types";
import { Calendar, Clock, HardDrive, Mic, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface PodcastMetadataProps {
  podcast: Podcast;
}

export function PodcastMetadata({ podcast }: PodcastMetadataProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const metadata = [
    {
      icon: Calendar,
      label: "Created",
      value: formatDate(podcast.createdAt),
    },
    {
      icon: Clock,
      label: "Duration",
      value: formatDuration(podcast.audioDuration ? podcast.audioDuration * 60 : undefined),
    },
    {
      icon: HardDrive,
      label: "File Size",
      value: formatFileSize(podcast.audioSize),
    },
    {
      icon: Mic,
      label: "TTS Provider",
      value: podcast.ttsProvider || "N/A",
    },
    {
      icon: User,
      label: "Host Voice",
      value: podcast.hostVoice || "N/A",
    },
    {
      icon: User,
      label: "Guest Voice",
      value: podcast.guestVoice || "N/A",
    },
  ];

  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-6">
      <h3 className="text-lg font-serif font-semibold text-foreground mb-4">
        Metadata
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metadata.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/20"
            >
              <div className="rounded-lg bg-primary/5 p-2">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground mb-1">
                  {item.label}
                </div>
                <div className="text-sm font-medium text-foreground truncate">
                  {item.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Original Content Preview */}
      {podcast.noteContent && (
        <div className="mt-6 pt-6 border-t border-border/40">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-foreground">
              Original Content
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              The input content used to generate this podcast
            </p>
          </div>
          <div className="rounded-lg bg-background/50 border border-border/20 p-4 max-h-48 overflow-y-auto">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {podcast.noteContent}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
