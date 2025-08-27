import nodemailer from 'nodemailer';

export interface EmailData {
  to: string[];
  subject: string;
  summaryTitle: string;
  summaryContent: string;
  fileName: string;
  senderName?: string;
}

export async function sendSummaryEmail(emailData: EmailData) {
  try {
    if (!process.env.GMAIL_APP_PASSWORD) {
      throw new Error('GMAIL_APP_PASSWORD environment variable is not set');
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, 
      auth: {
        user: 'siyaagh44@gmail.com', 
        pass: process.env.GMAIL_APP_PASSWORD, // 16-char App Password
      },
    });

    // Prepare email options
    const mailOptions = {
      from: `"Minutes AI" <siyaagh44@gmail.com>`, 
      to: emailData.to.join(', '),
      subject: emailData.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${emailData.summaryTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f43f5e, #fb923c); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
            .content { background: #f9fafb; padding: 25px; border-radius: 10px; border-left: 4px solid #f43f5e; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
            .summary-content { white-space: pre-wrap; }
            .file-info { background: #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📄 AI Summary Shared</h1>
            <p>${emailData.summaryTitle}</p>
          </div>
          
          <div class="content">
            <div class="file-info">
              <strong>📎 Original File:</strong> ${emailData.fileName}
              ${emailData.senderName ? `<br><strong>👤 Shared by:</strong> ${emailData.senderName}` : ''}
            </div>
            
            <h2>📋 Summary Content:</h2>
            <div class="summary-content">${emailData.summaryContent}</div>
          </div>
          
          <div class="footer">
            <p>This summary was generated using Summarie AI</p>
            <p>Powered by advanced AI technology for document analysis</p>
          </div>
        </body>
        </html>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
} 