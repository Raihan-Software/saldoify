import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

const resend = new Resend(env.RESEND_API_KEY || 'dummy_key');

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
	try {
		const { data, error } = await resend.emails.send({
			from: 'Saldoify <noreply@saldoify.com>',
			to: email,
			subject: 'Reset your password',
			html: `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<title>Reset your password</title>
				</head>
				<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background-color: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
						<h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Reset your password</h1>
						
						<p style="color: #4b5563; margin: 0 0 20px 0;">
							You recently requested to reset your password for your Saldoify account. Click the button below to reset it.
						</p>
						
						<a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
							Reset Password
						</a>
						
						<p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
							If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.
						</p>
					</div>
					
					<div style="text-align: center; color: #9ca3af; font-size: 12px;">
						<p style="margin: 0;">
							If the button doesn't work, copy and paste this link into your browser:
						</p>
						<p style="margin: 5px 0 0 0; word-break: break-all;">
							${resetUrl}
						</p>
					</div>
				</body>
				</html>
			`
		});

		if (error) {
			console.error('Failed to send password reset email:', error);
			return { success: false, error };
		}

		return { success: true, data };
	} catch (error) {
		console.error('Error sending password reset email:', error);
		return { success: false, error };
	}
}