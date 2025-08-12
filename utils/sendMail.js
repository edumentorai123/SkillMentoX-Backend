import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email template for SkillMentorX - Clean Minimalist Style
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
        
        .content h2 {
          color: #2d3748;
          font-size: 24px;
          margin: 35px 0 20px 0;
          font-weight: 600;
        }
        
        .content p {
          color: #4a5568;
          font-size: 18px;
          margin-bottom: 20px;
          line-height: 1.8;
        }
        
        .highlight-box {
          background: linear-gradient(135deg, #bee3f8 0%, #e9d8fd 100%);
          padding: 35px;
          border-radius: 12px;
          margin: 35px 0;
          text-align: center;
          border-left: 5px solid #4299e1;
        }
        
        .highlight-box h3 {
          color: #2d3748;
          font-size: 22px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        
        .highlight-box p {
          color: #4a5568;
          font-size: 16px;
          margin: 0;
        }
        
        .code-block {
          background: #f7fafc;
          color: #2d3748;
          padding: 25px;
          border-radius: 8px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 15px;
          margin: 30px 0;
          border: 1px solid #e2e8f0;
          border-left: 4px solid #4299e1;
          overflow-x: auto;
        }
        
        .btn {
          display: inline-block;
          background: #4299e1;
          color: #ffffff;
          padding: 18px 36px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 30px 0;
          font-size: 16px;
          box-shadow: 0 4px 14px rgba(66, 153, 225, 0.3);
          transition: all 0.3s ease;
        }
        
        .btn:hover {
          background: #3182ce;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(66, 153, 225, 0.4);
        }
        
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 20px;
          margin: 35px 0;
        }
        
        .skill-tag {
          background: #ffffff;
          color: #4a5568;
          padding: 15px 20px;
          border-radius: 8px;
          text-align: center;
          font-size: 15px;
          font-weight: 500;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
        }
        
        .skill-tag:hover {
          border-color: #4299e1;
          background: #ebf8ff;
          color: #2b6cb0;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(66, 153, 225, 0.15);
        }
        
        .stats-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
          margin: 40px 0;
          text-align: center;
        }
        
        .stat-item {
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
          border-top: 3px solid #4299e1;
        }
        
        .stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #4299e1;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #718096;
          font-weight: 500;
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
        
        .divider {
          height: 1px;
          background: #e2e8f0;
          margin: 35px 0;
          border: none;
        }
        
        .feature-list {
          list-style: none;
          margin: 25px 0;
        }
        
        .feature-list li {
          padding: 12px 0;
          padding-left: 30px;
          position: relative;
          color: #4a5568;
          font-size: 16px;
        }
        
        .feature-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #48bb78;
          font-weight: bold;
          font-size: 18px;
        }
        
        .quote-box {
          border-left: 4px solid #4299e1;
          padding: 25px 30px;
          margin: 30px 0;
          background: #f7fafc;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #4a5568;
          font-size: 18px;
        }
        
        @media (max-width: 640px) {
          .email-container {
            margin: 15px;
            border-radius: 12px;
          }
          
          .header, .content, .footer {
            padding: 30px 25px;
          }
          
          .content h1 {
            font-size: 28px;
          }
          
          .skills-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
          }
          
          .social-links {
            flex-wrap: wrap;
            gap: 15px;
          }
          
          .stats-section {
            grid-template-columns: 1fr;
            gap: 15px;
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
          <p>Building tomorrow's developers today</p>
          <div class="social-links">
            <a href="#">Learn</a>
            <a href="#">Practice</a>
            <a href="#">Community</a>
            <a href="#">Support</a>
          </div>
          <div class="divider"></div>
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
  // Wrap the content in SkillMentorX template
  const styledHtml = createEmailTemplate(html, subject);

  const info = await transporter.sendMail({
    from: "SkillMentorX" <$`{process.env.EMAIL_USER}`>
    to,
    subject: [SkillMentorX] `${subject}`,
    html: styledHtml,
  });
  return info;
};