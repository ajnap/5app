# Deployment Guide

This guide walks through deploying "The Next 5 Minutes" MVP to production.

## Pre-Deployment Checklist

- [ ] All environment variables documented
- [ ] Database migrations tested
- [ ] Stripe products created
- [ ] Email templates ready (if using)
- [ ] Error tracking configured (optional)
- [ ] Analytics setup (optional)

## Deployment Steps

### 1. Prepare Production Supabase Project

1. **Create Production Project**
   - Go to [Supabase](https://app.supabase.com)
   - Create new project (use paid tier for production)
   - Choose a strong database password
   - Select region closest to your users

2. **Run Database Migrations**
   ```bash
   # Copy SQL from supabase/migrations/001_initial_schema.sql
   # Run in Supabase SQL Editor
   ```

3. **Configure Auth Settings**
   - Enable Email provider
   - Set up custom SMTP (recommended for production)
   - Configure email templates
   - Set site URL to your production domain
   - Add production URL to redirect URLs

4. **Set Up Row Level Security**
   - Verify RLS policies are enabled
   - Test with a test user account

### 2. Configure Production Stripe

1. **Switch to Live Mode**
   - Toggle from Test Mode to Live Mode in Stripe Dashboard

2. **Create Production Products**
   - Create "Monthly Premium" product ($9.99/month)
   - Create "Annual Premium" product ($99/year)
   - Copy the live mode Price IDs

3. **Get Live API Keys**
   - Go to Developers > API Keys
   - Copy Publishable key (pk_live_xxx)
   - Copy Secret key (sk_live_xxx)
   - **Store secret key securely!**

### 3. Deploy to Vercel

1. **Connect GitHub Repository**
   ```bash
   # Push code to GitHub if not already done
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Import Project"
   - Select your repository
   - Configure project settings

3. **Add Environment Variables**

   Go to Project Settings > Environment Variables and add:

   ```env
   # Supabase Production
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_prod_service_role_key

   # Stripe Live Mode
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_PRICE_ID_MONTHLY=price_live_monthly_xxx
   STRIPE_PRICE_ID_YEARLY=price_live_yearly_xxx

   # Production App URL (update after first deploy)
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

   # Webhook secret (add after webhook setup)
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Copy your production URL (e.g., your-app.vercel.app)

5. **Update App URL**
   - Go back to Environment Variables
   - Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
   - Redeploy

### 4. Configure Production Webhooks

1. **Set Up Stripe Webhook**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Click "Add endpoint"
   - URL: `https://your-app.vercel.app/api/webhook`
   - Description: "Production subscription webhooks"
   - Version: Use latest API version

2. **Select Events**
   Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

3. **Copy Webhook Secret**
   - After creating endpoint, reveal signing secret
   - Copy the `whsec_xxx` value
   - Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
   - Redeploy app

4. **Test Webhook**
   - Stripe provides webhook testing UI
   - Send test events to verify webhook handling
   - Check Vercel logs for any errors

### 5. Configure Custom Domain (Optional)

1. **Purchase Domain**
   - Use Vercel Domains, Namecheap, GoDaddy, etc.

2. **Add to Vercel**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

3. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
   ```

4. **Update Supabase URLs**
   - Add custom domain to Supabase redirect URLs
   - Update site URL in auth settings

5. **Update Stripe Webhook**
   - Update webhook endpoint URL to use custom domain
   - `https://your-custom-domain.com/api/webhook`

### 6. Post-Deployment Testing

1. **Test User Signup**
   - Create new account
   - Verify email sent (if configured)
   - Check profile created in database

2. **Test Authentication**
   - Sign in/out
   - Try accessing protected routes
   - Verify redirect behavior

3. **Test Subscription Flow**
   - Go through checkout process with real card
   - Verify webhook received
   - Check subscription status updates
   - Test customer portal access

4. **Test Daily Prompts**
   - View dashboard
   - Verify prompts loading correctly
   - Test with different user states (free/premium)

5. **Monitor Logs**
   - Check Vercel Function logs
   - Monitor Stripe webhook logs
   - Watch for errors in Supabase logs

### 7. Set Up Monitoring (Recommended)

1. **Vercel Analytics**
   - Enable in Vercel dashboard (free)
   - Track page views and performance

2. **Error Tracking**
   - Set up Sentry or similar
   - Add to Next.js config
   - Test error reporting

3. **Uptime Monitoring**
   - Use UptimeRobot, Pingdom, etc.
   - Monitor key endpoints
   - Set up alerts

## Security Checklist

- [ ] All API keys stored as environment variables
- [ ] Service role key never exposed to client
- [ ] Webhook signatures verified
- [ ] RLS policies tested and enabled
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] CORS configured properly
- [ ] Rate limiting considered (via Vercel or middleware)

## Backup Strategy

1. **Database Backups**
   - Supabase Pro includes daily backups
   - Can download manual backups from dashboard
   - Consider automated backup scripts for critical data

2. **Code Backups**
   - GitHub serves as version control
   - Tag releases: `git tag -a v1.0.0 -m "Initial release"`

## Rollback Plan

If deployment fails:

1. **Revert Vercel Deployment**
   - Go to Deployments tab
   - Click on previous working deployment
   - Click "Promote to Production"

2. **Database Rollback**
   - Restore from Supabase backup
   - Or manually revert schema changes

3. **Environment Variables**
   - Keep copy of working env vars
   - Can quickly restore if needed

## Scaling Considerations

As your app grows:

1. **Database**
   - Upgrade Supabase tier for more connections
   - Add database indexes for common queries
   - Consider read replicas for high traffic

2. **Vercel**
   - Monitor function execution time
   - Upgrade plan if needed for more bandwidth
   - Consider edge functions for global performance

3. **Stripe**
   - Monitor webhook delivery
   - Consider adding retry logic
   - Use idempotency keys for critical operations

## Production Maintenance

Regular tasks:

- **Daily**: Monitor error logs and webhook failures
- **Weekly**: Check subscription metrics, review user feedback
- **Monthly**: Database backups, security updates, dependency updates
- **Quarterly**: Performance audit, cost analysis

## Troubleshooting

### Webhook Failures

```bash
# Check Stripe webhook logs
stripe logs tail --live

# Check Vercel function logs
vercel logs <deployment-url>
```

### Database Issues

- Use Supabase dashboard to run queries
- Check RLS policies aren't blocking operations
- Verify service role key for admin operations

### Authentication Problems

- Verify redirect URLs match exactly
- Check email provider configuration
- Test in incognito mode to rule out cache issues

## Cost Estimates

Monthly costs (estimated):

- Vercel Hobby: $0 (or Pro: $20/month)
- Supabase Pro: $25/month (includes better backups, support)
- Stripe: No monthly fee (2.9% + $0.30 per transaction)
- Domain: ~$12/year

For 100 paid users at $9.99/month:
- Revenue: $999/month
- Stripe fees: ~$32/month
- Infrastructure: ~$25-45/month
- Net: ~$920-940/month

## Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

## Launch Checklist

Before public launch:

- [ ] All features tested in production
- [ ] Payment flow tested with real card
- [ ] Email notifications working (if implemented)
- [ ] Error tracking configured
- [ ] Analytics setup
- [ ] Terms of Service added
- [ ] Privacy Policy added
- [ ] Support email configured
- [ ] Social media accounts created (optional)
- [ ] Landing page optimized for SEO
- [ ] Mobile responsiveness verified
- [ ] Performance optimized (Lighthouse score)

Congratulations on deploying your MVP! 🚀
