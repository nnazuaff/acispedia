<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class MailketingClient
{
    /**
     * @param  array<int, string>  $attachments  Direct URL attachments (max 2MB each on Mailketing side)
     * @return array{status?: string, response?: string}
     */
    public static function sendEmail(
        string $recipient,
        string $subject,
        string $content,
        array $attachments = [],
        ?string $fromName = null,
        ?string $fromEmail = null,
    ): array {
        $apiToken = (string) config('services.mailketing.api_token');
        $baseUrl = rtrim((string) config('services.mailketing.base_url', 'https://api.mailketing.co.id'), '/');

        if ($apiToken === '') {
            return [
                'status' => 'failed',
                'response' => 'Mail service is not configured.',
            ];
        }

        $payload = [
            'api_token' => $apiToken,
            'from_name' => $fromName ?? (string) config('services.mailketing.from_name'),
            'from_email' => $fromEmail ?? (string) config('services.mailketing.from_email'),
            'recipient' => $recipient,
            'subject' => $subject,
            'content' => $content,
        ];

        $i = 1;
        foreach ($attachments as $url) {
            if ($url === '') {
                continue;
            }

            $payload['attach'.$i] = $url;
            $i++;

            if ($i > 3) {
                break;
            }
        }

        try {
            $response = Http::asForm()
                ->acceptJson()
                ->timeout(20)
                ->post($baseUrl.'/api/v1/send', $payload)
                ->throw();

            $json = $response->json();

            if (is_array($json)) {
                return $json;
            }

            return [
                'status' => 'failed',
                'response' => 'Invalid mail API response.',
            ];
        } catch (RequestException) {
            return [
                'status' => 'failed',
                'response' => 'Failed to send email.',
            ];
        }
    }
}
