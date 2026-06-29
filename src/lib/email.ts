import { Resend } from "resend";

const FROM = `${process.env.EMAIL_FROM_NAME || "Alutta"} <${process.env.EMAIL_FROM || "hello@alutta.com"}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alutta.com";

// Logo must be an absolute public URL — email clients block base64 data URIs.
// The PNG is served from /public/brand/ on Vercel once deployed.
const LOGO_URL = `${APP_URL}/brand/logo-horizontal-white-text.png`;

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required.");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendWaitlistConfirmation({
  firstName,
  email,
  referralCode,
}: {
  firstName: string;
  email: string;
  referralCode: string;
}) {
  const referralLink = `${APP_URL}?ref=${referralCode}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You are on the Alutta waitlist</title>
</head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#003024;padding:28px 40px;">
              <img
                src="${LOGO_URL}"
                alt="Alutta"
                width="130"
                height="32"
                style="display:block;border:0;outline:none;text-decoration:none;max-width:130px;height:auto;"
              />
              <p style="margin:8px 0 0;font-size:13px;color:#13CA58;letter-spacing:1px;">INTERNATIONAL STUDENT PLATFORM</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#003024;">
                You are on the list, ${firstName}! 🎉
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#4b5563;line-height:1.6;">
                You are officially on the Alutta waitlist.
                We are building the platform that makes studying abroad
                clear, affordable, and stress-free, and you will be among the first to experience it.
              </p>

              <!-- What is coming -->
              <div style="background:#f0f7ff;border-radius:12px;padding:24px;margin:0 0 28px;">
                <p style="margin:0 0 14px;font-size:14px;font-weight:600;color:#003024;text-transform:uppercase;letter-spacing:0.5px;">What you are getting early access to</p>
                <table cellpadding="0" cellspacing="0" width="100%">
                  ${[
                    ["🗺️", "Journey Map", "Your personalised 12-step study abroad timeline"],
                    ["💳", "FX Payments", "Sub-1.5% margin on tuition & visa fees, saving you $1,500+"],
                    ["✈️", "Settlement Bundle", "Airport pickup, SIM card & bank setup on arrival"],
                    ["🛡️", "Visa Support", "Guided checklists & deadline tracking"],
                  ].map(([emoji, title, desc]) => `
                  <tr>
                    <td style="padding:6px 0;vertical-align:top;width:28px;">
                      <span style="font-size:18px;">${emoji}</span>
                    </td>
                    <td style="padding:6px 0 6px 8px;vertical-align:top;">
                      <p style="margin:0;font-size:14px;font-weight:600;color:#003024;">${title}</p>
                      <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${desc}</p>
                    </td>
                  </tr>`).join("")}
                </table>
              </div>

              <!-- Referral section -->
              <div style="border:2px solid #e0eaff;border-radius:12px;padding:24px;margin:0 0 28px;">
                <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#003024;">Share your early access link</p>
                <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.5;">
                  Know someone else planning to study abroad? Share your personal link:
                </p>
                <div style="background:#f8f7f4;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;word-break:break-all;">
                  <a href="${referralLink}" style="font-size:13px;color:#13CA58;text-decoration:none;font-weight:500;">${referralLink}</a>
                </div>
                <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;">Copy this link and share it on WhatsApp, Twitter/X, or with friends who are planning to study abroad.</p>
              </div>

              <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.6;">
                We are moving fast. Expect to hear from us soon.
                And in the meantime, follow us on
                <a href="https://twitter.com/aluttahq" style="color:#13CA58;text-decoration:none;">Twitter/X</a>,
                <a href="https://instagram.com/aluttahq" style="color:#13CA58;text-decoration:none;">Instagram</a>, and
                <a href="https://www.tiktok.com/@aluttahq" style="color:#13CA58;text-decoration:none;">TikTok</a>
                for updates.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f7f4;padding:24px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
                You are receiving this because you signed up to the waitlist at alutta.com.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} Alutta Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: `You are on the Alutta waitlist, ${firstName} 🎉`,
    html,
  });
}
