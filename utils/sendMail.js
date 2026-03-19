const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const createEmailTemplate = (content, title = "SkillMentorX") => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.7;
          color: #2d3748;
          background: #f7fafc;
          padding: 30px 0;
        }
        
        .email-container {
          max-width: 620px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
          border: 1px solid #e2e8f0;
        }
        
        .header {
          background: #ffffff;
          padding: 50px 40px 30px;
          text-align: center;
          border-bottom: 3px solid #4299e1;
          position: relative;
        }
        
        .header::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #4299e1, #9f7aea);
          border-radius: 2px;
        }
        
        .logo {
          font-size: 36px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 8px;
          letter-spacing: -1px;
        }
        
        .logo-accent {
          color: #4299e1;
        }
        
        .tagline {
          font-size: 16px;
          color: #718096;
          font-weight: 400;
          margin-top: 5px;
        }
        
        .content {
          padding: 50px 40px;
          background: #ffffff;
        }
        
        .content h1 {
          color: #1a202c;
          font-size: 32px;
          margin-bottom: 25px;
          font-weight: 600;
          line-height: 1.3;
        }
        
        .content p {
          color: #4a5568;
          font-size: 18px;
          margin-bottom: 20px;
          line-height: 1.8;
        }
        
        .footer {
          background: #f7fafc;
          padding: 40px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer-logo {
          font-size: 20px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 20px;
        }
        
        .footer p {
          color: #718096;
          font-size: 15px;
          margin: 12px 0;
        }
        
        .social-links {
          margin: 25px 0;
          display: flex;
          justify-content: center;
          gap: 25px;
        }
        
        .social-links a {
          color: #4299e1;
          text-decoration: none;
          font-weight: 500;
          padding: 10px 20px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          transition: all 0.3s ease;
        }
        
        .social-links a:hover {
          background: #ebf8ff;
          border-color: #4299e1;
          transform: translateY(-2px);
        }
        
        @media (max-width: 640px) {
          .email-container {
            margin: 15px;
            border-radius: 12px;
          }
          
          .header, .content, .footer {
            padding: 30px 25px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">Skill<span class="logo-accent">Mentor</span>X</div>
          <div class="tagline">Master the Art of Development</div>
        </div>
        
        <div class="content">
          ${content}
        </div>
        
        <div class="footer">
          <div class="footer-logo">SkillMentorX</div>
          <p>Created by skillmentorx</p>
          <div class="social-links">
            <a href="#">Learn</a>
            <a href="#">Practice</a>
            <a href="#">Community</a>
            <a href="#">Support</a>
          </div>
          <p style="font-size: 13px; color: #a0aec0;">
            © 2024 SkillMentorX. Empowering developers worldwide.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const brevoKey = process.env.BREVO_API_KEY?.replace(/^["']|["']$/g, "");
    
    if (!brevoKey) {
      console.error("CRITICAL: BREVO_API_KEY is missing in environment variables!");
      throw new Error("Email service not configured. Please add BREVO_API_KEY to Render.");
    }

    const maskedKey = brevoKey.substring(0, 5) + "..." + brevoKey.substring(brevoKey.length - 5);
    console.log(`Diagnostic: Sending via Brevo (Key: ${maskedKey})`);

    const styledHtml = createEmailTemplate(html, subject);

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "SkillMentorX",
          email: "edumentorai123@gmail.com",
        },
        to: [{ email: to }],
        subject: `[SkillMentorX] ${subject}`,
        htmlContent: styledHtml,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to send email via Brevo");
    }

    console.log(`Email sent successfully via Brevo. ID: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    throw error;
  }
};
