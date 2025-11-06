import { Elysia, t } from 'elysia';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

const app = new Elysia({ prefix: '/api' }).post('/resend', async ({ body }) => {
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
});

interface WithRequest {
	request: Request;
}

export const fallback = ({ request }: WithRequest) => app.handle(request);

export type App = typeof app;