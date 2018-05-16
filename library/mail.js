/**
 * Sends an email to a created user,
 * containing a verification link.
 * */

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const logger = require('../app/logger');

const templates = {
  accountConfirmation: (params) => `
  Hello,

  Click on the link below to activate your account.

    ${params.activationLink}

  Welcome aboard!
  The First Access Team

  `,

  passwordReset: (params) => `
  Hello,

  Click on the link below to reset your password.

    ${params.passwordResetLink}

  Yours truly,
  The First Access Team

  `,

  tokenGenerated: (params) => `
  Hello,

  A personal access token (${
    params.tokenDescription
  }) has been added to your account.

  Yours truly,
  The First Access Team

  `,
};

const htmlTemplates = {
  accountConfirmation: (params) => `

  <!doctype html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <title></title>
    <!--[if !mso]><!-- -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    #outlook a { padding: 0; }
    .ReadMsgBody { width: 100%; }
    .ExternalClass { width: 100%; }
    .ExternalClass * { line-height:100%; }
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse:collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    p { display: block; margin: 13px 0; }
  </style>
  <!--[if !mso]><!-->
  <style type="text/css">
    @media only screen and (max-width:480px) {
      @-ms-viewport { width:320px; }
      @viewport { width:320px; }
    }
  </style>
  <!--<![endif]-->
  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
  <!--[if lte mso 11]>
  <style type="text/css">
    .outlook-group-fix {
      width:100% !important;
    }
  </style>
  <![endif]-->

  <!--[if !mso]><!-->
      <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
      <style type="text/css">

          @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);

      </style>
    <!--<![endif]--><style type="text/css">
        @media only screen and (max-width: 480px) {
        	td {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          .mj-wrapper {
            padding-top: 0px !important;
          }
        }
      </style><style type="text/css">
    @media only screen and (min-width:480px) {
      .mj-column-per-100 { width:100%!important; }
    }
  </style>
  </head>
  <body style="background: #F5F5F5;">

    <div class="mj-container" style="background-color:#F5F5F5;"><!--[if mso | IE]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;" class="mj-wrapper-outlook">
        <![endif]--><div style="margin:0px auto;max-width:600px;" class="mj-wrapper"><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;" align="center" border="0"><tbody><tr><td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 0px;padding-top:44px;"><!--[if mso | IE]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:600px;">
        <![endif]--><div style="margin:0px auto;max-width:600px;background:#fff;"><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#fff;" align="center" border="0"><tbody><tr><td style="text-align:center;vertical-align:top;border:1px solid #E5E4E5;border-top:4px solid #118BB9;direction:ltr;font-size:0px;padding:80px;"><!--[if mso | IE]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;width:600px;">
        <![endif]--><div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0"><tbody><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;padding-bottom:42px;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0"><tbody><tr><td style="width:160px;"><img alt="" title="" height="26" src="https://s3.us-east-2.amazonaws.com/fa-email-assets/fa-text.png" style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:26px;" width="160"></td></tr></tbody></table></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center"><div style="cursor:auto;color:#55575D;font-family:Helvetica;font-size:32px;font-weight:600;line-height:1.5;text-align:center;">Activate Your Account</div></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:24px;" align="center"><div style="cursor:auto;color:#55575D;font-family:Helvetica;font-size:18px;line-height:1.5;text-align:center;">We just need to validate your email address to activate your First Access account. Simply click the following button:</div></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:24px;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;" align="center" border="0"><tbody><tr><td style="border:none;border-radius:3px;color:white;cursor:auto;padding:16px;" align="center" valign="middle" bgcolor="#118BB9"><a href="${
          params.activationLink
        }" style="text-decoration:none;background:#118BB9;color:white;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;font-weight:normal;line-height:120%;text-transform:none;margin:0px;" target="_blank">Activate my account</a></td></tr></tbody></table></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center"><div style="cursor:auto;color:#55575D;font-family:Helvetica;font-size:18px;line-height:1.5;text-align:center;">If the link doesn’t work, copy this URL into your browser:</div></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center"><div style="cursor:auto;color:#118BB9;font-family:Helvetica;font-size:18px;line-height:1.5;text-align:center;"><a href="${
    params.activationLink
  }" style="color:#118BB9">${
    params.activationLink
  }</a></div></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;padding-top:36px;padding-bottom:0px;" align="center"><div style="cursor:auto;color:#55575D;font-family:Helvetica;font-size:18px;line-height:1.5;text-align:center;">Welcome aboard!</div></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;padding-top:0px;" align="center"><div style="cursor:auto;color:#55575D;font-family:Helvetica;font-size:18px;line-height:1.5;text-align:center;">The First Access Team</div></td></tr></tbody></table></div><!--[if mso | IE]>
        </td></tr></table>
        <![endif]--></td></tr></tbody></table></div><!--[if mso | IE]>
          </td>
        </tr>
        <tr>
          <td style="width:600px;">
        <![endif]--><div style="margin:0px auto;max-width:600px;"><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;" align="center" border="0"><tbody><tr><td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 0px;"><!--[if mso | IE]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;width:600px;">
        <![endif]--><div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0"><tbody><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center"><div style="cursor:auto;color:#55575D;font-family:Helvetica;font-size:18px;line-height:1.5;text-align:center;">© 2017, First Access, Inc., All Rights Reserved.</div></td></tr></tbody></table></div><!--[if mso | IE]>
        </td></tr></table>
        <![endif]--></td></tr></tbody></table></div><!--[if mso | IE]>
            </td>
          </tr>
        </table>
        <![endif]--></td></tr></tbody></table></div><!--[if mso | IE]>
        </td></tr></table>
        <![endif]--></div>
  </body>
  </html>


  `,

  passwordReset: (params) => `


  <!doctype html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <title></title>
    <!--[if !mso]><!-- -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style type="text/css">
    #outlook a { padding: 0; }
    .ReadMsgBody { width: 100%; }
    .ExternalClass { width: 100%; }
    .ExternalClass * { line-height:100%; }
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse:collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    p { display: block; margin: 13px 0; }
  </style>
  <!--[if !mso]><!-->
  <style type="text/css">
    @media only screen and (max-width:480px) {
      @-ms-viewport { width:320px; }
      @viewport { width:320px; }
    }
  </style>
  <!--<![endif]-->
  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
  <!--[if lte mso 11]>
  <style type="text/css">
    .outlook-group-fix {
      width:100% !important;
    }
  </style>
  <![endif]-->

  <!--[if !mso]><!-->
      <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
      <style type="text/css">

          @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);

      </style>
    <!--<![endif]--><style type="text/css">
        @media only screen and (max-width: 480px) {
        	td {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          .mj-wrapper {
            padding-top: 0px !important;
          }
        }
      </style><style type="text/css">
    @media only screen and (min-width:480px) {
      .mj-column-per-100 { width:100%!important; }
    }
  </style>
  </head>
  <body style="background: #F5F5F5;">

    <div class="mj-container" style="background-color:#F5F5F5;"><!--[if mso | IE]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;" class="mj-wrapper-outlook">
        <![endif]--><div style="margin:0px auto;max-width:600px;" class="mj-wrapper"><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;" align="center" border="0"><tbody><tr><td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 0px;padding-top:44px;"><!--[if mso | IE]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:600px;">
        <![endif]--><div style="margin:0px auto;max-width:600px;background:#fff;"><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#fff;" align="center" border="0"><tbody><tr><td style="text-align:center;vertical-align:top;border:1px solid #E5E4E5;border-top:4px solid #118BB9;direction:ltr;font-size:0px;padding:80px;"><!--[if mso | IE]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;width:600px;">
        <![endif]--><div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0"><tbody><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;padding-bottom:42px;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0"><tbody><tr><td style="width:160px;"><img alt="" title="" height="26" src="https://s3.us-east-2.amazonaws.com/fa-email-assets/fa-text.png" style="border:none;border-radius:0px;display:block;font-size:13px;outline:none;text-decoration:none;width:100%;height:26px;" width="160"></td></tr></tbody></table></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center"><div style="cursor:auto;color:#55575D;font-family:Helvetica;font-size:32px;font-weight:600;line-height:1.5;text-align:center;">Password Reset</div></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:24px;" align="center"><div style="cursor:auto;color:#55575D;font-family:Helvetica;font-size:18px;line-height:1.5;text-align:center;">We received a request to reset your account password. Please click the button below to continue resetting your password:</div></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:24px;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;" align="center" border="0"><tbody><tr><td style="border:none;border-radius:3px;color:white;cursor:auto;padding:16px;" align="center" valign="middle" bgcolor="#118BB9"><a href="${
          params.passwordResetLink
        }" style="text-decoration:none;background:#118BB9;color:white;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;font-weight:normal;line-height:120%;text-transform:none;margin:0px;" target="_blank">Reset my password</a></td></tr></tbody></table></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center"><div style="cursor:auto;color:#55575D;font-family:Helvetica;font-size:18px;line-height:1.5;text-align:center;">If the button doesn’t work, copy this URL into your browser:</div></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center"><div style="cursor:auto;color:#118BB9;font-family:Helvetica;font-size:18px;line-height:1.5;text-align:center;"><a href="${
    params.passwordResetLink
  }" style="color:#118BB9">${
    params.passwordResetLink
  }</a></div></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center"><div style="cursor:auto;color:#55575D;font-family:Helvetica;font-size:18px;line-height:1.5;text-align:center;">If you believe you have received this message in error, please ignore this email.</div></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;padding-top:36px;padding-bottom:0px;" align="center"><div style="cursor:auto;color:#55575D;font-family:Helvetica;font-size:18px;line-height:1.5;text-align:center;">Yours truly,</div></td></tr><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;padding-top:0px;" align="center"><div style="cursor:auto;color:#55575D;font-family:Helvetica;font-size:18px;line-height:1.5;text-align:center;">The First Access Team</div></td></tr></tbody></table></div><!--[if mso | IE]>
        </td></tr></table>
        <![endif]--></td></tr></tbody></table></div><!--[if mso | IE]>
          </td>
        </tr>
        <tr>
          <td style="width:600px;">
        <![endif]--><div style="margin:0px auto;max-width:600px;"><table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;" align="center" border="0"><tbody><tr><td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 0px;"><!--[if mso | IE]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;width:600px;">
        <![endif]--><div class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0"><tbody><tr><td style="word-wrap:break-word;font-size:0px;padding:10px 25px;" align="center"><div style="cursor:auto;color:#55575D;font-family:Helvetica;font-size:18px;line-height:1.5;text-align:center;">© 2017, First Access, Inc., All Rights Reserved.</div></td></tr></tbody></table></div><!--[if mso | IE]>
        </td></tr></table>
        <![endif]--></td></tr></tbody></table></div><!--[if mso | IE]>
            </td>
          </tr>
        </table>
        <![endif]--></td></tr></tbody></table></div><!--[if mso | IE]>
        </td></tr></table>
        <![endif]--></div>
  </body>
  </html>

  `,
};

/**
 * Sends email.
 *
 * @param {object} user, to send the email to.
 * @param {string} message, email content.
 */
function sendEmail(to, subject, message, htmlMessage) {
  if (process.env.NODE_ENV === 'test') {
    logger.info('Not sending emails in test mode.');
    return;
  }

  const transporter = nodemailer.createTransport(
    smtpTransport({
      host: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    }),
  );

  transporter.sendMail({
    from: 'First Access <info@firstaccess.io>',
    to,
    subject,
    text: message,
    html: htmlMessage,
    replyTo: 'no-reply@firstaccess.io',
  });
}

module.exports = {
  templates,
  htmlTemplates,
  sendEmail,
};
