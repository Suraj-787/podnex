# Testing Guide: API Keys & Webhooks

## 🧪 Complete Testing Instructions for PodNex Advanced Features

---

## Part 1: Testing API Keys

### Prerequisites
- ✅ Backend running on `http://localhost:3001`
- ✅ Frontend running on `http://localhost:3000`
- ✅ User account created and logged in

---

### Step 1: Access API Keys Page

1. Open browser to `http://localhost:3000`
2. Sign in to your account
3. Navigate to **Dashboard → Settings → API Keys**
   - URL: `http://localhost:3000/dashboard/settings/api-keys`

**Expected:** You should see the API Keys page with either:
- Empty state: "No API keys yet"
- List of existing API keys

---

### Step 2: Create Your First API Key

1. Click the **"Create API Key"** button
2. A form should appear below the button
3. Enter a name: `Test Key 1`
4. Click **"Create"**

**Expected:**
- Green success card appears showing your new API key
- Full key displayed (starts with `pk_live_`)
- Example: `pk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

---

### Step 3: Copy the API Key

1. Click the **Copy** button next to the key
2. Check browser console or try pasting

**Expected:**
- Toast notification: "API key copied to clipboard"
- Key is in your clipboard

---

### Step 4: Close the Success Card

1. Click **"Done"** button
2. The green card should disappear
3. Your new key should appear in the list below

**Expected:**
- Key card showing:
  - Name: "Test Key 1"
  - Preview: `pk_live_a1b2c3...y5z6` (truncated)
  - Created timestamp: "a few seconds ago"
  - Last used: (empty initially)

---

### Step 5: Test the API Key

Open a new terminal and test the API key:

```bash
# Replace YOUR_API_KEY with the key you copied
export API_KEY="pk_live_a1b2c3d4e5f6..."

# Test authentication
curl -X GET http://localhost:3001/api/v1/podcasts \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

**If you get an error:**
- Check that the API key is correct
- Verify backend is running
- Check backend logs for errors

---

### Step 6: Create a Podcast Using API Key

```bash
curl -X POST http://localhost:3001/api/v1/podcasts \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "noteContent": "This is a test podcast created via API key. Artificial intelligence is transforming the world.",
    "duration": "SHORT",
    "hostVoice": "Scarlett",
    "guestVoice": "Dan"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "status": "QUEUED",
    "noteContent": "This is a test podcast...",
    "createdAt": "2026-01-21T..."
  }
}
```

---

### Step 7: Verify Last Used Timestamp

1. Go back to the API Keys page
2. Refresh the page
3. Look at your "Test Key 1"

**Expected:**
- "Last used" should now show: "a few seconds ago"

---

### Step 8: Create Multiple API Keys

1. Click **"Create API Key"** again
2. Enter name: `Production Key`
3. Click **"Create"**
4. Click **"Done"**
5. Repeat for `Development Key`

**Expected:**
- You should now have 3 API keys listed
- Each with different names
- Each with unique preview

---

### Step 9: Revoke an API Key

1. Find "Development Key" in the list
2. Click the **Trash** icon on the right
3. Confirmation dialog appears
4. Click **"Revoke"**

**Expected:**
- Toast notification: "API key revoked successfully"
- "Development Key" disappears from the list
- Only 2 keys remain

---

### Step 10: Test Revoked Key

```bash
# Try using the revoked key
curl -X GET http://localhost:3001/api/v1/podcasts \
  -H "Authorization: Bearer $REVOKED_KEY" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

---

## Part 2: Testing Webhooks

### Prerequisites
- ✅ API Keys test completed
- ✅ A tool to receive webhooks (choose one):
  - **Option A:** webhook.site (easiest)
  - **Option B:** ngrok + local server
  - **Option C:** RequestBin

---

### Step 1: Set Up Webhook Receiver

**Option A: Using webhook.site (Recommended for Testing)**

1. Go to https://webhook.site
2. You'll get a unique URL like: `https://webhook.site/12345678-1234-1234-1234-123456789abc`
3. Keep this tab open to see incoming webhooks
4. Copy the URL

**Option B: Using ngrok + Local Server**

```bash
# Terminal 1: Start a simple webhook server
cd /tmp
cat > webhook-server.js << 'EOF'
const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  console.log('📨 Webhook received:');
  console.log(JSON.stringify(req.body, null, 2));
  console.log('Headers:', req.headers);
  res.json({ received: true });
});

app.listen(4000, () => console.log('Webhook server on port 4000'));
EOF

node webhook-server.js

# Terminal 2: Start ngrok
ngrok http 4000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Your webhook URL will be: https://abc123.ngrok.io/webhook
```

---

### Step 2: Access Webhooks Page

1. Navigate to **Dashboard → Settings → Webhooks**
   - URL: `http://localhost:3000/dashboard/settings/webhooks`

**Expected:** Webhooks page with empty state or existing webhooks

---

### Step 3: Create Your First Webhook

1. Click **"Create Webhook"** button
2. Form appears below
3. Enter your webhook URL:
   - webhook.site: `https://webhook.site/your-unique-id`
   - ngrok: `https://abc123.ngrok.io/webhook`
4. Select events by checking boxes:
   - ☑️ Podcast Created
   - ☑️ Podcast Processing
   - ☑️ Podcast Completed
   - ☑️ Podcast Failed
5. Click **"Create"**

**Expected:**
- Toast notification: "Webhook created successfully"
- New webhook card appears showing:
  - URL: Your webhook URL
  - Badge: "Active" (green)
  - Events: 4 event badges
  - Created timestamp

---

### Step 4: Send Test Event

1. Find your webhook in the list
2. Click the **Send** icon (paper plane)
3. Wait a moment

**Expected:**
- Toast notification: "Test event sent successfully"

**Check webhook.site or ngrok:**
- You should see a POST request
- Event type: `PODCAST_CREATED`
- Payload example:
```json
{
  "event": "PODCAST_CREATED",
  "data": {
    "id": "test_podcast_id",
    "title": "Test Podcast",
    "status": "COMPLETED",
    "createdAt": "2026-01-21T..."
  },
  "timestamp": "2026-01-21T..."
}
```

---

### Step 5: Create a Real Podcast to Trigger Webhooks

1. Go to **Dashboard → Podcasts → New Podcast**
2. Fill in the form:
   - Content: "Testing webhooks with a real podcast about space exploration"
   - Duration: SHORT
   - Voices: Any
3. Click **"Generate Podcast"**

**Expected Webhook Sequence:**

**Webhook 1 - PODCAST_PROCESSING** (within seconds):
```json
{
  "podcastId": "clx...",
  "status": "PROCESSING",
  "progress": 0,
  "timestamp": "2026-01-21T..."
}
```

**Webhook 2 - PODCAST_COMPLETED** (after 2-3 minutes):
```json
{
  "podcastId": "clx...",
  "status": "COMPLETED",
  "audioUrl": "https://...",
  "audioDuration": 5,
  "timestamp": "2026-01-21T..."
}
```

**Check your webhook receiver:**
- webhook.site: Scroll down to see all requests
- ngrok: Check terminal output
- You should see 2 POST requests

---

### Step 6: Verify Webhook Headers

In webhook.site or ngrok logs, check the headers:

```
Content-Type: application/json
X-Webhook-Signature: a1b2c3d4e5f6...
X-Webhook-Timestamp: 1705838100000
X-Webhook-Event: PODCAST_COMPLETED
```

**Verify:**
- ✅ All headers present
- ✅ Signature is a hex string
- ✅ Timestamp is a number
- ✅ Event matches the payload

---

### Step 7: Test Webhook Toggle (Enable/Disable)

1. Go back to Webhooks page
2. Find your webhook
3. Click **"Disable"** button
4. Badge should change to "Inactive" (gray)
5. Create another podcast
6. Wait for completion

**Expected:**
- No webhooks received while inactive
- Delivery count doesn't increase

7. Click **"Enable"** button
8. Badge changes back to "Active" (green)

---

### Step 8: Create Multiple Webhooks

1. Click **"Create Webhook"** again
2. Enter a different URL (or same for testing)
3. Select only **Podcast Completed** event
4. Click **"Create"**

**Expected:**
- 2 webhooks in the list
- First webhook: 4 events
- Second webhook: 1 event

---

### Step 9: Test Event Filtering

1. Create a new podcast
2. Watch webhook.site/ngrok

**Expected:**
- First webhook receives: PROCESSING + COMPLETED (2 requests)
- Second webhook receives: COMPLETED only (1 request)

---

### Step 10: Delete a Webhook

1. Find the second webhook
2. Click the **Trash** icon
3. Confirmation dialog appears
4. Click **"Delete"**

**Expected:**
- Toast notification: "Webhook deleted successfully"
- Webhook disappears from list
- Only first webhook remains

---

## 🎯 Success Criteria Checklist

### API Keys ✅
- [ ] Can create API key
- [ ] Key is shown only once
- [ ] Can copy key to clipboard
- [ ] Can list all keys
- [ ] Can authenticate with API key
- [ ] Last used timestamp updates
- [ ] Can revoke key
- [ ] Revoked key returns 401 error

### Webhooks ✅
- [ ] Can create webhook
- [ ] Can select multiple events
- [ ] Test button sends event
- [ ] Real podcasts trigger webhooks
- [ ] Correct event types received
- [ ] Headers include signature
- [ ] Can toggle active/inactive
- [ ] Inactive webhooks don't receive events
- [ ] Event filtering works
- [ ] Can delete webhook
- [ ] Delivery count increments

---

## 🐛 Troubleshooting

### API Keys Not Working

**Problem:** 401 Unauthorized error

**Solutions:**
1. Check API key is correct (no extra spaces)
2. Verify header format: `Authorization: Bearer pk_live_...`
3. Check backend logs for errors
4. Ensure backend is running on port 3001

---

### Webhooks Not Received

**Problem:** No webhooks arriving

**Solutions:**
1. Check webhook is "Active" (green badge)
2. Verify URL is correct and accessible
3. Check backend logs for delivery attempts
4. Test with webhook.site first
5. Ensure events are selected
6. Check firewall/network settings

**Check Backend Logs:**
```bash
# In the backend terminal, you should see:
📨 Webhook received: PODCAST_COMPLETED
✅ Delivery succeeded: 200
```

---

### Webhook Signature Verification Fails

**Problem:** Signature mismatch

**Solutions:**
1. Ensure you're using the correct secret
2. Verify payload is stringified correctly
3. Check HMAC algorithm is SHA256
4. Compare expected vs actual signature

---

## 📝 Quick Test Script

Save this as `test-api-keys.sh`:

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧪 Testing PodNex API Keys & Webhooks"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing API health..."
HEALTH=$(curl -s http://localhost:3001/api/health)
if echo $HEALTH | grep -q "success"; then
  echo -e "${GREEN}✅ API is running${NC}"
else
  echo -e "${RED}❌ API is not running${NC}"
  exit 1
fi

# Test 2: API Key (replace with your key)
echo ""
echo "2️⃣ Testing API key authentication..."
read -p "Enter your API key: " API_KEY

RESULT=$(curl -s http://localhost:3001/api/v1/podcasts \
  -H "Authorization: Bearer $API_KEY")

if echo $RESULT | grep -q "success"; then
  echo -e "${GREEN}✅ API key works${NC}"
else
  echo -e "${RED}❌ API key failed${NC}"
  echo $RESULT
fi

echo ""
echo "✅ Tests complete!"
```

Run it:
```bash
chmod +x test-api-keys.sh
./test-api-keys.sh
```

---

## 🎓 Next Steps

After successful testing:

1. **Production Setup:**
   - Create production API keys
   - Set up production webhook endpoints
   - Configure proper HTTPS URLs
   - Store secrets securely

2. **Integration:**
   - Integrate API keys into your application
   - Set up webhook handlers
   - Implement signature verification
   - Add error handling

3. **Monitoring:**
   - Track API key usage
   - Monitor webhook delivery rates
   - Set up alerts for failures
   - Review delivery logs

---

**Testing Complete!** 🎉

You've successfully tested both API Keys and Webhooks. Your PodNex advanced features are working correctly!

**Created:** January 21, 2026
