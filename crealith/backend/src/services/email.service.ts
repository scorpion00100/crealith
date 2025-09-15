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

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    } catch (error) {
      console.error('Erreur envoi email:', error);
      throw createError.internal('Erreur lors de l\'envoi de l\'email');
    }
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎨 Crealith</h1>
            <p>Vérification de votre email</p>
          </div>
          <div class="content">
            <h2>Bonjour ${firstName} !</h2>
            <p>Merci de vous être inscrit sur Crealith. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
            <a href="${verificationUrl}" class="button">Vérifier mon email</a>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
            <p><strong>Ce lien expire dans 24 heures.</strong></p>
            <p>Si vous n'avez pas créé de compte sur Crealith, vous pouvez ignorer cet email.</p>
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
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Réinitialisation de votre mot de passe - Crealith</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ec4899; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Crealith</h1>
            <p>Réinitialisation de votre mot de passe</p>
          </div>
          <div class="content">
            <h2>Bonjour ${firstName} !</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            <div class="warning">
              <p><strong>⚠️ Important :</strong></p>
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
