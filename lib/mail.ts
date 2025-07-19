import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXTAUTH_URL;

export const sendPasswordResetEmail = async (
    email: string,
    token: string
) => {
    const resetLink = `${baseUrl}/new-password?token=${token}`;

    await resend.emails.send({
        // from: "onboarding@resend.dev", // development
        from: "no-reply@ngopslah.web.id",
        to: email,
        subject: "Reset Password",
        html: `<p>Klick <a href="${resetLink}">Dsini</a> untuk reset password </p>`
    })
}

// Email verification account
export const sendVerificationEmail = async (
    email: string,
    token: string
) => {
    const confirmLink = `${baseUrl}/new-verification?token=${token}`;

    await resend.emails.send({
        // from: "onboarding@resend.dev", // development
        from: "no-reply@ngopslah.web.id",
        to: email,
        subject: "Konfirmasi email",
        html: `<p>Klick <a href="${confirmLink}">Dsini</a> untuk verifikasi akun </p>`
    })
}

// Notification created campaign
export const sendCampaignNotification = async (
    email: string,
) => {
    await resend.emails.send({
        from: "no-reply@ngopslah.web.id",
        to: email,
        subject: "Konfirmasi email",
        html: `<p>Campaign dengan ${email} Berhsail dibuat </p>`
    })
}