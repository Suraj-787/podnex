"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { ArrowRight, FileText, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { usePodcasts } from "@/lib/hooks"
import { Badge } from "@workspace/ui/components/badge"
import { formatDistanceToNow } from "date-fns"

export function RecentPodcasts() {
  const { data, isLoading } = usePodcasts({ limit: 6, sort: "createdAt_desc" });
  const podcasts = data?.podcasts || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "PROCESSING":
        return <Badge variant="default" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case "FAILED":
        return <Badge variant="default" className="bg-red-500/10 text-red-500 hover:bg-red-500/20"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case "QUEUED":
        return <Badge variant="default" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Queued</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Podcasts</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/podcasts">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : podcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <div className="bg-secondary/50 p-4 rounded-full mb-4">
              <FileText className="h-8 w-8 opacity-50" />
            </div>
            <p className="font-medium text-foreground mb-1">No podcasts generated yet</p>
            <p className="text-sm mb-4 max-w-xs">Create your first AI podcast by entering a topic or pasting content.</p>
            <Button asChild>
              <Link href="/dashboard/podcasts/new">Create Podcast</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {podcasts.map((podcast) => (
              <Link
                key={podcast.id}
                href={`/dashboard/podcasts/${podcast.id}`}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {podcast.title || `Podcast ${podcast.id.slice(0, 8)}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(podcast.createdAt), { addSuffix: true })}</span>
                    {podcast.audioDuration && (
                      <>
                        <span>•</span>
                        <span>{Math.round(podcast.audioDuration)}m</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  {getStatusBadge(podcast.status)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
