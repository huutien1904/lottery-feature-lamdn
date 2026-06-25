import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly webOrigin: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY') ?? '';
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from =
      this.config.get<string>('EMAIL_FROM') ??
      'Random Lucky <noreply@randomlucky.app>';
    this.webOrigin = (
      this.config.get<string>('WEB_APP_ORIGIN') ?? 'http://localhost:3000'
    ).replace(/\/$/, '');
  }

  async sendWelcomeEmail(params: {
    to: string;
    fullName: string;
    locale: 'vi' | 'en';
  }): Promise<void> {
    const { to, fullName, locale } = params;
    const isVi = locale === 'vi';

    if (!this.resend) {
      this.logger.warn(
        `[DEV — no RESEND_API_KEY] Welcome email would be sent to ${to}`,
      );
      return;
    }

    const subject = isVi
      ? 'Chào mừng đến với Random Lucky!'
      : 'Welcome to Random Lucky!';

    const greeting = isVi ? `Xin chào ${fullName},` : `Hello ${fullName},`;
    const body = isVi
      ? 'Tài khoản <strong>Random Lucky</strong> của bạn đã được tạo thành công thông qua Google. Bạn có thể đăng nhập bất cứ lúc nào bằng tài khoản Google.'
      : 'Your <strong>Random Lucky</strong> account has been created successfully via Google. You can sign in anytime using your Google account.';
    const btnText = isVi ? 'Vào trang chủ' : 'Go to Dashboard';
    const year = new Date().getFullYear();

    const html = `<!DOCTYPE html>
<html lang="${isVi ? 'vi' : 'en'}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" role="presentation"
             style="background:#ffffff;border-radius:16px;padding:40px 36px;max-width:480px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr><td>
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.1em;color:#1a56db;text-transform:uppercase;">Random Lucky</p>
          <h1 style="margin:0 0 20px;color:#0a1128;font-size:22px;font-weight:700;">${greeting}</h1>
          <p style="margin:0 0 28px;color:#4b5563;font-size:15px;line-height:1.7;">${body}</p>
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr><td style="border-radius:8px;background:#1a56db;">
              <a href="${this.webOrigin}"
                 style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;"
                 target="_blank">${btnText}</a>
            </td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">© ${year} Random Lucky</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
      const result = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });
      if ('error' in result && result.error) {
        this.logger.warn(
          `Resend rejected welcome email to ${to}: ${JSON.stringify(result.error)}`,
        );
      } else {
        this.logger.log(`Welcome email sent to ${to}`);
      }
    } catch (err) {
      this.logger.warn(
        `Failed to send welcome email to ${to}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async sendVerificationEmail(params: {
    to: string;
    fullName: string;
    token: string;
    locale: 'vi' | 'en';
  }): Promise<void> {
    const { to, fullName, token, locale } = params;
    const link = `${this.webOrigin}/${locale}/auth/verify-email?token=${token}`;
    const isVi = locale === 'vi';

    if (!this.resend) {
      this.logger.warn(
        `[DEV — no RESEND_API_KEY] Verification link for ${to}: ${link}`,
      );
      return;
    }

    const subject = isVi
      ? 'Xác nhận email của bạn — Random Lucky'
      : 'Verify your email — Random Lucky';

    try {
      const result = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html: this.buildHtml({ fullName, link, isVi }),
      });
      if ('error' in result && result.error) {
        this.logger.warn(
          `Resend rejected email to ${to}: ${JSON.stringify(result.error)}`,
        );
      } else {
        this.logger.log(
          `Verification email sent to ${to} (id: ${(result.data as { id?: string })?.id ?? 'n/a'})`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `Failed to send verification email to ${to}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private buildHtml(p: {
    fullName: string;
    link: string;
    isVi: boolean;
  }): string {
    const { fullName, link, isVi } = p;
    const year = new Date().getFullYear();

    const greeting = isVi ? `Xin chào ${fullName},` : `Hello ${fullName},`;
    const body = isVi
      ? 'Cảm ơn bạn đã đăng ký <strong>Random Lucky</strong>! Nhấp vào nút bên dưới để xác nhận địa chỉ email và bắt đầu sử dụng tài khoản của bạn.'
      : 'Thanks for signing up for <strong>Random Lucky</strong>! Click the button below to verify your email address and activate your account.';
    const btnText = isVi ? 'Xác nhận email' : 'Verify Email';
    const expiry = isVi
      ? 'Liên kết có hiệu lực trong <strong>24 giờ</strong>. Nếu bạn không đăng ký, hãy bỏ qua email này.'
      : 'This link is valid for <strong>24 hours</strong>. If you did not sign up, you can safely ignore this email.';
    const footer = isVi
      ? `© ${year} Random Lucky. Gửi tự động — vui lòng không trả lời email này.`
      : `© ${year} Random Lucky. This is an automated message — please do not reply.`;

    return `<!DOCTYPE html>
<html lang="${isVi ? 'vi' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${isVi ? 'Xác nhận email' : 'Verify email'}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" role="presentation"
             style="background:#ffffff;border-radius:16px;padding:40px 36px;max-width:480px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr><td>
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.1em;color:#1a56db;text-transform:uppercase;">Random Lucky</p>
          <h1 style="margin:0 0 20px;color:#0a1128;font-size:22px;font-weight:700;">${greeting}</h1>
          <p style="margin:0 0 28px;color:#4b5563;font-size:15px;line-height:1.7;">${body}</p>
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr><td style="border-radius:8px;background:#1a56db;">
              <a href="${link}"
                 style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;"
                 target="_blank">${btnText}</a>
            </td></tr>
          </table>
          <p style="margin:28px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">${expiry}</p>
          <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;word-break:break-all;">
            ${isVi ? 'Hoặc sao chép liên kết:' : 'Or copy the link:'} <a href="${link}" style="color:#6b7280;">${link}</a>
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">${footer}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }
}
