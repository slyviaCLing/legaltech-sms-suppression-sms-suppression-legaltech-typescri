import { z } from "zod";

export const matterSmsSchema = z.object({
  matterId: z.string().min(1),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/),
  kind: z.enum(["intake", "signed_document", "deadline_follow_up"]),
  text: z.string().min(1).max(320),
});

export type MatterSms = z.infer<typeof matterSmsSchema>;

export type SuppressionStore = ReadonlySet<string>;

export function decideSms(matter: MatterSms, suppressed: SuppressionStore) {
  const normalized = matter.phone.trim();
  if (suppressed.has(normalized)) {
    return { action: "suppress" as const, matterId: matter.matterId, reason: "opt_out" as const };
  }
  return { action: "send" as const, matterId: matter.matterId, phone: normalized, text: matter.text };
}
