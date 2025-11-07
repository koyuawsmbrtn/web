# Sanity Webhook Setup for Instant Updates

## Changes Made

To fix the delayed updates from Sanity, the following changes were made:

1. **Disabled Sanity CDN** (`useCdn: false`) in both client and server configurations
2. **Reduced cache durations** from 5-60 minutes to 1-5 minutes
3. **Shortened HTTP cache headers** from 5-10 minutes to 1-2 minutes
4. **Created webhook endpoint** at `/api/revalidate` (integrated into Elysia server)

## Setting Up Sanity Webhooks (Optional but Recommended)

To trigger instant cache purging when you publish content in Sanity Studio:

### 1. Generate a Secret Token

```bash
# Generate a random secret
openssl rand -base64 32
```

### 2. Create a Vercel Deploy Hook

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Git** → **Deploy Hooks**
3. Click **Create Hook**
   - **Name**: Sanity Webhook Revalidation
   - **Branch**: main (or your production branch)
4. Copy the generated webhook URL (e.g., `https://api.vercel.com/v1/integrations/deploy/...`)

### 3. Add Environment Variables to Vercel

Go to your Vercel project settings and add:
- **Variable Name**: `SANITY_REVALIDATE_SECRET`
  - **Value**: [your generated secret from step 1]
- **Variable Name**: `VERCEL_DEPLOY_HOOK`
  - **Value**: [the deploy hook URL from step 2]

Make sure to add these for **Production** environment (and Preview/Development if desired).

### 4. Configure Sanity Webhook

1. Go to https://sanity.io/manage
2. Select your project
3. Navigate to **API** → **Webhooks**
4. Click **Create webhook**
5. Configure:
   - **Name**: Vercel Revalidation
   - **URL**: `https://leonie.lgbt/api/revalidate?secret=[your-secret]`
   - **Dataset**: `production` (or your dataset name)
   - **Trigger on**: Create, Update, Delete
   - **Filter**: Leave empty to revalidate on all changes, or add GROQ filter like:
     ```groq
     _type in ["page", "post", "home", "settings"]
     ```
   - **HTTP Method**: POST
   - **API Version**: v2021-06-07 or later

6. Save the webhook

### 5. Test the Webhook

After setup, when you:
1. Edit content in Sanity Studio
2. Click **Publish**
3. Your site will automatically redeploy on Vercel (takes 30-60 seconds)
4. Changes will be live as soon as the deployment completes

## How It Works

When you publish content in Sanity:
1. Sanity sends a webhook to `/api/revalidate`
2. The endpoint verifies the secret token
3. It triggers a Vercel deployment using the deploy hook
4. Vercel rebuilds and redeploys your site (~30-60 seconds)
5. Changes are instantly visible once deployment completes

## Without Deploy Hook

If you don't set up the `VERCEL_DEPLOY_HOOK`:
- **Before**: 5-10 minutes (or manual redeploy needed)
- **After**: 1-2 minutes (browser cache expiry)
- With hook: ~60 seconds (full redeploy)

## Performance Considerations

### Option 1: Automatic Redeployment (Recommended)
With `VERCEL_DEPLOY_HOOK` configured:
- ✅ Always up-to-date content (~60 seconds after publish)
- ✅ No stale cache issues
- ⚠️ Each publish triggers a full rebuild
- ⚠️ Vercel build minutes usage (usually not an issue)

### Option 2: Cache-based Updates
Without `VERCEL_DEPLOY_HOOK`:
- ✅ No rebuild needed
- ✅ Lower resource usage
- ⚠️ Updates appear in 1-2 minutes (cache expiry)
- ⚠️ Slightly slower Sanity API responses (CDN disabled)

### Recommendations:
- **Content sites with frequent updates**: Use automatic redeployment
- **Low-traffic or rarely updated sites**: Use cache-based updates
- **High-traffic sites**: Consider re-enabling CDN with longer cache times and redeployment

## Troubleshooting

### Changes still not appearing?

1. **Clear your browser cache**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. **Check console logs**: Look for Sanity query logs in your dev console
3. **Verify webhook**: Check Sanity webhook logs for delivery status
4. **Redeploy**: After these changes, redeploy your site to Vercel

### Webhook not firing?

1. Check the webhook URL is correct
2. Verify the secret matches your environment variable
3. Check Sanity webhook delivery logs for errors
4. Test with a manual webhook trigger in Sanity dashboard
