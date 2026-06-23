import { z } from "zod";

export const GuidedSessionStatusSchema = z.enum([
  "intake",
  "profile-ready",
  "brief-ready",
  "generated",
  "selected",
  "packaged"
]);

export const GuidedSessionSchema = z.object({
  session: z.object({
    id: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase hyphen-case session ids."),
    created_at: z.string().datetime(),
    status: GuidedSessionStatusSchema,
    user_request: z.string().min(1),
    brand_profile: z.string().optional(),
    style_profile: z.string().optional(),
    brief: z.string().optional(),
    output: z.string().optional(),
    selected_variation: z.string().optional(),
    answers: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).default({}),
    next_action: z.string().default("")
  })
});

export type GuidedSession = z.infer<typeof GuidedSessionSchema>;
