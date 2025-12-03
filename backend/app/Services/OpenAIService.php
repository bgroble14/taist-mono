<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    private string $apiKey;
    private string $baseUrl = 'https://api.openai.com/v1';

    // GPT-5 Models (Latest)
    public const MODEL_GPT_5_1 = 'gpt-5.1';
    public const MODEL_GPT_5_1_CHAT = 'gpt-5.1-chat-latest';
    public const MODEL_GPT_5_1_CODEX = 'gpt-5.1-codex';
    public const MODEL_GPT_5 = 'gpt-5';
    public const MODEL_GPT_5_CHAT = 'gpt-5-chat-latest';
    public const MODEL_GPT_5_CODEX = 'gpt-5-codex';
    public const MODEL_GPT_5_PRO = 'gpt-5-pro';
    public const MODEL_GPT_5_MINI = 'gpt-5-mini';
    public const MODEL_GPT_5_NANO = 'gpt-5-nano';

    // GPT-4.1 Models
    public const MODEL_GPT_4_1 = 'gpt-4.1';
    public const MODEL_GPT_4_1_MINI = 'gpt-4.1-mini';
    public const MODEL_GPT_4_1_NANO = 'gpt-4.1-nano';

    // GPT-4 Models (Legacy)
    public const MODEL_GPT_4O = 'gpt-4o';
    public const MODEL_GPT_4O_MINI = 'gpt-4o-mini';
    public const MODEL_GPT_4_TURBO = 'gpt-4-turbo';
    public const MODEL_GPT_4 = 'gpt-4';
    public const MODEL_GPT_35_TURBO = 'gpt-3.5-turbo';

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key') ?? env('OPENAI_API_KEY');

        if (empty($this->apiKey)) {
            throw new Exception('OpenAI API key is not configured');
        }
    }

    /**
     * Send a chat completion request to OpenAI
     *
     * @param string $prompt The prompt to send
     * @param string $model The model to use (default: gpt-5-nano)
     * @param array $options Additional options like temperature, max_tokens, etc.
     * @return array Response containing the completion and metadata
     * @throws Exception
     */
    public function chat(
        string $prompt,
        string $model = self::MODEL_GPT_5_NANO,
        array $options = []
    ): array {
        try {
            // Check if model is GPT-5 to determine API to use
            $isGPT5 = str_starts_with($model, 'gpt-5');

            // Responses API for GPT-5 models (recommended)
            // Chat Completions API for GPT-4 and earlier
            if ($isGPT5) {
                // Responses API format
                $payload = [
                    'model' => $model,
                    'input' => [
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'max_output_tokens' => $options['max_tokens'] ?? 1000,
                    'reasoning' => [
                        'effort' => $options['reasoning_effort'] ?? 'minimal'
                    ]
                ];

                $endpoint = $this->baseUrl . '/responses';
            } else {
                // Chat Completions API format (GPT-4 and earlier)
                $payload = [
                    'model' => $model,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'max_completion_tokens' => $options['max_tokens'] ?? 1000,
                ];

                if (isset($options['temperature'])) {
                    $payload['temperature'] = $options['temperature'];
                }

                $endpoint = $this->baseUrl . '/chat/completions';
            }

            // Add optional parameters if provided
            if (isset($options['top_p'])) {
                $payload['top_p'] = $options['top_p'];
            }
            if (isset($options['frequency_penalty'])) {
                $payload['frequency_penalty'] = $options['frequency_penalty'];
            }
            if (isset($options['presence_penalty'])) {
                $payload['presence_penalty'] = $options['presence_penalty'];
            }
            if (isset($options['stop'])) {
                $payload['stop'] = $options['stop'];
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($endpoint, $payload);

            if (!$response->successful()) {
                Log::error('OpenAI API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new Exception('OpenAI API request failed: ' . $response->body());
            }

            $data = $response->json();

            // Parse response based on API type
            if ($isGPT5) {
                // Responses API format
                // Extract text from output array
                $content = '';
                if (isset($data['output']) && is_array($data['output'])) {
                    foreach ($data['output'] as $outputItem) {
                        if ($outputItem['type'] === 'message' && isset($outputItem['content'])) {
                            foreach ($outputItem['content'] as $contentItem) {
                                if ($contentItem['type'] === 'output_text') {
                                    $content = $contentItem['text'] ?? '';
                                    break 2;
                                }
                            }
                        }
                    }
                }

                return [
                    'success' => true,
                    'content' => $content,
                    'model' => $data['model'] ?? $model,
                    'usage' => [
                        'prompt_tokens' => $data['usage']['input_tokens'] ?? 0,
                        'completion_tokens' => $data['usage']['output_tokens'] ?? 0,
                        'total_tokens' => $data['usage']['total_tokens'] ?? 0,
                    ],
                    'finish_reason' => $data['status'] ?? 'unknown',
                    'raw_response' => $data
                ];
            } else {
                // Chat Completions API format
                $content = $data['choices'][0]['message']['content'] ?? '';

                return [
                    'success' => true,
                    'content' => $content,
                    'model' => $data['model'] ?? $model,
                    'usage' => [
                        'prompt_tokens' => $data['usage']['prompt_tokens'] ?? 0,
                        'completion_tokens' => $data['usage']['completion_tokens'] ?? 0,
                        'total_tokens' => $data['usage']['total_tokens'] ?? 0,
                    ],
                    'finish_reason' => $data['choices'][0]['finish_reason'] ?? 'unknown',
                    'raw_response' => $data
                ];
            }

        } catch (Exception $e) {
            Log::error('OpenAI Service Error', [
                'message' => $e->getMessage(),
                'prompt' => $prompt,
                'model' => $model
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'content' => null
            ];
        }
    }

    /**
     * Send a chat completion request with conversation history
     *
     * @param array $messages Array of messages with 'role' and 'content'
     * @param string $model The model to use
     * @param array $options Additional options
     * @return array Response containing the completion and metadata
     */
    public function chatWithHistory(
        array $messages,
        string $model = self::MODEL_GPT_5_NANO,
        array $options = []
    ): array {
        try {
            $payload = [
                'model' => $model,
                'messages' => $messages,
                'temperature' => $options['temperature'] ?? 0.7,
                'max_completion_tokens' => $options['max_tokens'] ?? 1000,
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($this->baseUrl . '/chat/completions', $payload);

            if (!$response->successful()) {
                throw new Exception('OpenAI API request failed: ' . $response->body());
            }

            $data = $response->json();

            return [
                'success' => true,
                'content' => $data['choices'][0]['message']['content'] ?? '',
                'model' => $data['model'] ?? $model,
                'usage' => $data['usage'] ?? [],
                'raw_response' => $data
            ];

        } catch (Exception $e) {
            Log::error('OpenAI Service Error (with history)', [
                'message' => $e->getMessage(),
                'model' => $model
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'content' => null
            ];
        }
    }

    /**
     * Generate embeddings for text
     *
     * @param string|array $input Text or array of texts to generate embeddings for
     * @param string $model Embedding model to use (default: text-embedding-3-small)
     * @return array
     */
    public function embeddings($input, string $model = 'text-embedding-3-small'): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/embeddings', [
                'model' => $model,
                'input' => $input
            ]);

            if (!$response->successful()) {
                throw new Exception('OpenAI embeddings request failed: ' . $response->body());
            }

            $data = $response->json();

            return [
                'success' => true,
                'embeddings' => $data['data'] ?? [],
                'usage' => $data['usage'] ?? [],
                'raw_response' => $data
            ];

        } catch (Exception $e) {
            Log::error('OpenAI Embeddings Error', [
                'message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'embeddings' => null
            ];
        }
    }

    /**
     * Get available models list
     *
     * @return array
     */
    public static function getAvailableModels(): array
    {
        return [
            // GPT-5 Series (Latest - Recommended)
            self::MODEL_GPT_5_NANO => 'GPT-5 Nano - Fastest, most cost-efficient ($0.05/1M in, $0.40/1M out) [RECOMMENDED DEFAULT]',
            self::MODEL_GPT_5_MINI => 'GPT-5 Mini - Faster, cost-efficient for well-defined tasks ($0.25/1M in, $2.00/1M out)',
            self::MODEL_GPT_5 => 'GPT-5 - Intelligent reasoning model for coding and agentic tasks ($1.25/1M in, $10.00/1M out)',
            self::MODEL_GPT_5_1 => 'GPT-5.1 - Best model for coding and agentic tasks with configurable reasoning ($1.25/1M in, $10.00/1M out)',
            self::MODEL_GPT_5_1_CHAT => 'GPT-5.1 Chat Latest - Latest chat version with adaptive reasoning',
            self::MODEL_GPT_5_1_CODEX => 'GPT-5.1 Codex - Specialized for code generation and editing',
            self::MODEL_GPT_5_PRO => 'GPT-5 Pro - Smarter, more precise responses ($15.00/1M in, $120.00/1M out)',

            // GPT-4.1 Series
            self::MODEL_GPT_4_1_NANO => 'GPT-4.1 Nano - Fast non-reasoning model ($0.10/1M in, $0.40/1M out)',
            self::MODEL_GPT_4_1_MINI => 'GPT-4.1 Mini - Efficient non-reasoning model ($0.40/1M in, $1.60/1M out)',
            self::MODEL_GPT_4_1 => 'GPT-4.1 - Smartest non-reasoning model ($2.00/1M in, $8.00/1M out)',

            // GPT-4 Series (Legacy)
            self::MODEL_GPT_4O => 'GPT-4o - Previous flagship multimodal model ($2.50/1M in, $10.00/1M out)',
            self::MODEL_GPT_4O_MINI => 'GPT-4o Mini - Previous fast model ($0.15/1M in, $0.60/1M out)',
            self::MODEL_GPT_4_TURBO => 'GPT-4 Turbo - Legacy high-intelligence model',
            self::MODEL_GPT_4 => 'GPT-4 - Original GPT-4 model',
            self::MODEL_GPT_35_TURBO => 'GPT-3.5 Turbo - Legacy fast model',
        ];
    }
}
