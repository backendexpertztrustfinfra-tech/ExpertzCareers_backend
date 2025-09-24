const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, text, html }) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Expertz Trust <hr@expertztrustfinfra.com>', // Free verified domain
            to: [to],
            subject: subject,
            text: text,
            html: html || `<p>${text}</p>`,
        });

        if (error) {
            console.error('❌ Resend error:', error);
            throw error;
        }

        console.log('✅ Email sent via Resend:', data.id);
        return data;
    } catch (error) {
        console.error('❌ Resend failed:', error);
        throw error;
    }
}

module.exports = { sendEmail };
