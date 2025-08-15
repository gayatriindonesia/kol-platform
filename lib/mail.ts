import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXTAUTH_URL;

// Email template wrapper with modern styling
const createEmailTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
        }
        
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 8px;
            text-decoration: none;
        }
        
        .header-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .email-title {
            font-size: 24px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .email-content {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 30px 0;
        }
        
        .email-footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
            font-size: 14px;
            color: #718096;
            margin-bottom: 10px;
        }
        
        .footer-link {
            color: #667eea;
            text-decoration: none;
        }
        
        .security-note {
            background-color: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .security-text {
            font-size: 14px;
            color: #8b6914;
        }
        
        .success-badge {
            background-color: #d4edda;
            color: #155724;
            padding: 12px 20px;
            border-radius: 6px;
            display: inline-block;
            font-weight: 500;
            margin: 15px 0;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 20px;
                border-radius: 8px;
            }
            
            .email-header,
            .email-body,
            .email-footer {
                padding: 25px 20px;
            }
            
            .email-title {
                font-size: 20px;
            }
            
            .cta-button {
                padding: 14px 28px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <div class="logo">KOL Platform Gayatri Indonesia</div>
            <div class="header-subtitle">Platform Terpercaya</div>
        </div>
        
        <div class="email-body">
            ${content}
        </div>
        
        <div class="email-footer">
            <div class="footer-text">
                Email ini dikirim secara otomatis, mohon jangan membalas email ini.
            </div>
            <div class="footer-text">
                Jika Anda memiliki pertanyaan, silakan hubungi <a href="mailto:info@gayatriindoensia.com" class="footer-link">info@gayatriindoensia.com</a>
            </div>
            <div class="footer-text" style="margin-top: 20px; font-size: 12px;">
                &copy; 2025 Gayatri Indonesia. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
`;

// Password Reset Email Template
const createPasswordResetTemplate = (resetLink: string) => {
    const content = `
        <h1 class="email-title">🔐 Reset Password</h1>
        <div class="email-content">
            <p>Kami menerima permintaan untuk reset password akun Anda.</p>
            <p>Klik tombol di bawah ini untuk membuat password baru:</p>
        </div>
        
        <div class="button-container">
            <a href="${resetLink}" class="cta-button">Reset Password Saya</a>
        </div>
        
        <div class="divider"></div>
        
        <div class="security-note">
            <div class="security-text">
                <strong>Catatan Keamanan:</strong><br>
                • Link ini akan kedaluwarsa dalam 24 jam<br>
                • Jika Anda tidak meminta reset password, abaikan email ini<br>
                • Pastikan Anda membuat password yang kuat dan unik
            </div>
        </div>
        
        <div class="email-content" style="margin-top: 20px; font-size: 14px; color: #718096;">
            Atau copy dan paste link berikut ke browser Anda:<br>
            <a href="${resetLink}" style="word-break: break-all; color: #667eea;">${resetLink}</a>
        </div>
    `;
    
    return createEmailTemplate(content, "Reset Password - Gayatri Indonesia");
};

// Email Verification Template
const createVerificationTemplate = (confirmLink: string) => {
    const content = `
        <h1 class="email-title">✅ Verifikasi Email Anda</h1>
        <div class="email-content">
            <p>Selamat datang di Gayatri Indonesia!</p>
            <p>Untuk melengkapi pendaftaran akun Anda, silakan verifikasi alamat email ini dengan mengklik tombol di bawah:</p>
        </div>
        
        <div class="button-container">
            <a href="${confirmLink}" class="cta-button">Verifikasi Email Saya</a>
        </div>
        
        <div class="divider"></div>
        
        <div class="email-content">
            <p><strong>Mengapa perlu verifikasi?</strong></p>
            <p style="font-size: 14px; color: #718096;">
                Verifikasi email membantu kami memastikan keamanan akun Anda dan memberikan pengalaman terbaik di platform kami.
            </p>
        </div>
        
        <div class="email-content" style="margin-top: 20px; font-size: 14px; color: #718096;">
            Atau copy dan paste link berikut ke browser Anda:<br>
            <a href="${confirmLink}" style="word-break: break-all; color: #667eea;">${confirmLink}</a>
        </div>
    `;
    
    return createEmailTemplate(content, "Verifikasi Email - Gayatri Indoensia");
};

// Campaign Notification Template
const createCampaignNotificationTemplate = (email: string) => {
    const content = `
        <h1 class="email-title">🎉 Campaign Berhasil Dibuat!</h1>
        
        <div class="success-badge">
            Campaign Anda telah berhasil dibuat dan sedang diproses
        </div>
        
        <div class="email-content">
            <p>Halo!</p>
            <p>Kami dengan senang hati memberitahukan bahwa campaign dengan email <strong>${email}</strong> telah berhasil dibuat di sistem kami.</p>
        </div>
        
        <div class="divider"></div>
        
        <div class="email-content">
            <p><strong>Langkah Selanjutnya:</strong></p>
            <ul style="text-align: left; margin: 20px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Campaign Anda akan diproses dalam 24 jam</li>
                <li style="margin-bottom: 8px;">Anda akan menerima notifikasi email ketika campaign sudah aktif</li>
                <li style="margin-bottom: 8px;">Pantau performa campaign melalui dashboard</li>
            </ul>
        </div>
        
        <div class="button-container">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="cta-button">Lihat Dashboard</a>
        </div>
        
        <div class="email-content" style="margin-top: 30px; font-size: 14px; color: #718096;">
            <strong>Butuh bantuan?</strong><br>
            Tim support kami siap membantu Anda 24/7. Hubungi kami jika ada pertanyaan.
        </div>
    `;
    
    return createEmailTemplate(content, "Campaign Berhasil Dibuat - Gayatri Indonesia");
};

// Updated email functions with modern templates
export const sendPasswordResetEmail = async (
    email: string,
    token: string
) => {
    const resetLink = `${baseUrl}/new-password?token=${token}`;
    const htmlTemplate = createPasswordResetTemplate(resetLink);

    await resend.emails.send({
        from: "no-reply@ngopslah.web.id",
        to: email,
        subject: "🔐 Reset Password Anda - Gayatri",
        html: htmlTemplate
    });
};

export const sendVerificationEmail = async (
    email: string,
    token: string
) => {
    const confirmLink = `${baseUrl}/new-verification?token=${token}`;
    const htmlTemplate = createVerificationTemplate(confirmLink);

    await resend.emails.send({
        from: "no-reply@ngopslah.web.id",
        to: email,
        subject: "✅ Verifikasi Email Anda - Gayatri",
        html: htmlTemplate
    });
};

export const sendCampaignNotification = async (
    email: string,
) => {
    const htmlTemplate = createCampaignNotificationTemplate(email);

    await resend.emails.send({
        from: "no-reply@ngopslah.web.id",
        to: email,
        subject: "🎉 Campaign Berhasil Dibuat - Gayatri",
        html: htmlTemplate
    });
};