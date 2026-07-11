# Learning Phase 1: what we set up in AWS and why

This isn't generic AWS documentation — it explains exactly the six pieces we
configured for PodNex, in the order we touched them, using the real values
from your setup. Read it top to bottom once; it's written so each section
explains why the *previous* section wasn't enough on its own.

## The problem we were solving

Your API + worker currently only exist as a process on your laptop. For
PodNex to be a real product: (1) something needs to run 24/7 without your
laptop being open, (2) it needs a stable network address the internet can
reach, (3) generated audio files need somewhere durable to live, and (4) all
of that needs to be locked down so random strangers on the internet can't
touch it. Each AWS piece below solves exactly one of those four problems.

---

## 1. IAM (Identity and Access Management) — "who is allowed to do what"

**The problem it solves:** AWS has no concept of "logged in, therefore
trusted." *Every single action* — create a bucket, launch a server, read a
file — requires an explicit permission check against an identity. Your
friend's AWS account is the "landlord"; you needed a named identity inside it
with specific permissions granted, not blanket access.

**What we actually created:** an IAM user called `podnex-prod-app` with
exactly one policy attached, scoped to exactly one resource:

```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
  "Resource": "arn:aws:s3:::podnex-audio/*"
}
```

Translated: "this identity may upload, read, and delete files inside the
`podnex-audio` bucket — nothing else, anywhere in AWS." Not admin access. Not
"can do anything to any bucket." One bucket, three actions.

**Why scope it this tightly:** those two long strings
(`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`) are effectively a
username+password for this identity, and they now live in a `.env` file on a
server and in this chat transcript. If they ever leak, the damage is capped
at "someone can mess with one storage bucket" instead of "someone can spin up
thousands of dollars of EC2 instances on your friend's credit card." This is
called the **principle of least privilege** — always the default posture in
AWS.

**Important distinction to lock in now:** these IAM keys are a completely
different identity system from the SSH key you used to log into the server
in Section 3. IAM keys = "what can *code* do to AWS services." SSH keys =
"who can log into *this specific machine*." People conflate them constantly
when starting out — they don't talk to each other at all.

---

## 2. S3 (Simple Storage Service) — durable file storage

**The problem it solves:** generated podcast audio needs to live somewhere
permanent, downloadable, and not tied to any one server's disk (if the EC2
instance ever gets replaced, files on its local disk would vanish with it).
S3 is a storage service, addressed over HTTP, that lives independently of
any compute instance.

**What we created:** a bucket named `podnex-audio` in the `eu-north-1`
region (Stockholm). "Region" just means which physical cluster of AWS
datacenters owns this bucket's data — matters for latency and, as you saw,
for a subtler reason below.

**Block Public Access — left ON:** nobody can read a file just by guessing
its URL. Instead, `storage.service.ts` generates **presigned URLs** — a link
with a cryptographic signature baked in that expires (we use 1 hour). The
app only hands one out after checking the requester actually owns that
podcast. Public bucket = anyone with a link forever. Presigned URL = only
people your app has authorized, only for a limited time.

**CORS policy — why we needed it separately:** browsers enforce a rule
called the *same-origin policy* — a page served from `podnex.tech` is
normally forbidden from loading data from a totally different domain like
`podnex-audio.s3.eu-north-1.amazonaws.com`, even with a valid signed URL.
The CORS JSON we added to the bucket is S3 explicitly telling the browser
"requests from `your-vercel-domain.com` are allowed" — without it, the
`<audio>` player would fail to load even a perfectly valid presigned URL.

**The bug we actually hit — a real lesson, not hypothetical:** you created
the bucket in `eu-north-1`, but `.env` still said `AWS_REGION="us-east-1"`
from the template. AWS request signing (SigV4) *bakes the region into the
cryptographic signature itself* — it's not just a routing hint. Sign a
request with the wrong region and the signature is simply invalid, even
though the access key and secret were both completely correct. This is why
we tested with a real put/get/delete before moving on, instead of assuming
config was right because it looked plausible.

---

## 3. EC2 (Elastic Compute Cloud) — the actual server

**The problem it solves:** you need a computer that's always on, always
reachable, that isn't your laptop.

**What we launched:** an Ubuntu 24.04 LTS instance, size `t3.small`/`medium`
(`t3` = a "burstable" general-purpose family — cheap, fine for a workload
that isn't constantly maxed out; `small`/`medium` = how much CPU/RAM you're
renting). You created an SSH key pair at launch (`podnex-ec2.pem`) instead of
a password — this is *much* harder to brute-force than any password, since
it's a matching cryptographic key pair rather than a guessable string. This
is exactly what let you run `ssh -i podnex-ec2.pem ubuntu@13.50.222.62` and
land at a real shell prompt.

---

## 4. Security Groups — the instance's firewall

**The problem it solves:** the moment an EC2 instance exists, it's
technically reachable from the entire internet — anyone, anywhere, could try
to connect to any port unless something blocks them.

**What we configured** (attached to the instance as `podnex-api-sg`):
- Port 22 (SSH) — allowed *only from your IP*, not the whole internet.
- Port 80 (HTTP) and 443 (HTTPS) — open to everyone, since this will be a
  public API.
- Everything else, including the app's own port 3001, stays closed. Later
  (Phase 4), nginx will listen on 80/443 and forward traffic internally to
  3001 — the outside world will never talk to port 3001 directly.

Think of it as a building's front desk: only specific doors are unlocked,
and only for specific kinds of visitors. Everything else is a wall.

---

## 5. Elastic IP — an address that doesn't change

**The problem it solves:** a normal EC2 instance's public IP address *changes*
every time you stop and restart it. That's fine until you've told the entire
internet (via DNS) "the API lives at this exact IP" — then a routine restart
silently breaks everything pointing at the old address.

**What we did:** allocated an Elastic IP (`13.50.222.62`) and attached it to
the instance. This address belongs to your AWS account, not the instance —
you could swap it to a brand new replacement server later and DNS would
never need to change.

---

## 6. DNS A Record — the human-readable name

**The problem it solves:** nobody wants to hit an API via a raw IP address,
and more importantly, a stable *name* is required for HTTPS certificates
later, and for other services (Dodo Payments' webhook caller, your
frontend's CORS allow-list) to reliably find your backend by something that
won't change even if the underlying IP ever does.

**What we did:** added an A record — `api.podnex.tech` → `13.50.222.62` —
verified with `dig api.podnex.tech`.

---

## How it all connects, end to end

```
Someone's browser
   │  asks: "where is api.podnex.tech?"
   ▼
DNS  →  resolves to Elastic IP 13.50.222.62
   │
   ▼
Elastic IP  →  points at your EC2 instance
   │
   ▼
Security Group  →  only lets port 80/443 traffic through
   │
   ▼
(Phase 2/4: nginx will live here, forwarding to the app on port 3001)
   │
   ▼
PodNex API/worker running on the EC2 instance
   │  needs to store/fetch audio, so it authenticates as...
   ▼
IAM user `podnex-prod-app`  →  allowed to touch only the podnex-audio bucket
   │
   ▼
S3 bucket `podnex-audio` (eu-north-1)  →  stores the actual audio files
```

## What's deliberately not set up yet

- **nginx / HTTPS** (Phases 2 & 4) — right now nothing is actually listening
  on ports 80/443 on the server yet.
- **Docker** (Phase 2) — the container runtime isn't installed yet.
- **The app itself** (Phase 3) — the PodNex code isn't running on the server
  yet; SSH access just proves the machine and network path exist.

---

## A prompt you can paste into any voice-mode LLM

If you'd rather have this explained out loud, conversationally, and be able
to ask follow-up questions — paste this into ChatGPT/Claude voice mode (or
any LLM):

```
I'm learning AWS for the first time by deploying a real Node.js backend
(Express API + a BullMQ/Redis worker) to production. Act as a patient
teacher who checks my understanding with small questions as you go, rather
than lecturing straight through.

Here's exactly what I set up, in order, and I want you to explain WHY each
piece was necessary and how it connects to the one before it:

1. IAM: created a scoped IAM user with a policy allowing only
   s3:PutObject/GetObject/DeleteObject on one specific S3 bucket
   (arn:aws:s3:::podnex-audio/*) — not admin access.
2. S3: created a bucket "podnex-audio" in eu-north-1 (Stockholm), with
   "Block Public Access" left ON, and a CORS policy allowing GET/HEAD
   requests from my frontend's domain.
3. EC2: launched an Ubuntu 24.04 t3.small/medium virtual server, using an
   SSH key pair (not a password) to log in.
4. Security Group: a firewall on the EC2 instance allowing only port 22
   (SSH, restricted to my IP), 80, and 443 — nothing else.
5. Elastic IP: allocated a static public IP and attached it to the
   instance, so the address survives restarts.
6. DNS: added an A record pointing api.<mydomain> at that Elastic IP.

Walk me through: why IAM keys and SSH keys are two totally separate systems
that people confuse when starting out; why presigned URLs exist instead of
just making the S3 bucket public; why AWS region mismatches break signed
requests even when the access key and secret are correct; and why a
security group is necessary even though the app itself will have its own
authentication. Quiz me on each concept before moving to the next one.
```

---

## Coming next: Phase 2

Bootstrapping the server itself — installing Docker, nginx, and certbot, and
hardening SSH/firewall — so the machine is ready to actually run the app.
