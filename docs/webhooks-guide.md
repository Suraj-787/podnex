# PodNex Webhooks - Complete Guide & Examples

## 🎯 What are Webhooks?

Webhooks allow you to receive real-time HTTP notifications when events happen in your PodNex account. Instead of polling the API, PodNex will send a POST request to your specified URL when events occur.

---

## 📝 Quick Example

### 1. Create a Webhook

**Via UI:**
1. Go to **Dashboard → Settings → Webhooks**
2. Click **"Create Webhook"**
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/podnex`
4. Select events you want to receive:
   - ☑️ Podcast Created
   - ☑️ Podcast Processing
   - ☑️ Podcast Completed
   - ☑️ Podcast Failed
5. Click **"Create"**
6. **Save the secret!** You'll need it to verify webhook signatures

**Via API:**
```bash
curl -X POST https://api.podnex.com/api/v1/webhooks \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "url": "https://your-domain.com/api/webhooks/podnex",
    "events": [
      "PODCAST_CREATED",
      "PODCAST_PROCESSING",
      "PODCAST_COMPLETED",
      "PODCAST_FAILED"
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "url": "https://your-domain.com/api/webhooks/podnex",
    "secret": "whsec_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "events": [
      "PODCAST_CREATED",
      "PODCAST_PROCESSING",
      "PODCAST_COMPLETED",
      "PODCAST_FAILED"
    ],
    "active": true,
    "createdAt": "2026-01-21T10:00:00.000Z",
    "updatedAt": "2026-01-21T10:00:00.000Z"
  },
  "message": "Webhook created successfully. Save the secret - you'll need it to verify signatures!"
}
```

---

## 🔔 Webhook Events

### Available Events

| Event | Description | When It Fires |
|-------|-------------|---------------|
| `PODCAST_CREATED` | New podcast created | Immediately after user creates a podcast |
| `PODCAST_PROCESSING` | Generation started | When the podcast enters the processing queue |
| `PODCAST_COMPLETED` | Generation finished | When audio file is ready |
| `PODCAST_FAILED` | Generation failed | When an error occurs during generation |

---

## 📦 Webhook Payload Examples

### 1. PODCAST_CREATED

```json
{
  "event": "PODCAST_CREATED",
  "podcastId": "clx9876543210",
  "status": "QUEUED",
  "timestamp": "2026-01-21T10:15:00.000Z"
}
```

### 2. PODCAST_PROCESSING

```json
{
  "event": "PODCAST_PROCESSING",
  "podcastId": "clx9876543210",
  "status": "PROCESSING",
  "progress": 0,
  "timestamp": "2026-01-21T10:15:05.000Z"
}
```

### 3. PODCAST_COMPLETED

```json
{
  "event": "PODCAST_COMPLETED",
  "podcastId": "clx9876543210",
  "status": "COMPLETED",
  "audioUrl": "https://storage.podnex.com/podcasts/clx9876543210.mp3",
  "audioDuration": 5,
  "timestamp": "2026-01-21T10:18:30.000Z"
}
```

### 4. PODCAST_FAILED

```json
{
  "event": "PODCAST_FAILED",
  "podcastId": "clx9876543210",
  "status": "FAILED",
  "error": "OpenAI API rate limit exceeded",
  "timestamp": "2026-01-21T10:16:00.000Z"
}
```

---

## 🔐 Webhook Security

### Headers Sent with Each Webhook

```
Content-Type: application/json
X-Webhook-Signature: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
X-Webhook-Timestamp: 1705838100000
X-Webhook-Event: PODCAST_COMPLETED
```

### Verifying Webhook Signatures

**Why?** To ensure the webhook actually came from PodNex and wasn't spoofed.

**Node.js Example:**
```javascript
import crypto from 'crypto';

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Usage in Express
app.post('/api/webhooks/podnex', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.PODNEX_WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process the webhook
  const { event, podcastId } = req.body;
  console.log(`Received ${event} for podcast ${podcastId}`);
  
  res.status(200).json({ received: true });
});
```

**Python Example:**
```python
import hmac
import hashlib
import json

def verify_webhook_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode(),
        json.dumps(payload).encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

# Usage in Flask
@app.route('/api/webhooks/podnex', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Webhook-Signature')
    secret = os.environ.get('PODNEX_WEBHOOK_SECRET')
    
    if not verify_webhook_signature(request.json, signature, secret):
        return jsonify({'error': 'Invalid signature'}), 401
    
    event = request.json.get('event')
    podcast_id = request.json.get('podcastId')
    print(f'Received {event} for podcast {podcast_id}')
    
    return jsonify({'received': True}), 200
```

---

## 💡 Real-World Use Cases

### 1. Send Email Notifications

```javascript
app.post('/api/webhooks/podnex', async (req, res) => {
  const { event, podcastId, audioUrl } = req.body;
  
  if (event === 'PODCAST_COMPLETED') {
    await sendEmail({
      to: 'user@example.com',
      subject: 'Your podcast is ready!',
      body: `Your podcast is ready to download: ${audioUrl}`
    });
  }
  
  res.status(200).json({ received: true });
});
```

### 2. Update Database

```javascript
app.post('/api/webhooks/podnex', async (req, res) => {
  const { event, podcastId, status } = req.body;
  
  await db.podcasts.update({
    where: { id: podcastId },
    data: { 
      status,
      updatedAt: new Date()
    }
  });
  
  res.status(200).json({ received: true });
});
```

### 3. Trigger Other Workflows

```javascript
app.post('/api/webhooks/podnex', async (req, res) => {
  const { event, podcastId, audioUrl } = req.body;
  
  if (event === 'PODCAST_COMPLETED') {
    // Upload to your CDN
    await uploadToCDN(audioUrl);
    
    // Post to social media
    await postToTwitter(`New podcast episode available!`);
    
    // Notify Slack channel
    await notifySlack(`Podcast ${podcastId} is ready!`);
  }
  
  res.status(200).json({ received: true });
});
```

### 4. Analytics Tracking

```javascript
app.post('/api/webhooks/podnex', async (req, res) => {
  const { event, podcastId, audioDuration } = req.body;
  
  // Track in analytics
  analytics.track({
    event: 'podcast_generated',
    properties: {
      podcast_id: podcastId,
      duration: audioDuration,
      status: event
    }
  });
  
  res.status(200).json({ received: true });
});
```

---

## 🔄 Webhook Retry Logic

PodNex automatically retries failed webhook deliveries:

- **Retry Count:** 3 attempts
- **Backoff:** Exponential (1s, 2s, 4s)
- **Success:** HTTP 200-299 response
- **Failure:** Any other status code or network error

**Example Timeline:**
```
10:00:00 - First attempt (fails)
10:00:01 - Retry #1 (fails)
10:00:03 - Retry #2 (fails)
10:00:07 - Retry #3 (succeeds)
```

---

## 🧪 Testing Webhooks

### 1. Use the Test Button

In the PodNex UI:
1. Go to **Dashboard → Settings → Webhooks**
2. Click the **Send** icon next to your webhook
3. A test `PODCAST_CREATED` event will be sent

### 2. Use webhook.site for Testing

```bash
# Create a temporary webhook endpoint
# Visit https://webhook.site and copy your unique URL

curl -X POST https://api.podnex.com/api/v1/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://webhook.site/your-unique-id",
    "events": ["PODCAST_COMPLETED"]
  }'
```

### 3. Local Testing with ngrok

```bash
# Start ngrok
ngrok http 3000

# Use the ngrok URL in your webhook
# Example: https://abc123.ngrok.io/api/webhooks/podnex
```

---

## 📊 Monitoring Webhook Deliveries

### View Delivery Logs

**Via UI:**
1. Go to **Dashboard → Settings → Webhooks**
2. Click on a webhook to see delivery count
3. View detailed logs (coming soon)

**Via API:**
```bash
curl https://api.podnex.com/api/v1/webhooks/{webhook_id}/deliveries \
  -H "Cookie: your-session-cookie"
```

**Response:**
```json
{
  "success": true,
  "deliveries": [
    {
      "id": "del_123",
      "event": "PODCAST_COMPLETED",
      "payload": { ... },
      "responseStatus": 200,
      "responseBody": "{\"received\":true}",
      "success": true,
      "error": null,
      "createdAt": "2026-01-21T10:18:30.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 🛠️ Complete Implementation Example

### Express.js Webhook Handler

```javascript
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.PODNEX_WEBHOOK_SECRET;

// Verify signature middleware
function verifySignature(req, res, next) {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
}

// Webhook endpoint
app.post('/api/webhooks/podnex', verifySignature, async (req, res) => {
  const { event, podcastId, status, audioUrl, error } = req.body;
  
  console.log(`📨 Webhook received: ${event} for podcast ${podcastId}`);
  
  try {
    switch (event) {
      case 'PODCAST_CREATED':
        console.log(`✨ New podcast created: ${podcastId}`);
        break;
        
      case 'PODCAST_PROCESSING':
        console.log(`⚙️ Podcast processing: ${podcastId}`);
        await updatePodcastStatus(podcastId, 'processing');
        break;
        
      case 'PODCAST_COMPLETED':
        console.log(`✅ Podcast completed: ${podcastId}`);
        await updatePodcastStatus(podcastId, 'completed');
        await notifyUser(podcastId, audioUrl);
        break;
        
      case 'PODCAST_FAILED':
        console.log(`❌ Podcast failed: ${podcastId} - ${error}`);
        await updatePodcastStatus(podcastId, 'failed');
        await notifyUserOfError(podcastId, error);
        break;
    }
    
    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ received: true });
    
  } catch (err) {
    console.error('Error processing webhook:', err);
    // Still return 200 to prevent retries
    res.status(200).json({ received: true, error: err.message });
  }
});

async function updatePodcastStatus(podcastId, status) {
  // Update your database
  console.log(`Updating podcast ${podcastId} to ${status}`);
}

async function notifyUser(podcastId, audioUrl) {
  // Send email, push notification, etc.
  console.log(`Notifying user about podcast ${podcastId}: ${audioUrl}`);
}

async function notifyUserOfError(podcastId, error) {
  // Send error notification
  console.log(`Notifying user about error in podcast ${podcastId}: ${error}`);
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

---

## 🎓 Best Practices

1. **Always verify signatures** - Prevent spoofed webhooks
2. **Respond quickly** - Return 200 within 5 seconds
3. **Process asynchronously** - Don't block the webhook response
4. **Handle duplicates** - Use idempotency keys
5. **Log everything** - For debugging and monitoring
6. **Secure your endpoint** - Use HTTPS only
7. **Handle retries gracefully** - Make operations idempotent

---

## 🔗 Quick Links

- **Create Webhook:** `/dashboard/settings/webhooks`
- **API Documentation:** `/docs/api/webhooks`
- **Webhook Logs:** `/dashboard/settings/webhooks/{id}/deliveries`

---

**Need Help?**
- Check delivery logs for failed webhooks
- Use the test button to verify your endpoint
- Contact support if webhooks aren't being delivered

**Created:** January 21, 2026
