import { Elysia, t } from 'elysia';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET;

const app = new Elysia({ prefix: '/api' })
	.post('/resend', async ({ body }) => {
		const template = {
			subject: 'New contact form submission',
			html: `
				<h1>New contact form submission</h1>
				<p>Someone has submitted the contact form on your website.</p>
				<h2>Details</h2>
				<p>Submitted at: ${new Date().toISOString()}</p>
				<h2>Form data</h2>
				<p>Name: ${body.name}</p>
				<p>Email: ${body.email}</p>
				<p>Message:<br>${body.message}</p>
			`,
		};
		await resend.emails.send({
			from: 'koyu\'s personal website <no-reply@notifications.koyu.space>',
			to: ['me@koyu.space'],
			...template,
		});
		return { success: true };
	}, {
		body: t.Object({
			name: t.String(),
			email: t.String(),
			message: t.String()
		})
	})
	.post('/revalidate', async ({ body, query, set }) => {
		// Sanity webhook endpoint for automatic redeployment
		// When content is published in Sanity, this endpoint:
		// 1. Verifies the secret token
		// 2. Triggers a Vercel deployment via deploy hook
		// 3. Site rebuilds with fresh content (~30-60 seconds)
		
		// Verify the request is from Sanity (optional but recommended)
		const secret = query.secret;
		if (REVALIDATE_SECRET && secret !== REVALIDATE_SECRET) {
			set.status = 401;
			return { error: 'Invalid secret' };
		}

		try {
			// Log the webhook payload for debugging
			console.log('Revalidate webhook received:', {
				type: body._type,
				id: body._id,
				slug: body.slug?.current
			});

			// Trigger a Vercel deployment via deploy hook
			const VERCEL_DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK;
			
			if (VERCEL_DEPLOY_HOOK) {
				try {
					const deployResponse = await fetch(VERCEL_DEPLOY_HOOK, {
						method: 'POST',
					});
					
					if (deployResponse.ok) {
						const deployData = await deployResponse.json();
						console.log('Vercel deployment triggered:', deployData);
						
						return {
							revalidated: true,
							now: Date.now(),
							message: 'Deployment triggered successfully',
							deploymentId: deployData.job?.id
						};
					} else {
						console.error('Failed to trigger deployment:', deployResponse.status);
					}
				} catch (deployError) {
					console.error('Error triggering deployment:', deployError);
				}
			}

			// Fallback: Just log the event
			return {
				revalidated: true,
				now: Date.now(),
				message: 'Webhook received. Set VERCEL_DEPLOY_HOOK to enable automatic deployments.'
			};
		} catch (err) {
			console.error('Error processing revalidate webhook:', err);
			set.status = 500;
			return { error: 'Failed to revalidate' };
		}
	}, {
		body: t.Object({
			_type: t.Optional(t.String()),
			_id: t.Optional(t.String()),
			slug: t.Optional(t.Object({
				current: t.Optional(t.String())
			}))
		})
	});

interface WithRequest {
	request: Request;
}

export const fallback = ({ request }: WithRequest) => app.handle(request);

export type App = typeof app;