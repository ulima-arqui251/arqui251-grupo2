import nodemailer from 'nodemailer';

// Configurar transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * RF-02: Enviar correo de verificación de email
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
  
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@studymate.com',
    to: email,
    subject: 'StudyMate - Verifica tu correo electrónico',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb;">¡Bienvenido a StudyMate!</h2>
        <p>Gracias por registrarte. Para completar tu registro, por favor verifica tu correo electrónico.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verificar Email
          </a>
        </div>
        <p><strong>Importante:</strong> Este enlace expira en 24 horas.</p>
        <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
        <p style="color: #6b7280; word-break: break-all;">${verificationUrl}</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Si no te registraste en StudyMate, puedes ignorar este correo.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Correo de verificación enviado a: ${email}`);
  } catch (error) {
    console.error('Error enviando correo de verificación:', error);
    throw new Error('No se pudo enviar el correo de verificación');
  }
}

/**
 * RF-04: Enviar correo de recuperación de contraseña
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
  
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@studymate.com',
    to: email,
    subject: 'StudyMate - Recuperación de Contraseña',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #dc2626;">Recuperación de Contraseña</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta StudyMate.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        <p><strong>Importante:</strong> Este enlace expira en 1 hora por seguridad.</p>
        <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
        <p style="color: #6b7280; word-break: break-all;">${resetUrl}</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no será cambiada.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Correo de recuperación enviado a: ${email}`);
  } catch (error) {
    console.error('Error enviando correo de recuperación:', error);
    throw new Error('No se pudo enviar el correo de recuperación');
  }
}

/**
 * Verificar configuración del servicio de email
 */
export async function verifyEmailService(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ Servicio de email configurado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en configuración de email:', error);
    return false;
  }
}
