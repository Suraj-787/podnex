"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { PodcastList } from "@/components/podcasts/PodcastList";
import { EmptyState } from "@/components/podcasts/EmptyState";
import {
  Podcast,
  PodcastStatus,
  ViewMode,
} from "@/lib/types/podcast.types";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePodcasts, useDeletePodcast, useRetryPodcast } from "@/lib/hooks";

export default function PodcastsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [status, setStatus] = useState<PodcastStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"createdAt_desc" | "createdAt_asc" | "duration_desc" | "duration_asc">("createdAt_desc");
  const [page, setPage] = useState(1);

  // Fetch podcasts with real-time updates
  const { data, isLoading } = usePodcasts({
    page,
    limit: 12,
    status: status === "ALL" ? undefined : status,
    search: search || undefined,
    sort,
  });

  const deleteMutation = useDeletePodcast();
  const retryMutation = useRetryPodcast();

  const podcasts = data?.podcasts || [];
  const pagination = data?.pagination;

  // Stats
  const completedCount = podcasts.filter(p => p.status === "COMPLETED").length;
  const processingCount = podcasts.filter(p => p.status === "PROCESSING").length;

  const handleCreateNew = () => {
    router.push("/dashboard/podcasts/new");
  };

  const handlePlay = (podcast: Podcast) => {
    router.push(`/dashboard/podcasts/${podcast.id}`);
  };

  const handleDelete = async (podcast: Podcast) => {
    if (!confirm('Are you sure you want to delete this podcast?')) {
      return;
    }
    deleteMutation.mutate(podcast.id);
  };

  const handleRetry = async (podcast: Podcast) => {
    retryMutation.mutate(podcast.id);
  };

  const handleViewDetails = (podcast: Podcast) => {
    router.push(`/dashboard/podcasts/${podcast.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="h-9 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
          </div>
          <div className="h-10 w-40 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-medium">Podcasts</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {pagination?.total || 0} podcasts · {completedCount} completed
            {processingCount > 0 && ` · ${processingCount} processing`}
          </p>
        </div>
        <Button onClick={handleCreateNew} className="bg-foreground text-background hover:bg-foreground/90 shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Podcast
        </Button>
      </div>

      {/* Show empty state if no podcasts at all */}
      {podcasts.length === 0 && !search && status === "ALL" ? (
        <EmptyState onCreateNew={handleCreateNew} />
      ) : (
        <>
          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-3 p-3 rounded-xl border bg-card/50">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search podcasts..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="pl-9 h-9"
              />
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as PodcastStatus | "ALL");
                  setPage(1); // Reset to first page on filter change
                }}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="QUEUED">Queued</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={sort}
                onValueChange={(value) => setSort(value as typeof sort)}
              >
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt_desc">Newest First</SelectItem>
                  <SelectItem value="createdAt_asc">Oldest First</SelectItem>
                  <SelectItem value="duration_desc">Longest</SelectItem>
                  <SelectItem value="duration_asc">Shortest</SelectItem>
                </SelectContent>
              </Select>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-border" />

              {/* View Toggle */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    viewMode === "grid"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    viewMode === "list"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Podcast List or Empty State for filtered results */}
          {podcasts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border/50 bg-card/20">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-center">
                No podcasts found matching your filters.
              </p>
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => {
                  setStatus("ALL");
                  setSearch("");
                  setPage(1);
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <PodcastList
              podcasts={podcasts}
              viewMode={viewMode}
              currentPage={page}
              totalPages={pagination?.totalPages || 1}
              onPageChange={handlePageChange}
              onPlay={handlePlay}
              onDelete={handleDelete}
              onRetry={handleRetry}
              onViewDetails={handleViewDetails}
            />
          )}
        </>
      )}
    </div>
  );
}
