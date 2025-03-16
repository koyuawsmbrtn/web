import type { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend';

type ResponseData = {
    message: string
}

const resend = new Resend(process.env.RESEND_KEY);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    await resend.emails.send({
        from: 'koyu\'s personal website <no-reply@notifications.koyu.space>',
        to: 'me@koyu.space',
        subject: 'New contact form submission',
        text: req.body.message,
    });
    res.status(200).json({ message: 'Email sent' });
}