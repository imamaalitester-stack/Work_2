import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200),
  body: z.string().max(10000).optional().default(""),
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1, "title is required").max(200).optional(),
  body: z.string().max(10000).optional(),
});

export const noteIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});