import nodemailer from 'nodemailer';
import { createError } from '../utils/errors';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private enabled: boolean = true;

  constructor() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const secure = process.env.SMTP_SECURE === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    this.enabled = !!(user && pass);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: this.enabled ? { user, pass } : undefined,
    });

    // Log non-sensitive SMTP configuration at startup
    try {
      console.info('[EMAIL] SMTP configuration loaded', {
        host,
        port,
        secure,
        hasUser: !!user,
        hasPass: !!pass,
        from: !!(process.env.SMTP_FROM || user)
      });
    } catch {}

    // Verify connection if credentials are present
    if (this.enabled && process.env.NODE_ENV !== 'test') {
      this.transporter.verify()
        .then(() => console.info('[EMAIL] SMTP transporter verified successfully'))
        .catch((err) => console.error('[EMAIL] SMTP transporter verification failed', { code: (err && err.code) || 'UNKNOWN', message: err?.message }));
    } else if (!this.enabled) {
      console.warn('[EMAIL] SMTP credentials missing. Emails will not be sent. In development, reset links are logged.');
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      return; // No-op en test
    }
    if (!this.enabled) {
      // In development, do not fail hard if SMTP is not configured.
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[EMAIL] sendEmail skipped: SMTP disabled (missing credentials).');
        return;
      }
      throw createError.internal("SMTP non configuré. Définissez SMTP_USER et SMTP_PASS.");
    }
    const attemptSend = async (retries: number, delayMs: number): Promise<void> => {
      try {
        await this.transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        });
      } catch (error) {
        if (retries > 0) {
          const nextDelay = Math.min(delayMs * 2, 15000);
          await new Promise(r => setTimeout(r, delayMs));
          return attemptSend(retries - 1, nextDelay);
        }
        console.error('Erreur envoi email:', error);
        throw createError.internal("Erreur lors de l'envoi de l'email");
      }
    };
    return attemptSend(2, 500);
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Vérification de votre email - Crealith</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #F9FAFB; background: #111827; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1F2937; color: #F9FAFB; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #1F2937; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #6366F1; color: #F9FAFB; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #9CA3AF; font-size: 14px; }
          .muted { color: #9CA3AF; }
          .code { word-break: break-all; background: #111827; color: #F9FAFB; padding: 10px; border-radius: 4px; border: 1px solid #374151; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Crealith</h1>
            <p>Vérification de votre email</p>
          </div>
          <div class="content">
            <h2>Bonjour ${firstName} !</h2>
            <p class="muted">Merci de vous être inscrit sur Crealith. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
            <a href="${verificationUrl}" class="button">Vérifier mon email</a>
            <p class="muted">Ou copiez ce lien dans votre navigateur :</p>
            <p class="code">${verificationUrl}</p>
            <p><strong>Ce lien expire dans 24 heures.</strong></p>
            <p class="muted">Si vous n'avez pas créé de compte sur Crealith, vous pouvez ignorer cet email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Crealith. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Bonjour ${firstName} !
      
      Merci de vous être inscrit sur Crealith. Pour activer votre compte, veuillez cliquer sur ce lien :
      ${verificationUrl}
      
      Ce lien expire dans 24 heures.
      
      Si vous n'avez pas créé de compte sur Crealith, vous pouvez ignorer cet email.
      
      © 2025 Crealith. Tous droits réservés.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Vérification de votre email - Crealith',
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    if (process.env.NODE_ENV !== 'production') {
      console.info('[DEV] Password reset URL:', resetUrl);
    }
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Réinitialisation de votre mot de passe - Crealith</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #F9FAFB; background: #111827; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1F2937; color: #F9FAFB; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #1F2937; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #6366F1; color: #F9FAFB; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #9CA3AF; font-size: 14px; }
          .warning { background: #111827; border: 1px solid #374151; padding: 15px; border-radius: 6px; margin: 20px 0; color: #F9FAFB; }
          .muted { color: #9CA3AF; }
          .code { word-break: break-all; background: #111827; color: #F9FAFB; padding: 10px; border-radius: 4px; border: 1px solid #374151; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Crealith</h1>
            <p>Réinitialisation de votre mot de passe</p>
          </div>
          <div class="content">
            <h2 style="margin:0 0 10px 0;">Bonjour ${firstName} !</h2>
            <p style="margin:0 0 10px 0; color:#F9FAFB;">Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            <p style="margin:10px 0; color:#F9FAFB;">Ou copiez ce lien dans votre navigateur :</p>
            <p class="code">${resetUrl}</p>
            <div class="warning">
              <p><strong>Important :</strong></p>
              <ul>
                <li>Ce lien expire dans 30 minutes</li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                <li>Votre mot de passe actuel reste valide jusqu'à ce que vous le changiez</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Crealith. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Bonjour ${firstName} !
      
      Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur ce lien pour créer un nouveau mot de passe :
      ${resetUrl}
      
      Ce lien expire dans 30 minutes.
      
      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
      Votre mot de passe actuel reste valide jusqu'à ce que vous le changiez.
      
      © 2025 Crealith. Tous droits réservés.
    `;

    await this.sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Crealith',
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
