# Quick Setup Guide for Sanity Auto-Redeployment

## 🚀 5-Minute Setup

### 1. Generate Secret
```bash
openssl rand -base64 32
```
Save this value!

### 2. Create Vercel Deploy Hook
1. Go to: https://vercel.com/[your-project]/settings/git
2. Scroll to **Deploy Hooks**
3. Create new hook for `main` branch
4. Copy the URL

### 3. Add Environment Variables in Vercel
```
SANITY_REVALIDATE_SECRET = [paste secret from step 1]
VERCEL_DEPLOY_HOOK = [paste URL from step 2]
```

### 4. Configure Sanity Webhook
1. Go to: https://sanity.io/manage/[your-project]/api/webhooks
2. Create webhook:
   - URL: `https://leonie.lgbt/api/revalidate?secret=[your-secret]`
   - Method: POST
   - Trigger: Create, Update, Delete
   - Dataset: production

### 5. Redeploy Your Site
Redeploy on Vercel to apply the environment variables.

## ✅ Testing

1. Make a change in Sanity Studio
2. Click **Publish**
3. Check Vercel deployments page - you should see a new deployment start
4. Wait ~60 seconds for deployment to complete
5. Refresh your site - changes should be live!

## 📊 What's Changed

| Before | After |
|--------|-------|
| Manual redeploy needed | Automatic on publish |
| 5-10 min delay | ~60 sec (deployment time) |
| CDN enabled | CDN disabled for fresh data |
| Cache: 5-10 min | Cache: 1-2 min |

## 🔍 Troubleshooting

**Webhook not firing?**
- Check webhook URL and secret are correct
- View webhook logs in Sanity dashboard
- Check Vercel deployment logs

**Still see old content?**
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Check deployment completed successfully
- Wait for full 60 seconds

**Too many deployments?**
- Each Sanity publish triggers a deployment
- Consider batching changes if doing multiple edits
- Draft changes don't trigger webhooks (only publish does)
