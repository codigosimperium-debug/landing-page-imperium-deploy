import { z } from "zod";

export const TRACKING_EVENTS = [
  "page_view",
  "click",
  "form_start",
  "form_submit",
  "form_success",
  "thank_you_view",
  "lead_created",
] as const;

const textField = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .default("");

const optionalDate = z
  .string()
  .datetime({ offset: true })
  .optional();

const leadSchema = z.object({
  service_interest: z.string().trim().max(120),
  name: z.string().trim().max(180),
  whatsapp: z.string().trim().max(40),
  email: z.string().trim().email().max(180),
  unit: z.string().trim().max(120),
  goal: z.string().trim().max(240).optional().default(""),
});

export const ingestPayloadSchema = z
  .object({
    session_id: z.string().uuid(),
    event_name: z.enum(TRACKING_EVENTS),
    timestamp: optionalDate,
    page_path: textField(180),
    referrer: textField(500),
    props: z.record(z.string(), z.unknown()).optional().default({}),
    utm_source: textField(120),
    utm_medium: textField(120),
    utm_campaign: textField(120),
    utm_content: textField(120),
    utm_term: textField(120),
    lead: leadSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.event_name === "lead_created" && !value.lead) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "lead is required for lead_created event",
        path: ["lead"],
      });
    }
  });

export type IngestPayload = z.infer<typeof ingestPayloadSchema>;

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).default(200),
  offset: z.coerce.number().int().min(0).default(0),
});
