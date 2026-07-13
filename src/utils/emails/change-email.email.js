import { configEnv } from '../../config/env.js';
import { sendEmail } from './sendEmail.js';

const appName = configEnv.appName;

export const sendRequestChangeNewEmail = async (email, otp, language = 'en') => {
	const emailOtpTitle_ar = `طلب تغير بريدك الالكتروني - ${appName}`;
	const emailOtpTitle_en = `Request to change your email - ${appName}`;

	const emailOtpTemplate_ar = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد بريدك الإلكتروني الجديد</title>
    </head>
    <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: rtl; text-align: right;">
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <table role="presentation" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
              
              <!-- الهيدر -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 35px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
                    ${appName}
                  </h1>
                </td>
              </tr>
              
              <!-- المحتوى الرئيسي -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1a1a1a; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">رمز التحقق لتغيير البريد الإلكتروني</h2>
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    مرحباً، لقد تلقينا طلباً لتغيير البريد الإلكتروني المرتبط بحسابك على <strong>${appName}</strong>. يرجى استخدام رمز التحقق التالي لتأكيد هذا التغيير:
                  </p>
                  
                  <!-- صندوق الـ OTP -->
                  <div style="text-align: center; margin: 35px 0;">
                    <div style="display: inline-block; background-color: #f0f4f8; color: #1e3c72; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 16px 40px; border-radius: 8px; border: 2px dashed #1e3c72; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); direction: ltr;">
                      ${otp}
                    </div>
                  </div>

                  <p style="color: #777777; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
                    هذا الرمز صالح لفترة زمنية محدودة فقط لأسباب أمنية. إذا لم تكن أنت من طلب هذا التغيير، يمكنك تجاهل هذا البريد الإلكتروني بأمان وسيبقى بريدك الحالي كما هو دون أي تعديل.
                  </p>
                  
                  <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                  
                  <!-- تنبيه أمني -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="background-color: #fff5f5; border-right: 4px solid #e53e3e; padding: 12px 15px; border-radius: 4px;">
                        <p style="color: #c53030; font-size: 13px; margin: 0; font-weight: 600;">
                          ⚠️ تنبيه أمني: لا تشارك هذا الرمز مع أي شخص تحت أي ظرف من الظروف للحفاظ على أمان حسابك.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- الفوتر -->
              <tr>
                <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                  <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                    هذا البريد تم إرساله تلقائياً، يرجى عدم الرد عليه مباشرة.
                  </p>
                  <p style="color: #b3b3b3; font-size: 12px; margin: 8px 0 0 0; direction: ltr;">
                    &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
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

	const emailOtpTemplate_en = `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your New Email Address</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: ltr; text-align: left;">
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <table role="presentation" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 35px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
                    ${appName}
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1a1a1a; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">Email Change Verification</h2>
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    Hello, we received a request to change the email address linked to your account on <strong>${appName}</strong>. Please use the following verification code to confirm this change:
                  </p>
                  
                  <!-- OTP Box -->
                  <div style="text-align: center; margin: 35px 0;">
                    <div style="display: inline-block; background-color: #f0f4f8; color: #1e3c72; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 16px 40px; border-radius: 8px; border: 2px dashed #1e3c72; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                      ${otp}
                    </div>
                  </div>

                  <p style="color: #777777; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
                    This code is valid for a limited time only for security reasons. If you did not request this change, you can safely ignore this email; your current email will remain unchanged.
                  </p>
                  
                  <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                  
                  <!-- Security Notice -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 12px 15px; border-radius: 4px;">
                        <p style="color: #c53030; font-size: 13px; margin: 0; font-weight: 600;">
                          ⚠️ Security Notice: Never share this code with anyone under any circumstances to keep your account safe.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                  <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                    This is an automated email, please do not reply to it directly.
                  </p>
                  <p style="color: #b3b3b3; font-size: 12px; margin: 8px 0 0 0;">
                    &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
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
		html: language === 'ar' ? emailOtpTemplate_ar : emailOtpTemplate_en,
	});
};

export const sendRequestChangOldEmail = async (email, newEmail, language = 'en') => {
	const emailOtpTitle_ar = `تنبيه أمني: طلب تغيير البريد الإلكتروني - ${appName}`;
	const emailOtpTitle_en = `Security Notice: Request to change your email - ${appName}`;

	const emailOtpTemplate_ar = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تنبيه أمني: طلب تغيير البريد الإلكتروني</title>
    </head>
    <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: rtl; text-align: right;">
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <table role="presentation" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
              
              <!-- الهيدر -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 35px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
                    ${appName}
                  </h1>
                </td>
              </tr>
              
              <!-- المحتوى الرئيسي -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #dd6b20; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">تنبيه أمني: محاولة تغيير البريد</h2>
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                    مرحباً، لقد تلقينا للتو طلباً لتغيير البريد الإلكتروني المرتبط بحسابك على <strong>${appName}</strong> إلى: <strong style="color: #1a1a1a; direction: ltr; display: inline-block;">${newEmail}</strong>.
                  </p>
                  
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    تم إرسال رمز التحقق (OTP) إلى العنوان الجديد للتأكد من ملكيته. **بريدك الحالي لا يزال فعالاً** ولم يتم تعديل أي شيء في بياناتك بعد. إذا كنت أنت من قام بهذا الطلب، يمكنك تجاهل هذه الرسالة تماماً.
                  </p>
                  
                  <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                  
                  <!-- صندوق التحذير الاستباقي -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="background-color: #fffaf0; border-right: 4px solid #dd6b20; padding: 15px; border-radius: 4px;">
                        <p style="color: #744210; font-size: 14px; margin: 0 0 8px 0; font-weight: 700;">
                          ⚠️ هل لم تقم بهذا الإجراء؟
                        </p>
                        <p style="color: #744210; font-size: 13px; margin: 0; line-height: 1.5;">
                          إذا لم تكن أنت من طلب هذا التغيير، فهذا يعني أن **هناك شخصاً آخر يعرف كلمة مرورك الحالية**. يرجى تسجيل الدخول إلى حسابك فوراً، وإلغاء أي طلب معلق من الإعدادات، ثم قم بتغيير كلمة المرور لحماية حسابك وبياناتك.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- الفوتر -->
              <tr>
                <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                  <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                    هذا تنبيه أمني تلقائي بخصوص حسابك، يرجى عدم الرد عليه مباشرة.
                  </p>
                  <p style="color: #b3b3b3; font-size: 12px; margin: 8px 0 0 0; direction: ltr;">
                    &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
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

	const emailOtpTemplate_en = `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Notice: Email Change Requested</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: ltr; text-align: left;">
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <table role="presentation" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 35px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
                    ${appName}
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #dd6b20; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">Security Alert: Email Change Attempt</h2>
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                    Hello, we received a request to change the email address of your <strong>${appName}</strong> account to: <strong style="color: #1a1a1a;">${newEmail}</strong>.
                  </p>
                  
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    A verification code (OTP) has been sent to the new email address. **Your current email remains active** and nothing has been finalized yet. If you initiated this request, you can safely disregard this message.
                  </p>
                  
                  <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                  
                  <!-- Warning Notice -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 15px; border-radius: 4px;">
                        <p style="color: #744210; font-size: 14px; margin: 0 0 8px 0; font-weight: 700;">
                          ⚠️ Was this not you?
                        </p>
                        <p style="color: #744210; font-size: 13px; margin: 0; line-height: 1.5;">
                          If you did not request this change, it means **someone knows your current password**. Please log into your account immediately, cancel any pending changes from your settings, and change your password to secure your account.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                  <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                    This is an automated security notification regarding your account.
                  </p>
                  <p style="color: #b3b3b3; font-size: 12px; margin: 8px 0 0 0;">
                    &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
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
		html: language === 'ar' ? emailOtpTemplate_ar : emailOtpTemplate_en,
	});
};

export const sendChangedOldEmail = async (email, newEmail, revertUrl, language = 'en') => {
	const emailTitle_ar = `تنبيه أمني: تم تغيير البريد الإلكتروني في ${appName}`;
	const emailTitle_en = `Security Notice: Email Changed in ${appName}`;

	const emailTemplate_ar = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تنبيه أمني: تم تغيير البريد الإلكتروني</title>
    </head>
    <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: rtl; text-align: right;">
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <table role="presentation" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
              
              <!-- الهيدر -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 35px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
                    ${appName}
                  </h1>
                </td>
              </tr>
              
              <!-- المحتوى الرئيسي -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #e53e3e; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">تنبيه أمني: تم تغيير البريد</h2>
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                    مرحباً، نود إحاطتك علماً بأن البريد الإلكتروني المرتبط بحسابك على <strong>${appName}</strong> قد تم تغييره بنجاح إلى: <strong style="color: #1a1a1a; direction: ltr; display: inline-block;">${newEmail}</strong>.
                  </p>
                  
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    إذا كنت أنت من قام بهذا الإجراء، فلا داعي لاتخاذ أي خطوة أخرى وحسابك في أمان تام.
                  </p>
                  
                  <!-- زر اتخاذ الإجراء السريع -->
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${revertUrl}" target="_blank" style="display: inline-block; background-color: #e53e3e; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 8px; box-shadow: 0 4px 12px rgba(229,62,62,0.3);">
                      إلغاء هذا التغيير واستعادة الحساب فوراً
                    </a>
                  </div>

                  <p style="color: #777777; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
                    <strong>هل لم تقم بهذا التغيير؟</strong> قد يكون حسابك قد تعرض للاختراق من قِبل شخص آخر. اضغط على الزر أعلاه فوراً لإلغاء عملية النقل، وإعادة بريدك القديم وتأمين حسابك.
                  </p>
                  
                  <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                  
                  <!-- تنبيه الصلاحية -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="background-color: #fff5f5; border-right: 4px solid #e53e3e; padding: 12px 15px; border-radius: 4px;">
                        <p style="color: #c53030; font-size: 13px; margin: 0; font-weight: 600;">
                          ⚠️ ملاحظة حماية: لحمايتك، ينتهي مفعول رابط الاستعادة هذا تلقائياً بعد مرور 7 أيام.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- الفوتر -->
              <tr>
                <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                  <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                    هذا تنبيه أمني تلقائي، يرجى عدم الرد على هذه الرسالة مباشرة.
                  </p>
                  <p style="color: #b3b3b3; font-size: 12px; margin: 8px 0 0 0; direction: ltr;">
                    &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
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

	const emailTemplate_en = `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Security Alert: Email Address Changed</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: ltr; text-align: left;">
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <table role="presentation" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 35px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
                    ${appName}
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #e53e3e; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">Security Notice: Email Changed</h2>
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                    Hello, we are writing to inform you that the email address linked to your account on <strong>${appName}</strong> has been successfully changed to: <strong style="color: #1a1a1a;">${newEmail}</strong>.
                  </p>
                  
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    If you initiated this change, no further action is required from your side. Your account is safe.
                  </p>
                  
                  <!-- Action Button -->
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${revertUrl}" target="_blank" style="display: inline-block; background-color: #e53e3e; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 35px; border-radius: 8px; box-shadow: 0 4px 12px rgba(229,62,62,0.3);">
                      Revert This Change Immediately
                    </a>
                  </div>

                  <p style="color: #777777; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
                    <strong>Didn't request this change?</strong> Someone might have gained unauthorized access to your account. Click the button above immediately to cancel the transfer, restore your old email, and secure your data.
                  </p>
                  
                  <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                  
                  <!-- Security Notice -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="background-color: #fff5f5; border-left: 4px solid #e53e3e; padding: 12px 15px; border-radius: 4px;">
                        <p style="color: #c53030; font-size: 13px; margin: 0; font-weight: 600;">
                          ⚠️ Note: For your protection, this recovery link will expire in 7 days.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                  <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                    This is an automated security alert, please do not reply to it directly.
                  </p>
                  <p style="color: #b3b3b3; font-size: 12px; margin: 8px 0 0 0;">
                    &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
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
		subject: language === 'ar' ? emailTitle_ar : emailTitle_en,
		html: language === 'ar' ? emailTemplate_ar : emailTemplate_en,
	});
};

export const sendChangedNewEmail = async (email, language = 'en') => {
	const emailTitle_ar = `تم تحديث البريد الإلكتروني بنجاح - ${appName}`;
	const emailTitle_en = `Email Updated Successfully - ${appName}`;

	const emailTemplate_ar = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تم تحديث البريد الإلكتروني بنجاح</title>
    </head>
    <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: rtl; text-align: right;">
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <table role="presentation" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
              
              <!-- الهيدر -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 35px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
                    ${appName}
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #38a169; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">تم التحديث بنجاح!</h2>
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                    مرحباً، نؤكد لك أنه تم تغيير البريد الإلكتروني المرتبط بحسابك على <strong>${appName}</strong> واستبداله بهذا البريد الحالي بنجاح.
                  </p>
                  
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    بدءاً من الآن، يرجى استخدام هذا البريد الإلكتروني لتسجيل الدخول إلى حسابك، واستقبال جميع الرسائل الصراحة القادمة، والتنبيهات الأمنية.
                  </p>
                  
                  <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                  
                  <!-- إشعار نجاح جانبي -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="background-color: #f0fff4; border-right: 4px solid #38a169; padding: 12px 15px; border-radius: 4px;">
                        <p style="color: #276749; font-size: 13px; margin: 0; font-weight: 600;">
                          ✅ فحص أمني: حسابك الآن مؤمن بالكامل بالبريد الجديد، وتم إلغاء ارتباط البريد القديم بشكل آمن.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- الفوتر -->
              <tr>
                <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                  <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                    هذا البريد تم إرساله تلقائياً لتأكيد الأمان، يرجى عدم الرد عليه مباشرة.
                  </p>
                  <p style="color: #b3b3b3; font-size: 12px; margin: 8px 0 0 0; direction: ltr;">
                    &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
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

	const emailTemplate_en = `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Updated Successfully</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: ltr; text-align: left;">
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <table role="presentation" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 35px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
                    ${appName}
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #38a169; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">Success! Email Updated</h2>
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                    Hello, this email confirms that your account on <strong>${appName}</strong> has been successfully updated to use this new email address.
                  </p>
                  
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    From now on, please use this email address to log in to your account and to receive all future notifications, anonymous messages, and security updates.
                  </p>
                  
                  <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                  
                  <!-- Success Notice -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="background-color: #f0fff4; border-left: 4px solid #38a169; padding: 12px 15px; border-radius: 4px;">
                        <p style="color: #276749; font-size: 13px; margin: 0; font-weight: 600;">
                          ✅ Security Check: Your secure connection is fully active, and the old email link has been deprecated.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                  <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                    This is an automated notification, please do not reply to it directly.
                  </p>
                  <p style="color: #b3b3b3; font-size: 12px; margin: 8px 0 0 0;">
                    &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
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
		subject: language === 'ar' ? emailTitle_ar : emailTitle_en,
		html: language === 'ar' ? emailTemplate_ar : emailTemplate_en,
	});
};

export const sendRevertSuccessEmail = async (email, language = 'en') => {
	const emailTitle_ar = `تم استعادة الحساب بنجاح - ${appName}`;
	const emailTitle_en = `Account Restored Successfully - ${appName}`;

  const emailTemplate_ar = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تم استعادة الحساب بنجاح</title>
    </head>
    <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: rtl; text-align: right;">
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <table role="presentation" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
              
              <!-- الهيدر -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 35px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
                    ${configEnv.appName}
                  </h1>
                </td>
              </tr>
              
              <!-- المحتوى الرئيسي -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #38a169; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">تم إلغاء التغيير وتأمين الحساب</h2>
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                    مرحباً، تم تنفيذ طلبك لإلغاء عملية نقل البريد الإلكتروني بنجاح. حسابك الآن **مرتبط بالكامل بهذا البريد الإلكتروني مجدداً**.
                  </p>
                  
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    لقد تم فصل البريد الإلكتروني الآخر تماماً، وإلغاء صلاحية أي جلسات نشطة تم إنشاؤها خلال فترة محاولة النقل لحماية خصوصيتك.
                  </p>
                  
                  <!-- صندوق خطوة تغيير كلمة المرور الإلزامية -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                    <tr>
                      <td style="background-color: #fffaf0; border-right: 4px solid #dd6b20; padding: 15px; border-radius: 4px;">
                        <p style="color: #744210; font-size: 14px; margin: 0 0 6px 0; font-weight: 700;">
                          ⚠️ خطوة أمنية هامة جداً: غيّر كلمة مرورك الآن
                        </p>
                        <p style="color: #744210; font-size: 13px; margin: 0; line-height: 1.5;">
                          بما أنك اضطررت لإلغاء تغيير بريد غير مصرح به، فهذا دليل قاطع على أن **كلمة مرورك الحالية أصبحت مكشوفة**. يرجى تسجيل الدخول إلى حسابك فوراً وتغيير كلمة المرور إلى كلمة أخرى قوية وجديدة لمنع أي محاولة اختراق مستقبلاً.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                  
                  <!-- إشعار حالة النجاح -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="background-color: #f0fff4; border-right: 4px solid #38a169; padding: 12px 15px; border-radius: 4px;">
                        <p style="color: #276749; font-size: 13px; margin: 0; font-weight: 600;">
                          ✅ تحديث الحماية: تمت إعادة تفعيل معايير الأمان السابقة وتأمين الحساب المرتبط.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- الفوتر -->
              <tr>
                <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                  <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                    هذا تأكيد أمني تلقائي، يرجى عدم الرد على هذه الرسالة مباشرة.
                  </p>
                  <p style="color: #b3b3b3; font-size: 12px; margin: 8px 0 0 0; direction: ltr;">
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

	const emailTemplate_en = `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Recovered Successfully</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: ltr; text-align: left;">
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f7f6; padding: 20px 0;">
        <tr>
          <td align="center">
            
            <table role="presentation" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border-collapse: collapse;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 35px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
                    ${configEnv.appName}
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #38a169; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">Account Reverted & Secured</h2>
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                    Hello, your request to cancel the email transfer has been processed successfully. Your account is now **fully linked back to this email address**.
                  </p>
                  
                  <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    The unauthorized email address has been completely detached, and any active sessions generated during the transfer window have been revoked for your safety.
                  </p>
                  
                  <!-- Action Required Warning Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px;">
                    <tr>
                      <td style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 15px; border-radius: 4px;">
                        <p style="color: #744210; font-size: 14px; margin: 0 0 6px 0; font-weight: 700;">
                          ⚠️ CRITICAL STEP REQUIRED: Change Your Password
                        </p>
                        <p style="color: #744210; font-size: 13px; margin: 0; line-height: 1.5;">
                          Since you had to revert an unauthorized email change, **your current password is compromised**. Please log in to your account immediately and change your password to a strong, unique one to prevent further breaches.
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                  
                  <!-- Success Status -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="background-color: #f0fff4; border-left: 4px solid #38a169; padding: 12px 15px; border-radius: 4px;">
                        <p style="color: #276749; font-size: 13px; margin: 0; font-weight: 600;">
                          ✅ Protection Update: Old security parameters have been re-established.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                  <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                    This is an automated security confirmation, please do not reply to it directly.
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
		subject: language === 'ar' ? emailTitle_ar : emailTitle_en,
		html: language === 'ar' ? emailTemplate_ar : emailTemplate_en,
	});
};
