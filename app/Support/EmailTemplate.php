<?php

namespace App\Support;

class EmailTemplate
{
    /**
     * @param  array<int, string>  $introLines
     * @param  array<int, string>  $outroLines
     */
    public static function render(
        string $title,
        string $name,
        array $introLines,
        ?string $actionText = null,
        ?string $actionUrl = null,
        array $outroLines = [],
    ): string {
        $appName = (string) config('app.name', 'AcisPedia');
        $appUrl = rtrim((string) config('app.url', ''), '/');
        $logoUrl = $appUrl !== '' ? $appUrl.'/favicon.png' : '/favicon.png';

        $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
        $safeAppName = htmlspecialchars($appName, ENT_QUOTES, 'UTF-8');
        $safeName = trim($name) !== '' ? htmlspecialchars($name, ENT_QUOTES, 'UTF-8') : '';

        $introHtml = self::renderLines($introLines);
        $outroHtml = self::renderLines($outroLines);

        $buttonHtml = '';
        $fallbackHtml = '';

        if ($actionText && $actionUrl) {
            $safeActionText = htmlspecialchars($actionText, ENT_QUOTES, 'UTF-8');
            $safeActionUrl = htmlspecialchars($actionUrl, ENT_QUOTES, 'UTF-8');

            $buttonHtml = <<<HTML
            <div style="margin:24px 0;text-align:center;">
              <a href="{$safeActionUrl}" style="display:inline-block;background:#14b8a6;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;">{$safeActionText}</a>
            </div>
            HTML;

            $fallbackHtml = <<<HTML
            <p style="margin:16px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
              Jika tombol tidak berfungsi, salin & tempel link ini ke browser Anda:<br>
              <span style="word-break:break-all;">{$safeActionUrl}</span>
            </p>
            HTML;
        }

        $greeting = $safeName !== '' ? "Halo {$safeName}," : 'Halo,';

        $year = (int) date('Y');

        return <<<HTML
<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>{$safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Segoe UI Variable',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111827;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">{$safeTitle}</div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7f9;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;">
            <tr>
              <td style="padding:0 0 14px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="display:flex;align-items:center;gap:10px;">
                        <img src="{$logoUrl}" width="36" height="36" alt="{$safeAppName}" style="display:block;border-radius:10px;" />
                        <div>
                          <div style="font-weight:700;font-size:16px;line-height:1.2;">{$safeAppName}</div>
                          <div style="color:#6b7280;font-size:12px;line-height:1.2;">SMM Panel</div>
                        </div>
                      </div>
                    </td>
                    <td align="right" style="color:#6b7280;font-size:12px;">
                      {$safeTitle}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;padding:24px 24px 18px;">
                <h1 style="margin:0 0 10px;font-size:18px;line-height:1.3;">{$safeTitle}</h1>
                <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.6;">{$greeting}</p>

                <div style="color:#111827;font-size:14px;line-height:1.7;">
                  {$introHtml}
                </div>

                {$buttonHtml}
                {$fallbackHtml}

                <div style="margin-top:18px;color:#111827;font-size:14px;line-height:1.7;">
                  {$outroHtml}
                </div>

                <div style="margin-top:18px;border-top:1px solid #e5e7eb;padding-top:14px;color:#6b7280;font-size:12px;line-height:1.6;">
                  Email ini dikirim otomatis. Jika Anda tidak merasa melakukan permintaan ini, Anda dapat mengabaikannya.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 6px 0;color:#9ca3af;font-size:12px;text-align:center;line-height:1.6;">
                © {$year} {$safeAppName}. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
HTML;
    }

    /**
     * @param  array<int, string>  $lines
     */
    private static function renderLines(array $lines): string
    {
        if ($lines === []) {
            return '';
        }

        $out = '';

        foreach ($lines as $line) {
            $safe = htmlspecialchars($line, ENT_QUOTES, 'UTF-8');
            $out .= '<p style="margin:0 0 10px;">'.$safe.'</p>';
        }

        return $out;
    }
}
