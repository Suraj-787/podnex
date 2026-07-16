import { z } from "zod";

// Empty/whitespace-only title means "not provided" (auto-generate) — without
// this, .optional() only permits undefined, so a blank form field (which
// submits "" rather than omitting the key) fails the .min(1) check instead
// of being treated as absent.
const optionalTitle = z.preprocess(
  (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
  z.string().min(1).max(200).optional()
);

export const createPodcastSchema = z.object({
  noteContent: z
    .string()
    .min(100, "Content must be at least 100 characters")
    .max(50000, "Content must be less than 50,000 characters"),
  duration: z.enum(["SHORT", "LONG"]).default("SHORT"),
  title: optionalTitle,
  noteId: z.string().optional(),
  hostVoice: z.string().default("host"),
  guestVoice: z.string().default("guest"),
  ttsProvider: z.string().default("unreal"),
});

export const updatePodcastSchema = z.object({
  title: optionalTitle,
  noteContent: z.string().min(100).max(50000).optional(),
});

export const listPodcastsSchema = z.preprocess(
  (data: any) => {
    // Handle combined format like "createdAt_desc"
    if (data.sort && typeof data.sort === 'string' && data.sort.includes('_')) {
      const [sortField, sortOrder] = data.sort.split('_');
      return {
        ...data,
        sort: sortField,
        order: sortOrder,
      };
    }
    return data;
  },
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
    sort: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
  })
);

export type CreatePodcastInput = z.infer<typeof createPodcastSchema>;
export type UpdatePodcastInput = z.infer<typeof updatePodcastSchema>;
export type ListPodcastsInput = z.infer<typeof listPodcastsSchema>;
