import assert from "node:assert/strict";
import { decideSms, matterSmsSchema } from "./suppression_decision.ts";

const matter = matterSmsSchema.parse({
  matterId: "matter-7",
  phone: "+14155550199",
  kind: "signed_document",
  text: "Your signed agreement is ready.",
});

assert.deepEqual(decideSms(matter, new Set([matter.phone])), {
  action: "suppress",
  matterId: "matter-7",
  reason: "opt_out",
});
assert.equal(decideSms({ ...matter, phone: "+14155550198" }, new Set()).action, "send");
console.log("suppression decision test passed");
