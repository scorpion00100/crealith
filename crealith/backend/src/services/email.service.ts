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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification de votre email - Crealith</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #1F2937; 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            margin: 0;
            padding: 20px;
          }
          
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
          }
          
          .header { 
            background: linear-gradient(135deg, #6366F1 0%, #EC4899 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          
          .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 8px 0;
            letter-spacing: -0.025em;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
            font-weight: 400;
          }
          
          .content { 
            padding: 40px 30px; 
            color: #374151;
          }
          
          .content h2 {
            font-size: 24px;
            font-weight: 600;
            color: #1F2937;
            margin: 0 0 16px 0;
            letter-spacing: -0.025em;
          }
          
          .content p {
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 16px 0;
            color: #4B5563;
          }
          
          .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #6366F1 0%, #5B5BD6 100%);
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 12px; 
            margin: 24px 0; 
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.3);
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;
          }
          
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px 0 rgba(99, 102, 241, 0.4);
          }
          
          .footer { 
            text-align: center; 
            padding: 30px;
            background: #F9FAFB;
            border-top: 1px solid #E5E7EB;
            color: #6B7280; 
            font-size: 14px; 
          }
          
          .success { 
            background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
            border: 1px solid #10B981;
            padding: 20px; 
            border-radius: 12px; 
            margin: 24px 0; 
            color: #065F46;
          }
          
          .success p {
            margin: 0 0 12px 0;
            font-weight: 600;
            color: #065F46;
          }
          
          .muted { 
            color: #6B7280; 
            font-size: 14px;
          }
          
          .code { 
            word-break: break-all; 
            background: #F3F4F6; 
            color: #1F2937; 
            padding: 12px; 
            border-radius: 8px; 
            border: 1px solid #D1D5DB;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
            margin: 16px 0;
          }
          
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #E5E7EB, transparent);
            margin: 24px 0;
          }
          
          @media (max-width: 600px) {
            body { padding: 10px; }
            .header { padding: 30px 20px; }
            .content { padding: 30px 20px; }
            .footer { padding: 20px; }
            .header h1 { font-size: 28px; }
            .content h2 { font-size: 20px; }
          }
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
            <p>Merci de vous être inscrit sur Crealith. Pour activer votre compte et commencer à explorer notre plateforme, veuillez cliquer sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Vérifier mon email</a>
            </div>
            
            <div class="divider"></div>
            
            <p class="muted">Ou copiez et collez ce lien dans votre navigateur :</p>
            <div class="code">${verificationUrl}</div>
            
            <div class="success">
              <p>✅ Bienvenue sur Crealith !</p>
              <p>Une fois votre email vérifié, vous pourrez :</p>
              <ul style="margin: 0; padding-left: 20px; color: #065F46;">
                <li>Accéder à tous nos templates et ressources</li>
                <li>Créer et vendre vos propres créations</li>
                <li>Rejoindre notre communauté créative</li>
              </ul>
            </div>
            
            <p><strong>Ce lien expire dans 24 heures.</strong></p>
            <p class="muted">Si vous n'avez pas créé de compte sur Crealith, vous pouvez ignorer cet email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Crealith. Tous droits réservés.</p>
            <p style="margin-top: 8px; font-size: 12px; color: #9CA3AF;">
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Bonjour ${firstName} !
      
      Merci de vous être inscrit sur Crealith. Pour activer votre compte et commencer à explorer notre plateforme, veuillez cliquer sur ce lien :
      ${verificationUrl}
      
      Une fois votre email vérifié, vous pourrez :
      - Accéder à tous nos templates et ressources
      - Créer et vendre vos propres créations
      - Rejoindre notre communauté créative
      
      Ce lien expire dans 24 heures.
      
      Si vous n'avez pas créé de compte sur Crealith, vous pouvez ignorer cet email.
      
      © 2025 Crealith. Tous droits réservés.
      
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de votre mot de passe - Crealith</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, Arial, sans-serif; background: #F9FAFB; margin: 0; padding: 16px; color: #111827; }
          .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; }
          .header { padding: 24px; border-bottom: 1px solid #E5E7EB; }
          .brand { display: inline-flex; align-items: center; gap: 10px; }
          .brand-badge { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #6366F1 0%, #EC4899 100%); color: #FFF; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; }
          .brand-name { font-size: 18px; font-weight: 800; color: #111827; letter-spacing: -0.02em; }
          .content { padding: 24px; }
          h1 { font-size: 22px; margin: 0 0 12px 0; }
          p { font-size: 15px; margin: 0 0 12px 0; color: #374151; }
          .button { display: inline-block; margin: 16px 0; background: #6366F1; color: #FFF; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; }
          .link { word-break: break-all; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size: 12px; background: #F3F4F6; color: #111827; padding: 10px; border-radius: 8px; border: 1px solid #E5E7EB; }
          .footer { padding: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 12px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">
              <div class="brand-badge">C</div>
              <div class="brand-name">Crealith</div>
            </div>
          </div>
          <div class="content">
            <h1>Réinitialiser votre mot de passe</h1>
            <p>Bonjour ${firstName},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci‑dessous pour créer un nouveau mot de passe sécurisé.</p>
            <p style="text-align:center;">
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </p>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p class="link">${resetUrl}</p>
            <p style="color:#6B7280; font-size:13px;">Ce lien expirera dans 30 minutes. Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.</p>
          </div>
          <div class="footer">
            © 2025 Crealith — Email automatique, ne pas répondre.
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Bonjour ${firstName} !
      
      Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur ce lien pour créer un nouveau mot de passe sécurisé :
      ${resetUrl}
      
      IMPORTANT :
      - Ce lien expire dans 30 minutes pour votre sécurité
      - Si vous n'avez pas demandé cette réinitialisation, ignorez cet email
      - Votre mot de passe actuel reste valide jusqu'à ce que vous le changiez
      - Pour votre sécurité, nous vous déconnecterons de tous vos appareils
      
      © 2025 Crealith. Tous droits réservés.
      
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
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
