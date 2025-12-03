<?php

namespace App\Services;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;
use Exception;

class TwilioService
{
    protected $client;
    protected $fromNumber;
    protected $enabled;

    public function __construct()
    {
        $this->enabled = !empty(env('TWILIO_SID')) &&
                        !empty(env('TWILIO_TOKEN')) &&
                        !empty(env('TWILIO_FROM'));

        if ($this->enabled) {
            $sid = env('TWILIO_SID');
            $token = env('TWILIO_TOKEN');
            $this->fromNumber = env('TWILIO_FROM');
            $this->client = new Client($sid, $token);
        }
    }

    /**
     * Send SMS verification code
     *
     * @param string $phoneNumber
     * @param string $code
     * @return array ['success' => bool, 'error' => string|null]
     */
    public function sendVerificationCode($phoneNumber, $code)
    {
        // Clean phone number
        $phone = preg_replace('/\s+/', '', $phoneNumber);

        if (!$this->enabled) {
            Log::warning('Twilio credentials not configured. Cannot send SMS verification.', [
                'phone' => $phone
            ]);
            return [
                'success' => false,
                'error' => 'SMS service not configured'
            ];
        }

        try {
            $message = "Your Taist verification code is: " . $code;

            $this->client->messages->create(
                $phone,
                [
                    'from' => $this->fromNumber,
                    'body' => $message
                ]
            );

            Log::info('SMS verification code sent successfully', [
                'phone' => $phone
            ]);

            return [
                'success' => true,
                'error' => null
            ];
        } catch (Exception $e) {
            $errorMsg = $e->getMessage();
            Log::error('Failed to send SMS verification code', [
                'phone' => $phone,
                'error' => $errorMsg
            ]);

            return [
                'success' => false,
                'error' => $errorMsg
            ];
        }
    }

    /**
     * Check if Twilio service is enabled and configured
     *
     * @return bool
     */
    public function isEnabled()
    {
        return $this->enabled;
    }
}
