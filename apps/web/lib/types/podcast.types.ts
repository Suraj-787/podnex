/**
 * Podcast Types
 * Frontend type definitions for podcast data
 */

export type PodcastStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type PodcastDuration = 'SHORT' | 'LONG';

export interface PodcastStatusResponse {
  status: PodcastStatus;
  progress: number;
  currentStep: string;
}


export interface Podcast {
  id: string;
  userId: string;
  title?: string;
  noteContent: string;
  status: PodcastStatus;
  duration: PodcastDuration;
  audioUrl?: string;
  audioDuration?: number; // in minutes (backend stores in minutes)
  audioSize?: number; // in bytes
  transcript?: string | TranscriptSegment[];
  errorMessage?: string;
  progress?: number; // 0-100 (for PROCESSING status)
  currentStep?: string; // "Generating script...", "Creating audio...", etc.
  createdAt: string;
  updatedAt: string;
  completedAt?: string; // When podcast generation completed
  failedAt?: string; // When podcast generation failed
  ttsProvider?: string;
  hostVoice?: string;
  guestVoice?: string;
  jobId?: string; // BullMQ job ID for tracking
  webhookUrl?: string; // Custom webhook URL
  noteId?: string; // Reference to original note
}

export interface TranscriptSegment {
  timestamp: number; // in seconds
  speaker: 'HOST' | 'GUEST';
  text: string;
}

export interface PodcastFilters {
  search?: string;
  status?: PodcastStatus | 'ALL';
  sort?: 'createdAt_desc' | 'createdAt_asc' | 'duration_desc' | 'duration_asc';
  page?: number;
  limit?: number;
}

export interface PodcastListResponse {
  podcasts: Podcast[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ViewMode = 'grid' | 'list';

// API DTOs
export interface CreatePodcastDto {
  noteContent: string;
  duration: PodcastDuration;
  title?: string;
  hostVoice?: string;
  guestVoice?: string;
  webhookUrl?: string;
  noteId?: string;
}

export interface UpdatePodcastDto {
  title?: string;
}

export interface ListPodcastsParams {
  page?: number;
  limit?: number;
  status?: PodcastStatus;
  search?: string;
  sort?: 'createdAt_desc' | 'createdAt_asc' | 'duration_desc' | 'duration_asc';
}

export interface PodcastStats {
  totalPodcasts: number;
  totalMinutes: number;
  thisMonthPodcasts: number;
  thisMonthMinutes: number;
  completedPodcasts: number;
  failedPodcasts: number;
  processingPodcasts: number;
}
