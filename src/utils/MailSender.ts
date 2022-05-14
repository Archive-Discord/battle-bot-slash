import nodemailer from 'nodemailer'
import config from '../../config'
import { google } from 'googleapis'
import Logger from './Logger'
const logger = new Logger('mailEvent')

interface param {
  serverName: string
  email: string
  code: string
}

const oAuth2Client = new google.auth.OAuth2(
  config.email.Google_Client_Id,
  config.email.Google_Client_Secret,
  config.email.Google_Redirect_Url
)
oAuth2Client.setCredentials({
  refresh_token: config.email.Google_Refresh_Token
})

const mailSender = {
  // 메일발송 함수
  sendGmail: async function (param: param) {
    try {
      const access_token = await oAuth2Client.getAccessToken()
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'oauth2',
          user: config.email.Google_Email,
          clientId: config.email.Google_Client_Id,
          clientSecret: config.email.Google_Client_Secret,
          refreshToken: config.email.Google_Refresh_Token,
          accessToken: access_token as string
        }
      })
      // 메일 옵션
      const mailOptions = {
        from: `"배틀이 인증" <${config.email.Google_Email}>`,
        to: param.email, // 수신할 이메일
        subject: `[배틀이] ${param.serverName} 서버 에서 인증을 요청합니다`, // 메일 제목
        html: `<!DOCTYPE html>
                <html>
                <head>
                
                  <meta charset="utf-8">
                  <meta http-equiv="x-ua-compatible" content="ie=edge">
                  <title>배틀이 인증</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style type="text/css">
                  /**
                   * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
                   */
                  @media screen {
                    @font-face {
                      font-family: 'Source Sans Pro';
                      font-style: normal;
                      font-weight: 400;
                      src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
                    }
                
                    @font-face {
                      font-family: 'Source Sans Pro';
                      font-style: normal;
                      font-weight: 700;
                      src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
                    }
                  }
                
                  /**
                   * Avoid browser level font resizing.
                   * 1. Windows Mobile
                   * 2. iOS / OSX
                   */
                  body,
                  table,
                  td,
                  a {
                    -ms-text-size-adjust: 100%; /* 1 */
                    -webkit-text-size-adjust: 100%; /* 2 */
                  }
                
                  /**
                   * Remove extra space added to tables and cells in Outlook.
                   */
                  table,
                  td {
                    mso-table-rspace: 0pt;
                    mso-table-lspace: 0pt;
                  }
                
                  /**
                   * Better fluid images in Internet Explorer.
                   */
                  img {
                    -ms-interpolation-mode: bicubic;
                  }
                
                  /**
                   * Remove blue links for iOS devices.
                   */
                  a[x-apple-data-detectors] {
                    font-family: inherit !important;
                    font-size: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                    color: inherit !important;
                    text-decoration: none !important;
                  }
                
                  /**
                   * Fix centering issues in Android 4.4.
                   */
                  div[style*="margin: 16px 0;"] {
                    margin: 0 !important;
                  }
                
                  body {
                    width: 100% !important;
                    height: 100% !important;
                    padding: 0 !important;
                    margin: 0 !important;
                  }
                
                  /**
                   * Collapse table borders to avoid space between cells.
                   */
                  table {
                    border-collapse: collapse !important;
                  }
                
                  a {
                    color: #1a82e2;
                  }
                
                  img {
                    height: auto;
                    line-height: 100%;
                    text-decoration: none;
                    border: 0;
                    outline: none;
                  }
                  </style>
                
                </head>
                <body style="background-color: #e9ecef;">
                
                  <!-- start body -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                
                    <!-- start logo -->
                    <tr>
                      <td align="center" bgcolor="#e9ecef">
                        <!--[if (gte mso 9)|(IE)]>
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                        <tr>
                        <td align="center" valign="top" width="600">
                        <![endif]-->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                          <tr>
                            <td align="center" valign="top" style="padding: 36px 24px;">
                              <a href="https://www.battlebot.kr/" style="display: inline-block;">
                                <img src="https://cdn.discordapp.com/attachments/837264607944638486/840533589220917248/image0.png" alt="Logo" border="0" width="48" style="display: block; width: 40px; max-width: 40px; min-width: 40px;">
                              </a>
                            </td>
                          </tr>
                        </table>
                        <!--[if (gte mso 9)|(IE)]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                    <!-- end logo -->
                
                    <!-- start hero -->
                    <tr>
                      <td align="center" bgcolor="#e9ecef">
                        <!--[if (gte mso 9)|(IE)]>
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                        <tr>
                        <td align="center" valign="top" width="600">
                        <![endif]-->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                          <tr>
                            <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                              <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">배틀이 이메일 인증</h1>
                            </td>
                          </tr>
                        </table>
                        <!--[if (gte mso 9)|(IE)]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                    <!-- end hero -->
                
                    <!-- start copy block -->
                    <tr>
                      <td align="center" bgcolor="#e9ecef">
                        <!--[if (gte mso 9)|(IE)]>
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                        <tr>
                        <td align="center" valign="top" width="600">
                        <![endif]-->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                
                          <!-- start copy -->
                          <tr>
                            <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                                <p style="margin: 0;">${param.serverName} 서버에서 인증을 요청했습니다</p>
                                <p style="margin: 0;">아래 코드를 입력하여 이메일을 인증해주세요</p>
                            </td>
                          </tr>
                          <tr>
                            <td align="left" bgcolor="#ffffff">
                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                  <td align="center" bgcolor="#ffffff" style="padding: 30px;">
                                    <table border="0" cellpadding="0" cellspacing="0">
                                      <tr>
                                        <td align="center" bgcolor="#fffff" style="border-radius: 6px;">
                                          <button id="copybtn" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #000000; text-decoration: none; border-radius: 6px;" onclick="copyToClipboard('${param.code}');" title="인증 코드 복사">${param.code}</button>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                
                        </table>
                        <!--[if (gte mso 9)|(IE)]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                    <!-- end copy block -->
                    <script>
                    function copyToClipboard(val) {
                    let t = document.createElement("textarea");
                    document.body.appendChild(t);
                    t.value = val;
                    t.select();
                    document.execCommand('copy');
                    document.body.removeChild(t);
                    alert('인증코드가 복사되었습니다.');
                    }
                    </script>
                    <!-- start footer -->
                    <tr>
                      <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                        <!--[if (gte mso 9)|(IE)]>
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                        <tr>
                        <td align="center" valign="top" width="600">
                        <![endif]-->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                
                          <!-- start unsubscribe -->
                          <tr>
                            <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                              <p style="margin: 0;">배틀이 BattleBot</p>
                              <p style="margin: 0;">사업자등록번호 - 870-10-01917</p>
                              <a href="https://battlebot.kr/help/privacy" target="_blank">개인정보 처리방침</a>
                              <a href="https://battlebot.kr/help/terms" target="_blank">서비스 이용약관</a>
                            </td>
                          </tr>
                          <!-- end unsubscribe -->
                
                        </table>
                        <!--[if (gte mso 9)|(IE)]>
                        </td>
                        </tr>
                        </table>
                        <![endif]-->
                      </td>
                    </tr>
                    <!-- end footer -->
                
                  </table>
                  <!-- end body -->
                
                </body>
                </html>` // 메일 내용
      }

      // 메일 발송
      transporter.sendMail(mailOptions, function (error: any, info) {
        if (error) {
          logger.error(error)
        } else {
          logger.log(info.response)
        }
      })
    } catch (e: any) {
      logger.error(e)
    }
  }
}
<script>
    function copyToClipboard(val) {
    let t = document.createElement("textarea");
    document.body.appendChild(t);
    t.value = val;
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    alert('인증코드가 복사되었습니다.');
    }
</script>

// 메일객체 exports
export default mailSender
