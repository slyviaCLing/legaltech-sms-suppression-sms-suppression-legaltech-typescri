import { decideSms, matterSmsSchema } from "./suppression_decision.ts";
import { infrai } from "./infrai_sms.ts";

const phone = process.env.DEMO_SMS_RECIPIENT;
if (!phone) throw new Error("DEMO_SMS_RECIPIENT is required");

const request = matterSmsSchema.parse({
  matterId: "matter-104",
  phone,
  kind: "deadline_follow_up",
  text: "Your filing deadline is tomorrow. Reply to your legal team for help.",
});

const decision = decideSms(request, new Set(["+14155550199"]));
if (decision.action === "suppress") {
  console.log({ status: "suppressed", matterId: decision.matterId, reason: decision.reason });
} else {
  const result = await infrai.sms.batch.send({ messages: [{ to: decision.phone, text: decision.text }] }, `matter:${decision.matterId}`);
  console.log({ status: "sent", matterId: decision.matterId, result });
}
