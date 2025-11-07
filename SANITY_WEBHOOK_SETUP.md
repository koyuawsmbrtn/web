# Sanity Webhook Setup for Instant Updates

## Changes Made

To fix the delayed updates from Sanity, the following changes were made:

1. **Disabled Sanity CDN** (`useCdn: false`) in both client and server configurations
2. **Reduced cache durations** from 5-60 minutes to 1-5 minutes
3. **Shortened HTTP cache headers** from 5-10 minutes to 1-2 minutes
4. **Created webhook endpoint** at `/api/revalidate` for cache purging

## Setting Up Sanity Webhooks (Optional but Recommended)

To trigger instant cache purging when you publish content in Sanity Studio:

### 1. Generate a Secret Token

```bash
# Generate a random secret
openssl rand -base64 32
```

### 2. Add to Vercel Environment Variables

Go to your Vercel project settings and add:
- **Variable Name**: `SANITY_REVALIDATE_SECRET`
- **Value**: [your generated secret]

### 3. Configure Sanity Webhook

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

### 4. Test the Webhook

After setup, when you:
1. Edit content in Sanity Studio
2. Click **Publish**
3. Your site should update within 1-2 minutes (cache expiry time)

## Without Webhook Setup

Even without webhooks, changes will now appear much faster:
- **Before**: 5-10 minutes (or manual redeploy needed)
- **After**: 1-2 minutes (browser cache expiry)

## Performance Considerations

Disabling the CDN means:
- ✅ Instant updates (data is always fresh)
- ⚠️ Slightly slower response times (queries hit Sanity's API directly)
- ⚠️ More API requests (each page load queries Sanity)

For most use cases, this is acceptable. If performance becomes an issue, consider:
- Re-enabling CDN and using webhooks with cache purging
- Implementing ISR (Incremental Static Regeneration) with SvelteKit adapter-vercel
- Using SvelteKit's built-in cache with shorter TTLs

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
