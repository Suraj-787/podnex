"use client";

import { useState, useEffect } from "react";
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
  PodcastFilters as Filters,
  ViewMode,
} from "@/lib/types/podcast.types";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Mic,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PodcastsPage() {
  const router = useRouter();
  const [allPodcasts, setAllPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filters, setFilters] = useState<Filters>({
    status: "ALL",
    sort: "createdAt_desc",
    page: 1,
    limit: 12,
  });

  // Fetch podcasts from API
  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/podcasts');

        if (!response.ok) {
          throw new Error('Failed to fetch podcasts');
        }

        const result = await response.json();
        // Backend returns { success: true, data: [...], pagination: {...} }
        setAllPodcasts(result.data || []);
      } catch (error) {
        console.error('Error fetching podcasts:', error);
        // Don't show toast on initial load - empty state will show
        setAllPodcasts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  // Apply filters
  const filteredPodcasts = allPodcasts.filter((podcast) => {
    if (filters.status && filters.status !== "ALL") {
      if (podcast.status !== filters.status) return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = podcast.title?.toLowerCase().includes(searchLower);
      const contentMatch = podcast.noteContent.toLowerCase().includes(searchLower);
      if (!titleMatch && !contentMatch) return false;
    }
    return true;
  });

  // Apply sorting
  const sortedPodcasts = [...filteredPodcasts].sort((a, b) => {
    switch (filters.sort) {
      case "createdAt_desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "createdAt_asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "duration_desc":
        return (b.audioDuration || 0) - (a.audioDuration || 0);
      case "duration_asc":
        return (a.audioDuration || 0) - (b.audioDuration || 0);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPodcasts = sortedPodcasts.length;
  const totalPages = Math.ceil(totalPodcasts / (filters.limit || 12));
  const startIndex = ((filters.page || 1) - 1) * (filters.limit || 12);
  const endIndex = startIndex + (filters.limit || 12);
  const paginatedPodcasts = sortedPodcasts.slice(startIndex, endIndex);

  // Stats
  const completedCount = allPodcasts.filter(p => p.status === "COMPLETED").length;
  const processingCount = allPodcasts.filter(p => p.status === "PROCESSING").length;

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

    try {
      const response = await fetch(`/api/podcasts/${podcast.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete podcast');
      }

      // Remove from local state
      setAllPodcasts(allPodcasts.filter(p => p.id !== podcast.id));

      toast.success('Podcast deleted', {
        description: 'Your podcast has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting podcast:', error);
      toast.error('Failed to delete podcast', {
        description: 'Please try again.',
      });
    }
  };

  const handleRetry = async (podcast: Podcast) => {
    try {
      const response = await fetch(`/api/podcasts/${podcast.id}/retry`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to retry podcast generation');
      }

      const updatedPodcast = await response.json();

      // Update local state
      setAllPodcasts(allPodcasts.map(p =>
        p.id === podcast.id ? updatedPodcast : p
      ));

      toast.success('Podcast queued for regeneration', {
        description: 'Your podcast will be processed shortly.',
      });
    } catch (error) {
      console.error('Error retrying podcast:', error);
      toast.error('Failed to retry podcast', {
        description: 'Please try again.',
      });
    }
  };

  const handleViewDetails = (podcast: Podcast) => {
    router.push(`/dashboard/podcasts/${podcast.id}`);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
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
            {allPodcasts.length} podcasts · {completedCount} completed
            {processingCount > 0 && ` · ${processingCount} processing`}
          </p>
        </div>
        <Button onClick={handleCreateNew} className="bg-foreground text-background hover:bg-foreground/90 shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Podcast
        </Button>
      </div>

      {/* Show empty state if no podcasts at all */}
      {allPodcasts.length === 0 ? (
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
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9 h-9"
              />
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <Select
                value={filters.status || "ALL"}
                onValueChange={(value) => setFilters({ ...filters, status: value as Filters["status"] })}
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
                value={filters.sort || "createdAt_desc"}
                onValueChange={(value) => setFilters({ ...filters, sort: value as Filters["sort"] })}
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
          {paginatedPodcasts.length === 0 ? (
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
                onClick={() => setFilters({ ...filters, status: "ALL", search: "" })}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <PodcastList
              podcasts={paginatedPodcasts}
              viewMode={viewMode}
              currentPage={filters.page || 1}
              totalPages={totalPages}
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
