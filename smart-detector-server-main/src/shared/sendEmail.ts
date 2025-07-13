import nodemailer from 'nodemailer';
import config from '../config';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: config.email_host,
  port: 465,
  secure: true,
  auth: {
    user: config.email_user,
    pass: config.email_password,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Function to send email
const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  attachments: any[]
) => {
  try {
    // Process attachments if provided to add Content-ID for images
    const processedAttachments = attachments.map((attachment) => {
      if (attachment.path && 
          (attachment.path.endsWith('.jpg') || 
           attachment.path.endsWith('.jpeg') || 
           attachment.path.endsWith('.png') || 
           attachment.path.endsWith('.gif'))) {
        
        // Extract filename to use as Content-ID
        const filename = attachment.filename || 
                        (attachment.path.split('\\').pop() || 
                         attachment.path.split('/').pop() || 
                         'post-image');
        
        return {
          ...attachment,
          cid: filename, // Use the filename as the Content-ID
        };
      }
      return attachment;
    });

    // Prepare email options
    const mailOptions: nodemailer.SendMailOptions = {
      from: `${config.email_userName} <${config.email_user}>`,
      to: to,
      subject: subject,
      html: html,
      attachments: processedAttachments,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent: %s', info.messageId);
  } catch (error) {
    logger.error('Error sending email: ', error);
  }
};

export default sendEmail;
