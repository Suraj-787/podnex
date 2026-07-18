import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { CodeTabs } from "@/components/docs/CodeTabs";
import Link from "next/link";

const sections = [
  { id: "introduction", label: "Introduction" },
  { id: "authentication", label: "Authentication" },
  { id: "quickstart", label: "Quickstart" },
  { id: "voices", label: "Voices" },
  { id: "endpoints", label: "Endpoints" },
  { id: "webhooks", label: "Webhooks" },
  { id: "errors", label: "Errors" },
];

const hostVoices = [
  { name: "Sierra", style: "Warm & Friendly" },
  { name: "Hannah", style: "Professional" },
  { name: "Melody", style: "Casual" },
  { name: "Lauren", style: "Authoritative" },
  { name: "Emily", style: "Bright" },
  { name: "Kaitlyn", style: "Energetic" },
  { name: "Luna", style: "Calm" },
];

const guestVoices = [
  { name: "Daniel", style: "Engaging" },
  { name: "Noah", style: "Energetic" },
  { name: "Ethan", style: "Thoughtful" },
  { name: "Jasper", style: "Curious" },
  { name: "Caleb", style: "Calm" },
  { name: "Ronan", style: "Deep" },
  { name: "Zane", style: "Dynamic" },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="font-serif text-3xl font-medium mb-6 pt-4 scroll-mt-28"
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-serif text-xl font-medium mt-10 mb-3">{children}</h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground font-light leading-relaxed mb-4">
      {children}
    </p>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-surface border border-border/50 text-[13px] font-mono text-foreground">
      {children}
    </code>
  );
}

function ParamsTable({
  rows,
}: {
  rows: { name: string; type: string; required?: boolean; description: string }[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/50 mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-surface/40">
            <th className="text-left font-medium px-4 py-2.5 text-xs uppercase tracking-wide text-muted-foreground">
              Field
            </th>
            <th className="text-left font-medium px-4 py-2.5 text-xs uppercase tracking-wide text-muted-foreground">
              Type
            </th>
            <th className="text-left font-medium px-4 py-2.5 text-xs uppercase tracking-wide text-muted-foreground">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-border/30 last:border-0">
              <td className="px-4 py-3 font-mono text-[13px]">
                {row.name}
                {row.required && (
                  <span className="ml-1.5 text-[10px] uppercase tracking-wide text-amber-500">
                    required
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-mono text-[13px] text-muted-foreground">
                {row.type}
              </td>
              <td className="px-4 py-3 text-muted-foreground font-light">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EndpointHeading({
  method,
  path,
  scope,
}: {
  method: string;
  path: string;
  scope?: string;
}) {
  const methodColor =
    method === "GET"
      ? "bg-blue-500/10 text-blue-500"
      : method === "POST"
      ? "bg-emerald-500/10 text-emerald-500"
      : method === "PATCH"
      ? "bg-amber-500/10 text-amber-500"
      : "bg-red-500/10 text-red-500";

  return (
    <div className="flex items-center gap-3 mb-3 flex-wrap">
      <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${methodColor}`}>
        {method}
      </span>
      <code className="text-sm font-mono">{path}</code>
      {scope && (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface border border-border/50 text-muted-foreground">
          requires scope: {scope}
        </span>
      )}
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="grain-overlay" />
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 max-w-2xl">
            <span className="text-xs font-light tracking-wider text-muted-foreground uppercase mb-4 block">
              Documentation
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-4">
              Build with the
              <br />
              <span className="italic text-slate-light">PodNex API.</span>
            </h1>
            <p className="text-lg font-light text-muted-foreground leading-relaxed">
              Generate studio-quality podcasts programmatically, get notified
              the moment an episode is ready, and integrate PodNex into your
              own product.
            </p>
          </div>

          <div className="grid lg:grid-cols-[220px_1fr] gap-16">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <nav className="sticky top-28 space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-sm font-light text-muted-foreground hover:text-foreground transition-colors py-1.5"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="max-w-3xl min-w-0">
              {/* Introduction */}
              <section>
                <H2 id="introduction">Introduction</H2>
                <P>
                  The PodNex API lets you turn text content into a
                  natural-sounding, two-voice podcast episode with a single
                  request, and be notified via webhook when it&apos;s ready.
                </P>
                <P>
                  All requests are made over HTTPS to the base URL below. All
                  request and response bodies are JSON.
                </P>
                <CodeBlock code="https://api.podnex.tech" filename="Base URL" />
              </section>

              {/* Authentication */}
              <section>
                <H2 id="authentication">Authentication</H2>
                <P>
                  API requests are authenticated with an API key, passed as a
                  bearer token in the <InlineCode>Authorization</InlineCode>{" "}
                  header:
                </P>
                <CodeBlock
                  code={`Authorization: Bearer pk_live_...`}
                  language="http"
                />
                <P>
                  Create a key from your dashboard —{" "}
                  <Link
                    href="/dashboard/settings/api-keys"
                    className="text-foreground underline underline-offset-4 hover:text-slate-light transition-colors"
                  >
                    Settings → API Keys
                  </Link>
                  . The full key is shown once, at creation — store it
                  somewhere safe.
                </P>
                <P>
                  Keys are issued with one or both of the following scopes.
                  Requests made with a key missing the required scope get a{" "}
                  <InlineCode>403</InlineCode>.
                </P>
                <ParamsTable
                  rows={[
                    {
                      name: "podcasts:read",
                      type: "scope",
                      description:
                        "List and fetch podcasts, check generation status, download finished audio.",
                    },
                    {
                      name: "podcasts:write",
                      type: "scope",
                      description:
                        "Create, update, delete, and retry podcasts.",
                    },
                  ]}
                />
                <P>
                  API keys can only be created, listed, or revoked from an
                  authenticated dashboard session — not via the API itself,
                  and not with another API key. This means a leaked key can
                  never be used to mint itself broader access. The same
                  applies to managing webhooks.
                </P>
              </section>

              {/* Quickstart */}
              <section>
                <H2 id="quickstart">Quickstart</H2>
                <P>Generate your first episode:</P>
                <CodeTabs
                  tabs={[
                    {
                      label: "cURL",
                      code: `curl -X POST https://api.podnex.tech/api/v1/podcasts \\
  -H "Authorization: Bearer pk_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "noteContent": "The history of coffee, from Ethiopian highlands to a global industry — origins, the spread through the Ottoman Empire and Europe, and how it shaped trade routes for centuries.",
    "duration": "SHORT",
    "hostVoice": "Sierra",
    "guestVoice": "Daniel"
  }'`,
                    },
                    {
                      label: "JavaScript",
                      code: `const response = await fetch("https://api.podnex.tech/api/v1/podcasts", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.PODNEX_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    noteContent: "The history of coffee, from Ethiopian highlands to a global industry — origins, the spread through the Ottoman Empire and Europe, and how it shaped trade routes for centuries.",
    duration: "SHORT",      // "SHORT" (3-5 min) or "LONG" (8-10 min)
    hostVoice: "Sierra",
    guestVoice: "Daniel",
  }),
});

const podcast = await response.json();
console.log(podcast.data.id, podcast.data.status); // "QUEUED"`,
                    },
                    {
                      label: "Python",
                      code: `import os
import requests

response = requests.post(
    "https://api.podnex.tech/api/v1/podcasts",
    headers={"Authorization": f"Bearer {os.environ['PODNEX_API_KEY']}"},
    json={
        "noteContent": "The history of coffee, from Ethiopian highlands to a global industry — origins, the spread through the Ottoman Empire and Europe, and how it shaped trade routes for centuries.",
        "duration": "SHORT",
        "hostVoice": "Sierra",
        "guestVoice": "Daniel",
    },
)

podcast = response.json()
print(podcast["data"]["id"], podcast["data"]["status"])  # "QUEUED"`,
                    },
                  ]}
                />
                <P>
                  Generation runs asynchronously. Poll{" "}
                  <InlineCode>GET /api/v1/podcasts/:id/status</InlineCode> or
                  register a webhook (see below) to know when it&apos;s done,
                  rather than blocking on the request above.
                </P>
              </section>

              {/* Voices */}
              <section>
                <H2 id="voices">Voices</H2>
                <P>
                  Every episode is a conversation between a host and a guest
                  voice. Pass any of the names below as{" "}
                  <InlineCode>hostVoice</InlineCode> /{" "}
                  <InlineCode>guestVoice</InlineCode> — both are optional and
                  default to <InlineCode>Sierra</InlineCode> /{" "}
                  <InlineCode>Daniel</InlineCode>.
                </P>
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                      Host voices
                    </h4>
                    <ul className="space-y-2">
                      {hostVoices.map((v) => (
                        <li key={v.name} className="flex items-baseline gap-2 text-sm">
                          <span className="font-mono">{v.name}</span>
                          <span className="text-muted-foreground font-light">
                            — {v.style}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                      Guest voices
                    </h4>
                    <ul className="space-y-2">
                      {guestVoices.map((v) => (
                        <li key={v.name} className="flex items-baseline gap-2 text-sm">
                          <span className="font-mono">{v.name}</span>
                          <span className="text-muted-foreground font-light">
                            — {v.style}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <P>
                  You can preview every voice before you build against it on
                  the{" "}
                  <Link
                    href="/dashboard/podcasts/new"
                    className="text-foreground underline underline-offset-4 hover:text-slate-light transition-colors"
                  >
                    podcast creation page
                  </Link>
                  .
                </P>
              </section>

              {/* Endpoints */}
              <section>
                <H2 id="endpoints">Endpoints</H2>

                <H3>Create a podcast</H3>
                <EndpointHeading
                  method="POST"
                  path="/api/v1/podcasts"
                  scope="podcasts:write"
                />
                <ParamsTable
                  rows={[
                    {
                      name: "noteContent",
                      type: "string",
                      required: true,
                      description:
                        "100–50,000 characters. The source content your episode is generated from.",
                    },
                    {
                      name: "duration",
                      type: '"SHORT" | "LONG"',
                      description:
                        'SHORT is 3-5 minutes, LONG is 8-10 minutes. Defaults to "SHORT".',
                    },
                    {
                      name: "title",
                      type: "string",
                      description:
                        "Up to 200 characters. Left blank, a title is generated from your content.",
                    },
                    {
                      name: "hostVoice / guestVoice",
                      type: "string",
                      description: "See Voices above. Default to Sierra / Daniel.",
                    },
                    {
                      name: "webhookUrl",
                      type: "string (url)",
                      description:
                        "Optional one-off override — most integrations register a persistent webhook instead (see below).",
                    },
                  ]}
                />
                <P>
                  Returns <InlineCode>201</InlineCode> with the created
                  podcast, status <InlineCode>QUEUED</InlineCode>.
                </P>

                <H3>List podcasts</H3>
                <EndpointHeading
                  method="GET"
                  path="/api/v1/podcasts"
                  scope="podcasts:read"
                />
                <ParamsTable
                  rows={[
                    { name: "page", type: "number", description: "Default 1." },
                    {
                      name: "limit",
                      type: "number",
                      description: "Default 20, max 100.",
                    },
                    {
                      name: "status",
                      type: '"QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED"',
                      description: "Filter by status.",
                    },
                    {
                      name: "sort / order",
                      type: '"createdAt" | "updatedAt" / "asc" | "desc"',
                      description: "Default createdAt, desc.",
                    },
                  ]}
                />

                <H3>Get / check status / download</H3>
                <div className="space-y-4 mb-4">
                  <EndpointHeading
                    method="GET"
                    path="/api/v1/podcasts/:id"
                    scope="podcasts:read"
                  />
                  <EndpointHeading
                    method="GET"
                    path="/api/v1/podcasts/:id/status"
                    scope="podcasts:read"
                  />
                  <EndpointHeading
                    method="GET"
                    path="/api/v1/podcasts/:id/download"
                    scope="podcasts:read"
                  />
                </div>
                <P>
                  <InlineCode>/status</InlineCode> returns a lightweight{" "}
                  <InlineCode>{`{ status, progress, currentStep }`}</InlineCode>{" "}
                  — cheaper to poll than the full object.{" "}
                  <InlineCode>/download</InlineCode> returns a
                  time-limited, presigned <InlineCode>{`{ url }`}</InlineCode>{" "}
                  for the finished audio file (also embedded directly in the
                  podcast object once <InlineCode>COMPLETED</InlineCode>).
                </P>

                <H3>Update / delete / retry</H3>
                <div className="space-y-4 mb-4">
                  <EndpointHeading
                    method="PATCH"
                    path="/api/v1/podcasts/:id"
                    scope="podcasts:write"
                  />
                  <EndpointHeading
                    method="DELETE"
                    path="/api/v1/podcasts/:id"
                    scope="podcasts:write"
                  />
                  <EndpointHeading
                    method="POST"
                    path="/api/v1/podcasts/:id/retry"
                    scope="podcasts:write"
                  />
                </div>
                <P>
                  <InlineCode>/retry</InlineCode> re-queues a{" "}
                  <InlineCode>FAILED</InlineCode> podcast with the same
                  content and settings.
                </P>

                <H3>Usage stats</H3>
                <EndpointHeading
                  method="GET"
                  path="/api/v1/podcasts/stats"
                  scope="podcasts:read"
                />
                <P>
                  Returns your all-time and this-month podcast counts and
                  total generated minutes.
                </P>
              </section>

              {/* Webhooks */}
              <section>
                <H2 id="webhooks">Webhooks</H2>
                <P>
                  Register a webhook from{" "}
                  <Link
                    href="/dashboard/settings/webhooks"
                    className="text-foreground underline underline-offset-4 hover:text-slate-light transition-colors"
                  >
                    Settings → Webhooks
                  </Link>{" "}
                  to get notified as a podcast moves through its lifecycle,
                  instead of polling. Webhook management requires a dashboard
                  session — it isn&apos;t available via API key.
                </P>

                <H3>Events</H3>
                <ParamsTable
                  rows={[
                    {
                      name: "PODCAST_CREATED",
                      type: "event",
                      description: "Fired immediately once a podcast is queued.",
                    },
                    {
                      name: "PODCAST_PROCESSING",
                      type: "event",
                      description: "Fired when generation actually starts.",
                    },
                    {
                      name: "PODCAST_COMPLETED",
                      type: "event",
                      description:
                        "Fired when audio is ready. Payload includes a presigned, downloadable audioUrl valid for 1 hour.",
                    },
                    {
                      name: "PODCAST_FAILED",
                      type: "event",
                      description: "Fired if generation errors out.",
                    },
                  ]}
                />

                <H3>Delivery</H3>
                <P>
                  Each event is POSTed to your URL as JSON, with these
                  headers:
                </P>
                <CodeBlock
                  language="http"
                  code={`Content-Type: application/json
X-Webhook-Event: PODCAST_COMPLETED
X-Webhook-Timestamp: 1784360230628
X-Webhook-Signature: <hex-encoded HMAC-SHA256 of the raw request body>`}
                />
                <P>
                  Failed deliveries (network error or non-2xx response) are
                  retried up to 3 times with exponential backoff.
                </P>

                <H3>Example payload — PODCAST_COMPLETED</H3>
                <CodeBlock
                  language="json"
                  code={`{
  "podcastId": "cmrq2fh6w000110eyvl8qngx4",
  "status": "COMPLETED",
  "audioUrl": "https://podnex-audio.s3.eu-north-1.amazonaws.com/...(presigned)",
  "audioDuration": 8,
  "timestamp": "2026-07-18T07:49:58.254Z"
}`}
                />

                <H3>Verifying signatures</H3>
                <P>
                  The secret shown when you create a webhook signs every
                  delivery with HMAC-SHA256 over the raw JSON body. Verify it
                  using the raw request body — not a re-serialized object,
                  which can produce a different byte sequence and a
                  signature mismatch.
                </P>
                <CodeTabs
                  tabs={[
                    {
                      label: "Node.js",
                      code: `import crypto from "crypto";

function verifyWebhook(rawBody, signatureHeader, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody) // raw string, not JSON.parse(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader),
    Buffer.from(expected)
  );
}`,
                    },
                    {
                      label: "Python",
                      code: `import hashlib
import hmac

def verify_webhook(raw_body: bytes, signature_header: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature_header, expected)`,
                    },
                  ]}
                />
              </section>

              {/* Errors */}
              <section>
                <H2 id="errors">Errors</H2>
                <P>Every response follows the same envelope:</P>
                <CodeTabs
                  tabs={[
                    {
                      label: "Success",
                      code: `{ "success": true, "data": { ... } }`,
                    },
                    {
                      label: "Error",
                      code: `{ "success": false, "error": "Content must be at least 100 characters" }`,
                    },
                  ]}
                />
                <ParamsTable
                  rows={[
                    { name: "400", type: "status", description: "Validation failed — check the error message." },
                    { name: "401", type: "status", description: "Missing, invalid, or expired API key / session." },
                    { name: "403", type: "status", description: "Valid key, but missing the required scope, or the action requires a dashboard session." },
                    { name: "404", type: "status", description: "The resource doesn't exist, or isn't yours." },
                    { name: "500", type: "status", description: "Something broke on our end — safe to retry." },
                  ]}
                />
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
