import { configEnv } from '../../config/env.js';
import { sendEmail } from './sendEmail.js';

export const sendOtpEmail = async (email, otp, language = 'en') => {
	const emailOtpTitle_ar = `تفعيل حسابك في ${configEnv.appName}`;
	const emailOtpTitle_en = `Verify your account in ${configEnv.appName}`;

	const emailOtpTemplate_ar = `
   <!DOCTYPE html>
   <html lang="ar" dir="rtl">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>رمز التحقق الخاص بك</title>
   </head>
   <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; direction: rtl; text-align: right;">
     
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
                 <h2 style="color: #1a1a1a; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">رمز التحقق (OTP)</h2>
                 <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                   مرحباً، لقد تلقينا طلباً لتسجيل الدخول أو تفعيل حسابك في <strong>${configEnv.appName}</strong>. يرجى استخدام الرمز التالي لإتمام العملية:
                 </p>
                 
                 <div style="text-align: center; margin: 35px 0;">
                   <div style="display: inline-block; background-color: #f0f4f8; color: #1e3c72; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 16px 40px; border-radius: 8px; border: 2px dashed #1e3c72; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                     ${otp}
                   </div>
                 </div>

                 <p style="color: #777777; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
                   هذا الرمز صالحة لفترة محدودة فقط لأسباب أمنية. إذا لم تكن أنت من طلب هذا الرمز، يمكنك تجاهل هذا البريد الإلكتروني بأمان.
                 </p>
                 
                 <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                 
                 <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                   <tr>
                     <td style="background-color: #fff5f5; border-right: 4px solid #e53e3e; padding: 12px 15px; border-radius: 4px;">
                       <p style="color: #c53030; font-size: 13px; margin: 0; font-weight: 600;">
                         ⚠️ تنبيه أمني: لا تشارك هذا الرمز مع أي شخص على الإطلاق لحماية خصوصية حسابك.
                       </p>
                     </td>
                   </tr>
                 </table>
               </td>
             </tr>
             
             <tr>
               <td style="background-color: #fafafa; padding: 25px 30px; text-align: center; border-top: 1px solid #f0f0f0;">
                 <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                   هذا البريد تم إرساله بشكل تلقائي، يرجى عدم الرد عليه مباشرة.
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

	const emailOtpTemplate_en = `
   <!DOCTYPE html>
   <html lang="en" dir="ltr">
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Your Verification Code</title>
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
                 <h2 style="color: #1a1a1a; margin-top: 0; margin-bottom: 16px; font-size: 22px; font-weight: 700;">Verification Code (OTP)</h2>
                 <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                   Hello, we received a request to log in or activate your account on <strong>${configEnv.appName}</strong>. Please use the following verification code to complete the process:
                 </p>
                 
                 <div style="text-align: center; margin: 35px 0;">
                   <div style="display: inline-block; background-color: #f0f4f8; color: #1e3c72; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 16px 40px; border-radius: 8px; border: 2px dashed #1e3c72; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                     ${otp}
                   </div>
                 </div>

                 <p style="color: #777777; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
                   This code is valid for a limited time only for security reasons. If you did not request this code, you can safely ignore this email.
                 </p>
                 
                 <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
                 
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
		html: language === 'ar' ? emailOtpTemplate_ar : emailOtpTemplate_en,
	});
};
