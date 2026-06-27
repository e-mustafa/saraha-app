import { configEnv } from '../../config/env.js';
import { sendEmail } from './sendEmail.js';

export const sendResetPasswordEmail = async (email, link, userName, period = 10, language = 'en') => {
	const emailOtpTitle_ar = `إعادة تعيين كلمة المرور في ${configEnv.appName}`;
	const emailOtpTitle_en = `Reset your password in ${configEnv.appName}`;

  const emailResetPasswordTemplate_ar = `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>استعادة كلمة المرور</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: rtl; text-align: right;">
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <table role="presentation" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
              
              <tr>
                <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 35px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
                    ${configEnv.appName}
                  </h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1a1a1a; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">طلب إعادة تعيين كلمة المرور</h2>
                  
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                    مرحباً <strong>${userName}</strong>،
                  </p>
                  
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك على <strong>${configEnv.appName}</strong>. يمكنك إعادة تعيينها بالضغط على الزر أدناه:
                  </p>
                  
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${link}" target="_blank" style="display: inline-block; background-color: #1e3c72; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 8px; box-shadow: 0 4px 6px rgba(30, 60, 114, 0.25);">
                      إعادة تعيين كلمة المرور
                    </a>
                  </div>

                  <p style="color: #777777; font-size: 13px; line-height: 1.5; margin-bottom: 25px; text-align: center;">
                    إذا لم يعمل الزر السابق، انسخ الرابط التالي وألصقه في متصفحك:<br>
                    <a href="${link}" style="color: #1e3c72; word-break: break-all;">${link}</a>
                  </p>

                  <p style="color: #777777; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
                    هذا الرابط صالح لمدة <strong>${period || 10} دقائق</strong> فقط لأسباب أمنية. إذا لم تقم بطلب هذا الإجراء، يمكنك تجاهل هذا البريد الإلكتروني بأمان وسيظل حسابك محمياً.
                  </p>
                  
                  <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                  
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="background-color: #fff5f5; border-right: 4px solid #e53e3e; padding: 12px 15px; border-radius: 4px;">
                        <p style="color: #c53030; font-size: 13px; margin: 0; font-weight: 600;">
                          ⚠️ تنبيه أمني: لا تقم بمشاركة هذا الرابط مع أي شخص تحت أي ظرف من الظروف لضمان سلامة حسابك.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                  <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                    هذا البريد الإلكتروني مرسل تلقائياً، يرجى عدم الرد عليه مباشرة.
                  </p>
                  <p style="color: #b3b3b3; font-size: 12px; margin: 8px 0 0 0;">
                    &copy; ${new Date().getFullYear()} ${configEnv.appName}. جميع الحقوق محفوظة.
                  </p>
                </td>
              </tr>
              
            </table>
            
          </td>
        </tr>
      </table>
      
    </body>
  </html>
  `;

	const emailResetPasswordTemplate_en = `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: ltr; text-align: left;">
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 20px 0;">
          <tr>
            <td align="center">
              
              <table role="presentation" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
                
                <tr>
                  <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 35px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
                      ${configEnv.appName}
                    </h1>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1a1a1a; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">Reset Your Password</h2>
                    
                    <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                      Hello <strong>${userName}</strong>,
                    </p>
                    
                    <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                      We received a request to reset the password for your account on <strong>${configEnv.appName}</strong>. You can reset your password by clicking the button below:
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                      <a href="${link}" target="_blank" style="display: inline-block; background-color: #1e3c72; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 8px; box-shadow: 0 4px 6px rgba(30, 60, 114, 0.25);">
                        Reset Password
                      </a>
                    </div>

                    <p style="color: #777777; font-size: 13px; line-height: 1.5; margin-bottom: 25px; text-align: center;">
                      If the button above doesn't work, copy and paste this link into your browser:<br>
                      <a href="${link}" style="color: #1e3c72; word-break: break-all;">${link}</a>
                    </p>

                    <p style="color: #777777; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
                      This link is valid for only <strong>${period || 10} minutes</strong> for security reasons. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 12px 15px; border-radius: 4px;">
                          <p style="color: #c53030; font-size: 13px; margin: 0; font-weight: 600;">
                            ⚠️ Security Notice: Never share this link with anyone under any circumstances to keep your account safe.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <tr>
                  <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                    <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                      This is an automated email, please do not reply to it directly.
                    </p>
                    <p style="color: #b3b3b3; font-size: 12px; margin: 8px 0 0 0;">
                      &copy; ${new Date().getFullYear()} ${configEnv.appName}. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
              
            </td>
          </tr>
        </table>
        
      </body>
    </html>
  `;

	return await sendEmail({
		to: email,
		subject: language === 'ar' ? emailOtpTitle_ar : emailOtpTitle_en,
		html: language === 'ar' ? emailResetPasswordTemplate_ar : emailResetPasswordTemplate_en,
	});
};
