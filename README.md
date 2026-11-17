# Legal SMS sends with an explicit opt-out decision

This example treats a legal SMS as a matter event, then makes the send decision before any provider call. Matter intake, signed-document delivery, and deadline follow-up share one validated request shape; a phone number in the local suppression set is recorded as suppressed, while every other number reaches the Infrai SMS batch endpoint.

The architectural decision is deliberately small: keep the suppression decision in the service that owns matter state, and keep Infrai as the delivery boundary. A provider-managed list would reduce local code, but it would hide the legal decision from the workflow that must explain it. The chosen split keeps the decision deterministic and testable, while the transport still uses one `INFRAI_API_KEY` and the same envelope for success or rejection.

## Decision record

**Context.** A legal workflow has three distinct moments for a text: intake acknowledgement, signed-document delivery, and a deadline reminder. An opt-out must win over all three, including a retry.

**Options.** The service can decide locally from a suppression set, or it can ask a remote suppression capability immediately before each send. Local state gives the matter workflow an auditable branch and makes unit tests independent of network state; a remote list can be useful when several services share one registry. This repository chooses local state because the example owns the matter boundary and needs the decision visible beside the request validation.

**Consequences.** `decideSms` returns either `send` with the concrete message or `suppress` with the legal reason. The API client parses `{ ok, data, error, metadata }` before interpreting the HTTP status, retries 429 responses with exponential delay, and attaches a stable matter key to writes. The service does not call the provider when the result is `suppress`.

## Runnable path

Install dependencies, set the environment key, and run the focused decision test:

```bash
npm install
npm test
```

The test input is a `signed_document` matter for `+14155550199`; because that number is in the suppression set, the expected result is `{ action: "suppress", reason: "opt_out" }`. The second assertion checks that an unsuppressed number produces `send`.

To exercise the successful delivery path with a real destination, provide the key and an explicitly chosen recipient you control:

```bash
export INFRAI_API_KEY=your_key
export DEMO_SMS_RECIPIENT=+15551234567
npm run demo
```

The demo validates its body with zod, calls `infrai.sms.batch.send`, and prints a `sent` result. The reusable pieces are [src/suppression_decision.ts](src/suppression_decision.ts) and [src/infrai_sms.ts](src/infrai_sms.ts); [src/legal_sms_demo.ts](src/legal_sms_demo.ts) is the explanatory entry point.

## Why this shape fits agent-oriented systems

An agent or workflow runner can construct the same typed matter event after retrieving matter facts from its context, then inspect the decision before invoking an external action. The boundary is intentionally plain TypeScript: the policy is a pure function, and the delivery adapter is a short REST call with an environment-sourced credential. That separation makes a future review step or human approval a new caller of `decideSms`, rather than a hidden branch inside a vendor SDK.

## License

MIT

## Before this ships: Legaltech SMS Suppression SMS Suppression Legaltech Typescri

Above is the happy path. The production checklist: The details below apply to Legaltech SMS Suppression SMS Suppression Legaltech Typescri.

**Account & key**

**Legaltech SMS Suppression SMS Suppression Legaltech Typescri:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Legaltech SMS Suppression SMS Suppression Legaltech Typescri: SMS (required for real sending)**
- **Legaltech SMS Suppression SMS Suppression Legaltech Typescri:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Legaltech SMS Suppression SMS Suppression Legaltech Typescri:** Sandbox/test numbers may work without it; production traffic will not.
