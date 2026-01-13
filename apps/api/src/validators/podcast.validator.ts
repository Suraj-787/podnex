import { z } from "zod";

export const createPodcastSchema = z.object({
  noteContent: z
    .string()
    .min(100, "Content must be at least 100 characters")
    .max(50000, "Content must be less than 50,000 characters"),
  duration: z.enum(["SHORT", "LONG"]).default("SHORT"),
  title: z.string().min(1).max(200).optional(),
  noteId: z.string().optional(),
  hostVoice: z.string().default("host"),
  guestVoice: z.string().default("guest"),
  ttsProvider: z.string().default("unreal"),
});

export const updatePodcastSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  noteContent: z.string().min(100).max(50000).optional(),
});

export const listPodcastsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
  sort: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreatePodcastInput = z.infer<typeof createPodcastSchema>;
export type UpdatePodcastInput = z.infer<typeof updatePodcastSchema>;
export type ListPodcastsInput = z.infer<typeof listPodcastsSchema>;
