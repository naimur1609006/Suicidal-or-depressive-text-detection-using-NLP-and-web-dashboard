import config from '../../config';

type SuicidalPostTemplateProps = {
  friendName: string;
  postTitle: string;
  postContent: string;
  postId: string;
  userName: string;
  postImage?: string;
};

export const generateSuicidalPostEmailTemplate = ({
  friendName,
  postTitle,
  postContent,
  postId,
  userName,
  postImage,
}: SuicidalPostTemplateProps): string => {
  // Extract the image filename to use in the template
  const imageFilename = postImage
    ? postImage.split('\\').pop() || postImage.split('/').pop() || 'post-image'
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Concerning Post Alert</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.7;
          color: #444;
          max-width: 650px;
          margin: 0 auto;
          padding: 0;
          background-color: #f9f9fb;
        }
        .container {
          border-radius: 12px;
          padding: 35px;
          background-color: #ffffff;
          box-shadow: 0 5px 20px rgba(0,0,0,0.06);
          margin: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eef1f5;
        }
        .header h2 {
          color: #2c3e50;
          margin: 0;
          font-weight: 700;
          font-size: 24px;
          letter-spacing: -0.5px;
        }
        .alert {
          background-color: #fff8f8;
          border-left: 4px solid #ff5252;
          padding: 20px;
          margin-bottom: 28px;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(255,82,82,0.08);
        }
        .post-container {
          background-color: #f9fafb;
          padding: 25px;
          border-radius: 8px;
          margin: 25px 0;
          border: 1px solid #eef1f5;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .post-title {
          color: #2c3e50;
          font-size: 18px;
          font-weight: 600;
          margin-top: 0;
          margin-bottom: 15px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eef1f5;
        }
        .post-content {
          color: #34495e;
          white-space: pre-line;
          line-height: 1.6;
        }
        .post-image {
          max-width: 100%;
          height: auto;
          margin-top: 18px;
          border-radius: 6px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        .footer {
          margin-top: 35px;
          text-align: center;
          font-size: 14px;
          color: #8795a1;
          padding-top: 20px;
          border-top: 1px solid #eef1f5;
        }
        .resources {
          background-color: #f1f8ff;
          padding: 22px;
          border-radius: 8px;
          margin-top: 30px;
          border-left: 4px solid #3498db;
          box-shadow: 0 2px 8px rgba(52,152,219,0.08);
        }
        .resources h4 {
          margin-top: 0;
          color: #2c3e50;
          font-size: 17px;
          font-weight: 600;
        }
        .btn {
          display: inline-block;
          background-color: #3498db;
          color: white !important;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          letter-spacing: 0.3px;
          transition: background-color 0.2s;
          box-shadow: 0 4px 6px rgba(52,152,219,0.2);
        }
        .btn:hover {
          background-color: #2980b9;
        }
        .action-container {
          text-align: center;
          margin: 25px 0;
        }
        p {
          margin-bottom: 16px;
        }
        ul {
          padding-left: 20px;
        }
        li {
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Concerning Post Alert</h2>
        </div>
        
        <p>Hello ${userName},</p>
        
        <div class="alert">
          <p>Your friend <strong>${friendName}</strong> has posted content that our system has detected as potentially concerning for their wellbeing.</p>
        </div>
        
        <div class="post-container">
          <h3 class="post-title">${postTitle}</h3>
          <div class="post-content">${postContent}</div>
          ${
            postImage
              ? `<img src="cid:${imageFilename}" class="post-image" alt="Post image">`
              : ''
          }
        </div>

        <div class="action-container">
          <a href="${
            config.frontend_url
          }?post=${postId}" class="btn">View Post</a>
        </div>
        
        
        <p>It might be helpful to reach out to ${friendName} to check in and see how they're doing. Your support could make a significant difference during this challenging time.</p>
        
        <div class="resources">
          <h4>Resources for Support</h4>
          <p>If you believe this is an emergency situation, please consider:</p>
          <ul>
            <li>Contacting ${friendName} directly</li>
            <li>Reaching out to local emergency services</li>
            <li>Calling the National Suicide Prevention Lifeline: 988 or 1-800-273-8255</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>This is an automated alert from Smart Detector.</p>
          <p>Helping friends support each other through difficult times.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

type SuicidalCommentEmailTemplateProps = {
  friendName: string;
  commentContent: string;
  postId: string;
  userName: string;
  postImage?: string;
};

export const generateSuicidalCommentEmailTemplate = ({
  friendName,
  commentContent,
  postId,
  userName,
  postImage,
}: SuicidalCommentEmailTemplateProps): string => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
      .header {
        background-color: #f8d7da;
        padding: 10px;
        text-align: center;
        border-radius: 5px;
      }
      .content {
        padding: 20px 0;
      }
      .comment {
        background-color: #f9f9f9;
        padding: 15px;
        margin: 10px 0;
        border-radius: 5px;
        border-left: 4px solid #dc3545;
      }
      .footer {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #ddd;
        margin-top: 20px;
        font-size: 12px;
        color: #777;
      }
      .button {
        display: inline-block;
        background-color: #007bff;
        color: white !important;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 15px;
      }
      img {
        max-width: 100%;
        margin-top: 15px;
        border-radius: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>⚠️ Concerning Comment Alert</h2>
      </div>
      <div class="content">
        <p>Hello ${userName},</p>
        <p>Your friend <strong>${friendName}</strong> has posted a comment that our system has detected as potentially concerning.</p>
        
        <div class="comment">
          <p><em>"${commentContent}"</em></p>
        </div>
        
        ${
          postImage
            ? `<div><img src="cid:${
                postImage.split('\\').pop() ||
                postImage.split('/').pop() ||
                'post-image'
              }" alt="Post image" /></div>`
            : ''
        }
        
        <p>Your friend may be going through a difficult time and could benefit from your support.</p>
        <p>Consider reaching out to them or guiding them towards professional help if needed.</p>
        
        <div style="text-align: center;">
          <a href="${
            config.frontend_url
          }?post=${postId}" class="button">View Post</a>
        </div>
      </div>
      <div class="footer">
        <p>This is an automated message from the Smart Detector System.</p>
        <p>If you believe this is a false alarm, please disregard this email.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};
