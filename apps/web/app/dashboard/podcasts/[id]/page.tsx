"use client";

import { useParams, useRouter } from "next/navigation";
import { usePodcast, useDeletePodcast, useRetryPodcast, useUpdatePodcast } from "@/lib/hooks";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  ArrowLeft,
  Download,
  Trash2,
  Share2,
  Clock,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  RotateCcw,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PodcastPlayer } from "@/components/podcasts/PodcastPlayer";
import { ProgressIndicator } from "@/components/podcasts/ProgressIndicator";
import { TranscriptViewer } from "@/components/podcasts/TranscriptViewer";
import { useState } from "react";
import { toast } from "sonner";

export default function PodcastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const podcastId = params.id as string;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  const { data: podcast, isLoading } = usePodcast(podcastId);
  const deleteMutation = useDeletePodcast();
  const retryMutation = useRetryPodcast();
  const updateMutation = useUpdatePodcast();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this podcast?")) return;

    deleteMutation.mutate(podcastId, {
      onSuccess: () => {
        router.push("/dashboard/podcasts");
      },
    });
  };

  const handleRetry = () => {
    retryMutation.mutate(podcastId);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/dashboard/podcasts/${podcastId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleSaveTitle = () => {
    if (!podcast) return;
    updateMutation.mutate(
      { id: podcastId, data: { title: editedTitle } },
      {
        onSuccess: () => {
          setIsEditingTitle(false);
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditedTitle(podcast?.title || "");
    setIsEditingTitle(false);
  };

  const getStatusBadge = () => {
    if (!podcast) return null;

    switch (podcast.status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "QUEUED":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Queued
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-muted animate-pulse rounded" />
          <div className="flex-1">
            <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Podcast not found</h2>
        <p className="text-muted-foreground mb-4">
          This podcast may have been deleted or doesn't exist.
        </p>
        <Button onClick={() => router.push("/dashboard/podcasts")}>
          Back to Podcasts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/podcasts")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-2xl md:text-3xl font-serif font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTitle();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveTitle}>
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="group flex items-center gap-2">
                  <h1 className="font-serif text-2xl md:text-3xl font-medium truncate">
                    {podcast.title || `Podcast ${podcast.id.slice(0, 8)}`}
                  </h1>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditedTitle(podcast.title || "");
                      setIsEditingTitle(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(podcast.createdAt), { addSuffix: true })}</span>
              </div>
              {podcast.audioDuration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{Math.round(podcast.audioDuration)} min</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {podcast.status === "COMPLETED" && podcast.audioUrl && (
            <>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={podcast.audioUrl} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            </>
          )}
          {podcast.status === "FAILED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retryMutation.isPending}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content based on status */}
      {podcast.status === "QUEUED" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Podcast Queued</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Your podcast is in the queue and will start processing shortly.
            </p>
          </CardContent>
        </Card>
      )}

      {podcast.status === "PROCESSING" && (
        <ProgressIndicator podcastId={podcast.id} />
      )}

      {podcast.status === "COMPLETED" && podcast.audioUrl && (
        <div className="space-y-6">
          {/* Audio Player */}
          <PodcastPlayer audioUrl={podcast.audioUrl} title={podcast.title} />

          {/* Transcript */}
          {podcast.transcript && (
            <TranscriptViewer transcript={podcast.transcript} />
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Duration
                  </p>
                  <p className="font-medium">
                    {podcast.audioDuration
                      ? `${Math.floor(podcast.audioDuration)}:${String(Math.floor((podcast.audioDuration % 1) * 60)).padStart(2, "0")}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    File Size
                  </p>
                  <p className="font-medium">
                    {podcast.audioSize
                      ? `${(podcast.audioSize / 1024 / 1024).toFixed(2)} MB`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Created
                  </p>
                  <p className="font-medium">
                    {new Date(podcast.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Completed
                  </p>
                  <p className="font-medium">
                    {podcast.completedAt
                      ? new Date(podcast.completedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Original Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Original Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {podcast.noteContent}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {podcast.status === "FAILED" && (
        <Card className="border-red-500/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Generation Failed</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {podcast.errorMessage || "An error occurred while generating your podcast."}
            </p>
            <Button onClick={handleRetry} disabled={retryMutation.isPending}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {retryMutation.isPending ? "Retrying..." : "Retry Generation"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
