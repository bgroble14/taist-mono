# OpenAI Service Usage Examples

This document provides examples of how to use the OpenAI service in your Laravel application.

## Basic Setup

The OpenAI service is already configured. Make sure your `.env` file has the `OPENAI_API_KEY` set.

## Default Model

The service defaults to **GPT-5 Mini** - faster and cost-efficient for well-defined tasks at $0.25/1M input tokens and $2.00/1M output tokens. Perfect for most use cases!

## Important: Responses API vs Chat Completions API

**GPT-5 models** (gpt-5-nano, gpt-5-mini, etc.) automatically use the **Responses API** - OpenAI's latest, recommended API.

**GPT-4 models** (gpt-4o-mini, gpt-4-turbo, etc.) use the **Chat Completions API** - the traditional API.

The service handles this automatically - you don't need to worry about it!

## Usage Examples

### 1. Simple Chat Completion (Uses GPT-5 Mini by Default)

```php
use App\Services\OpenAIService;

// Create service instance
$openai = new OpenAIService();

// Send a simple prompt - uses gpt-5-mini by default
$response = $openai->chat(
    prompt: "What are the three laws of robotics?"
);

if ($response['success']) {
    echo $response['content'];
    echo "\nTokens used: " . $response['usage']['total_tokens'];
    echo "\nCost: ~$" . number_format(($response['usage']['total_tokens'] / 1000000) * 0.40, 4);
} else {
    echo "Error: " . $response['error'];
}
```

### 2. Using Different GPT-5 Models

```php
$openai = new OpenAIService();

// GPT-5 Mini (Default) - Faster, cost-efficient for well-defined tasks
$response = $openai->chat(
    prompt: "Summarize this text...",
    model: OpenAIService::MODEL_GPT_5_MINI
);

// GPT-5 Nano - Fastest and cheapest
$response = $openai->chat(
    prompt: "What's the capital of France?",
    model: OpenAIService::MODEL_GPT_5_MINI
);

// GPT-5.1 - Best for complex coding and agentic tasks
$response = $openai->chat(
    prompt: "Explain quantum entanglement and write code to simulate it",
    model: OpenAIService::MODEL_GPT_5_1
);

// GPT-5.1 Codex - Specialized for code generation
$response = $openai->chat(
    prompt: "Write a Python function to calculate fibonacci",
    model: OpenAIService::MODEL_GPT_5_1_CODEX
);

// GPT-5 Pro - Most precise for critical tasks
$response = $openai->chat(
    prompt: "Analyze this complex business scenario...",
    model: OpenAIService::MODEL_GPT_5_PRO
);

// See all available models
$models = OpenAIService::getAvailableModels();
```

### 3. Customizing Response Parameters

```php
$openai = new OpenAIService();

// GPT-5 models use 'reasoning_effort' instead of 'temperature'
$response = $openai->chat(
    prompt: "Write a creative story about a robot chef",
    model: OpenAIService::MODEL_GPT_5_MINI,
    options: [
        'max_tokens' => 500,              // Maximum length of response
        'reasoning_effort' => 'minimal',  // 'minimal', 'medium', or 'high'
        'top_p' => 0.95,                  // Nucleus sampling
        'frequency_penalty' => 0.5,       // Reduce repetition (0-2)
        'presence_penalty' => 0.5,        // Encourage new topics (0-2)
    ]
);

// GPT-4 models support temperature parameter
$response = $openai->chat(
    prompt: "Write a creative story about a robot chef",
    model: OpenAIService::MODEL_GPT_4O_MINI,
    options: [
        'temperature' => 0.9,        // Higher = more creative (0-2)
        'max_tokens' => 500,
    ]
);
```

### 3a. Understanding Reasoning Effort (GPT-5 Only)

GPT-5 models support a `reasoning_effort` parameter instead of `temperature`:

- **'minimal'** - Fastest responses, few/no reasoning tokens (default for our service)
- **'medium'** - Balanced deliberation (OpenAI's default)
- **'high'** - More reasoning for complex problems

```php
// Fast response for simple tasks
$response = $openai->chat(
    prompt: "What is 2+2?",
    options: ['reasoning_effort' => 'minimal']
);

// More thoughtful for complex tasks
$response = $openai->chat(
    prompt: "Analyze this complex business scenario...",
    options: ['reasoning_effort' => 'high']
);
```

### 4. Chat with Conversation History

```php
$openai = new OpenAIService();

$messages = [
    [
        'role' => 'system',
        'content' => 'You are a helpful cooking assistant.'
    ],
    [
        'role' => 'user',
        'content' => 'What ingredients do I need for chocolate chip cookies?'
    ],
    [
        'role' => 'assistant',
        'content' => 'For chocolate chip cookies, you need: flour, butter, sugar, eggs, vanilla, baking soda, salt, and chocolate chips.'
    ],
    [
        'role' => 'user',
        'content' => 'Can I substitute the butter with oil?'
    ]
];

$response = $openai->chatWithHistory(
    messages: $messages,
    model: OpenAIService::MODEL_GPT_5_MINI
);

echo $response['content'];
```

### 5. Generate Text Embeddings

```php
$openai = new OpenAIService();

// Single text
$response = $openai->embeddings(
    input: "The quick brown fox jumps over the lazy dog"
);

if ($response['success']) {
    $embedding = $response['embeddings'][0]['embedding'];
    // Use embedding vector for semantic search, clustering, etc.
}

// Multiple texts
$response = $openai->embeddings(
    input: [
        "First text to embed",
        "Second text to embed",
        "Third text to embed"
    ]
);
```

### 6. In a Controller

```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OpenAIService;
use Illuminate\Http\Request;

class AIChatController extends Controller
{
    private OpenAIService $openai;

    public function __construct(OpenAIService $openai)
    {
        $this->openai = $openai;
    }

    public function generateRecipe(Request $request)
    {
        $request->validate([
            'ingredients' => 'required|string',
            'dietary_restrictions' => 'nullable|string',
        ]);

        $prompt = "Create a recipe using these ingredients: {$request->ingredients}";

        if ($request->dietary_restrictions) {
            $prompt .= "\nDietary restrictions: {$request->dietary_restrictions}";
        }

        $response = $this->openai->chat(
            prompt: $prompt,
            model: OpenAIService::MODEL_GPT_5_MINI,
            options: ['temperature' => 0.7]
        );

        if (!$response['success']) {
            return response()->json([
                'error' => 'Failed to generate recipe'
            ], 500);
        }

        return response()->json([
            'recipe' => $response['content'],
            'tokens_used' => $response['usage']['total_tokens']
        ]);
    }

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'conversation_history' => 'nullable|array',
        ]);

        $messages = $request->conversation_history ?? [];
        $messages[] = [
            'role' => 'user',
            'content' => $request->message
        ];

        $response = $this->openai->chatWithHistory(
            messages: $messages,
            model: OpenAIService::MODEL_GPT_5_MINI
        );

        if (!$response['success']) {
            return response()->json(['error' => 'Chat failed'], 500);
        }

        return response()->json([
            'response' => $response['content'],
            'updated_history' => array_merge($messages, [
                [
                    'role' => 'assistant',
                    'content' => $response['content']
                ]
            ])
        ]);
    }
}
```

### 7. Using in Artisan Command

```php
namespace App\Console\Commands;

use App\Services\OpenAIService;
use Illuminate\Console\Command;

class AskAI extends Command
{
    protected $signature = 'ai:ask {prompt}';
    protected $description = 'Ask a question to OpenAI';

    public function handle(OpenAIService $openai)
    {
        $prompt = $this->argument('prompt');

        $this->info('Thinking...');

        $response = $openai->chat(
            prompt: $prompt,
            model: OpenAIService::MODEL_GPT_5_MINI
        );

        if ($response['success']) {
            $this->line('');
            $this->line($response['content']);
            $this->line('');
            $this->comment('Tokens used: ' . $response['usage']['total_tokens']);
        } else {
            $this->error($response['error']);
        }
    }
}
```

Then use it from command line:
```bash
php artisan ai:ask "What is Laravel?"
```

## Available Models

### GPT-5 Series (Latest - Recommended)
- `OpenAIService::MODEL_GPT_5_MINI` - **Default** - Faster, cost-efficient for well-defined tasks ($0.25/1M in, $2.00/1M out)
- `OpenAIService::MODEL_GPT_5_MINI` - Faster, cost-efficient for well-defined tasks ($0.25/1M in, $2.00/1M out)
- `OpenAIService::MODEL_GPT_5` - Intelligent reasoning model ($1.25/1M in, $10.00/1M out)
- `OpenAIService::MODEL_GPT_5_1` - Best for coding and agentic tasks ($1.25/1M in, $10.00/1M out)
- `OpenAIService::MODEL_GPT_5_1_CHAT` - Latest chat version with adaptive reasoning
- `OpenAIService::MODEL_GPT_5_1_CODEX` - Specialized for code generation
- `OpenAIService::MODEL_GPT_5_PRO` - Smartest, most precise ($15.00/1M in, $120.00/1M out)

### GPT-4.1 Series (Non-reasoning Models)
- `OpenAIService::MODEL_GPT_4_1_NANO` - Fast non-reasoning ($0.10/1M in, $0.40/1M out)
- `OpenAIService::MODEL_GPT_4_1_MINI` - Efficient non-reasoning ($0.40/1M in, $1.60/1M out)
- `OpenAIService::MODEL_GPT_4_1` - Smartest non-reasoning ($2.00/1M in, $8.00/1M out)

### GPT-4 Series (Legacy)
- `OpenAIService::MODEL_GPT_4O` - Previous flagship multimodal model
- `OpenAIService::MODEL_GPT_4O_MINI` - Previous fast model
- `OpenAIService::MODEL_GPT_4_TURBO` - Legacy high-intelligence model
- `OpenAIService::MODEL_GPT_4` - Original GPT-4
- `OpenAIService::MODEL_GPT_35_TURBO` - Legacy fast model

## Response Structure

All methods return an array with this structure:

```php
[
    'success' => true/false,
    'content' => 'The AI response text',
    'model' => 'gpt-4o-mini',
    'usage' => [
        'prompt_tokens' => 20,
        'completion_tokens' => 100,
        'total_tokens' => 120
    ],
    'finish_reason' => 'stop',
    'raw_response' => [...] // Full API response
]
```

If there's an error:
```php
[
    'success' => false,
    'error' => 'Error message',
    'content' => null
]
```

## Best Practices

1. **Choose the right model**:
   - **GPT-5 Mini** (default) - Perfect for most tasks: summaries, classification, simple Q&A
   - **GPT-5 Nano** - Fastest and cheapest for simple tasks
   - **GPT-5.1 / GPT-5.1 Codex** - Complex coding, debugging, agentic tasks
   - **GPT-5 Pro** - Critical tasks requiring maximum precision

2. **Set max_tokens**: Limit response length to control costs

3. **Handle errors**: Always check `$response['success']` before using the content

4. **Reasoning Effort (GPT-5) vs Temperature (GPT-4)**:
   - **GPT-5 Models**: Use `reasoning_effort`
     - `'minimal'`: Fast, simple tasks
     - `'medium'`: Balanced (default)
     - `'high'`: Complex reasoning
   - **GPT-4 Models**: Use `temperature`
     - Low (0-0.3): Factual, consistent
     - Medium (0.4-0.7): Balanced
     - High (0.8-2.0): Creative

5. **Monitor usage**: Track token consumption in `$response['usage']`

6. **Cost optimization**:
   - Start with GPT-5 Mini (default) and upgrade only if needed
   - Use `reasoning_effort: 'minimal'` for simple tasks
   - Set reasonable max_tokens limits
   - GPT-5 Mini with minimal reasoning = good balance of speed and quality

## Real-World Example: Menu Description Generator

This is used in our Taist app to generate professional menu descriptions:

```php
use App\Services\OpenAIService;

$openai = new OpenAIService();

$dishName = "Grilled Chicken Bowl";

$prompt = "You are a professional food writer for a personal chef marketplace.
Write a compelling, appetizing menu description for: {$dishName}

Guidelines:
- Keep it 1-2 sentences (40-80 words)
- Focus on flavors, textures, and key ingredients
- Use appealing, sensory language
- Professional but approachable tone

Description:";

$response = $openai->chat(
    prompt: $prompt,
    model: OpenAIService::MODEL_GPT_5_MINI,
    options: [
        'max_tokens' => 200,
        'reasoning_effort' => 'minimal'  // Fast response
    ]
);

if ($response['success']) {
    $description = $response['content'];
    // "Juicy grilled chicken sits atop fluffy rice, drizzled with
    // zesty lemon-tahini glaze and crowned with crisp veggies..."

    $cost = ($response['usage']['total_tokens'] / 1000000) * 0.40;
    // Cost: ~$0.000035 (extremely affordable!)
}
```

## Technical Details

### API Endpoints Used

The service automatically selects the correct API:

**For GPT-5 models:**
- Endpoint: `https://api.openai.com/v1/responses`
- Request format:
  ```json
  {
    "model": "gpt-5-mini",
    "input": [{"role": "user", "content": "..."}],
    "max_output_tokens": 200,
    "reasoning": {"effort": "minimal"}
  }
  ```
- Response: Extracts from `output[].content[].text`

**For GPT-4 models:**
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Request format:
  ```json
  {
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "..."}],
    "max_completion_tokens": 200,
    "temperature": 0.7
  }
  ```
- Response: Extracts from `choices[0].message.content`

### Why Responses API for GPT-5?

OpenAI recommends the Responses API for GPT-5 models because:
- ✅ Better performance and latency
- ✅ Stateful conversation management
- ✅ Support for advanced features (tools, streaming)
- ✅ Future-proof (replacing Chat Completions)
