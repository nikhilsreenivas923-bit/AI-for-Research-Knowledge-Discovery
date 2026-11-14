import { z } from "zod";

export const WorkspaceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name must not exceed 100 characters"),
  domain: z.enum(["Academic", "Market", "Legal", "Corporate", "Other"], {
    errorMap: () => ({ message: "Please select a valid domain" })
  }),
  description: z.string().optional().default("")
});

export const DocumentIngestSchema = z.object({
  workspaceId: z.string().uuid("Invalid Workspace ID format"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(50, "Document must contain at least 50 characters of text"),
  author_or_source: z.string().optional().default("")
});

export const QuerySchema = z.object({
  workspaceId: z.string().uuid("Invalid Workspace ID format"),
  question: z.string().min(10, "Query is too short for meaningful analysis"),
  includeWebSearch: z.boolean().optional().default(false),
  strictCitationsOnly: z.boolean().optional().default(true)
});

