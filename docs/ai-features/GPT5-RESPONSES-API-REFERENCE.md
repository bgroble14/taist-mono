# GPT-5 and Responses API Reference Documentation

## GPT-5 Model Overview

GPT-5 is OpenAI's latest reasoning-capable model series with three variants:
- **gpt-5**: Full reasoning model
- **gpt-5-mini**: Balanced reasoning and performance
- **gpt-5-nano**: Ultra-light, low-latency variant for real-time applications

### Model Characteristics

**GPT-5 Nano**:
- Fastest and most cost-effective GPT-5 variant
- Designed for cost-sensitive, real-time applications
- Maintains GPT-5 instruction-following improvements
- Trades off reasoning depth for very low latency and token cost
- Model ID: `gpt-5-nano-2025-08-07`

---

## Key Parameters

### 1. reasoning_effort

Controls how much computational effort the model dedicates to processing requests.

**Values:**
- `"minimal"` - Few or no reasoning tokens, fastest response
- `"medium"` - Default, balanced deliberation (used if not specified)
- `"high"` - More reasoning tokens for complex multi-step problems

**When to use minimal:**
- Deterministic, lightweight tasks
- Extraction, formatting, short rewrites
- Simple classification
- When speed and time-to-first-token are critical
- ❌ Avoid for multi-step planning or tool-heavy workflows

**When to use high:**
- Complex reasoning tasks
- Multi-step problem solving
- When quality matters more than speed

**API Usage:**
```python
reasoning = { "effort": "minimal" }
```

```php
$payload = [
    'model' => 'gpt-5-nano',
    'reasoning_effort' => 'minimal',
    // ... other parameters
];
```

### 2. temperature

**GPT-5 Models:** Only support default temperature value of `1`
- ❌ Do NOT send custom temperature values with GPT-5 models
- API will return error if custom temperature is provided

**GPT-4 and Earlier:** Support custom temperature values (0-2)
- Can use 0.7 for more focused outputs
- Can use higher values for creative outputs

### 3. max_completion_tokens

Replaces the deprecated `max_tokens` parameter.

```php
$payload = [
    'max_completion_tokens' => 200  // Not 'max_tokens'
];
```

### 4. verbosity (Optional)

Controls output expansion level:
- `"low"` - Concise responses
- `"medium"` - Default
- `"high"` - Detailed explanations

---

## Responses API

**Status:** Recommended API for GPT-5 models

### What is Responses API?

The Responses API is a new unified, stateful interface that:
- Combines chat completions and assistants capabilities
- Supports multiple model types (GPT-5 series, GPT-4o, reasoning models)
- Provides stateful conversation management
- Enables response chaining

### Key Features

**Stateful Management:**
- Maintains conversation state across turns
- Chain responses by passing `previous_response_id`

**Streaming Support:**
- Real-time token delivery for long-running tasks
- Background task processing

**Multi-Modal:**
- Image input/output
- PDF processing
- File I/O with code interpreter

### Primary Methods

**1. Create Response:**
```python
response = client.responses.create(
    model="gpt-5-nano",
    input=[
        {'role': 'developer', 'content': system_prompt},
        {'role': 'user', 'content': user_message}
    ],
    reasoning = {
        "effort": "minimal"
    }
)
```

**2. Retrieve Response:**
```python
response = client.responses.retrieve(response_id)
```

**3. Delete Response:**
```python
client.responses.delete(response_id)  # 30-day default retention
```

**4. Chain Responses:**
```python
response = client.responses.create(
    model="gpt-5-nano",
    previous_response_id="resp_abc123",
    input=[...]
)
```

---

## Chat Completions API (Current Implementation)

While Responses API is recommended, Chat Completions API still works:

```php
POST https://api.openai.com/v1/chat/completions

{
    "model": "gpt-5-nano",
    "messages": [
        {
            "role": "user",
            "content": "Your prompt here"
        }
    ],
    "reasoning_effort": "minimal",
    "max_completion_tokens": 200
}
```

**Response Format:**
```json
{
    "id": "chatcmpl-xxx",
    "object": "chat.completion",
    "created": 1234567890,
    "model": "gpt-5-nano-2025-08-07",
    "choices": [{
        "index": 0,
        "message": {
            "role": "assistant",
            "content": "Response text here"
        },
        "finish_reason": "stop"
    }],
    "usage": {
        "prompt_tokens": 30,
        "completion_tokens": 50,
        "total_tokens": 80,
        "completion_tokens_details": {
            "reasoning_tokens": 0  // With minimal effort
        }
    }
}
```

---

## Best Practices for Our Implementation

### For Menu Description Generation (Fast, Simple)

```php
$result = $openAI->chat(
    $prompt,
    OpenAIService::MODEL_GPT_5_NANO,
    [
        'max_tokens' => 200,
        'reasoning_effort' => 'minimal'  // Fast responses
    ]
);
```

### For Enhancement/Grammar Check (Quality)

```php
$result = $openAI->chat(
    $prompt,
    OpenAIService::MODEL_GPT_5_NANO,
    [
        'max_tokens' => 200,
        'reasoning_effort' => 'minimal'  // Still fast, good enough
    ]
);
```

### For Metadata Analysis (Accuracy)

```php
$result = $openAI->chat(
    $prompt,
    OpenAIService::MODEL_GPT_5_NANO,
    [
        'max_tokens' => 150,
        'reasoning_effort' => 'medium'  // Better accuracy for JSON
    ]
);
```

---

## Migration to Responses API (Future)

When ready to migrate:

**1. Update Endpoint:**
```php
// From
Http::post('https://api.openai.com/v1/chat/completions', $payload)

// To
Http::post('https://api.openai.com/v1/responses', $payload)
```

**2. Update Payload Structure:**
```php
// From
$payload = [
    'model' => 'gpt-5-nano',
    'messages' => [['role' => 'user', 'content' => $prompt]]
];

// To
$payload = [
    'model' => 'gpt-5-nano',
    'input' => [['role' => 'user', 'content' => $prompt]],
    'reasoning' => ['effort' => 'minimal']
];
```

**3. Update Response Parsing:**
```php
// From
$content = $data['choices'][0]['message']['content'];

// To
$content = $data['output_text'];  // Or check response structure
```

---

## Troubleshooting

### Issue: Empty Content in Response

**Problem:** Response shows reasoning_tokens but content is empty

**Solution:** Add `reasoning_effort: 'minimal'` parameter

**Why:** Default reasoning effort may output reasoning tokens without visible content

### Issue: "Unsupported parameter: temperature"

**Problem:** GPT-5 models reject custom temperature

**Solution:** Only send temperature for GPT-4 and earlier models

```php
$isGPT5 = str_starts_with($model, 'gpt-5');
if (!$isGPT5) {
    $payload['temperature'] = 0.7;
}
```

### Issue: "Unsupported parameter: max_tokens"

**Problem:** Newer models use different parameter name

**Solution:** Use `max_completion_tokens` instead

```php
$payload['max_completion_tokens'] = 200;  // Not max_tokens
```

---

## Cost Analysis

**GPT-5-nano Pricing:**
- Input: $0.05 per 1M tokens
- Output: $0.40 per 1M tokens

**With minimal reasoning_effort:**
- Fewer reasoning tokens consumed
- Faster time-to-first-token
- Lower overall cost

**Example Cost per Menu Item:**
- Description generation (200 tokens): ~$0.00008
- Enhancement (200 tokens): ~$0.00008
- Metadata analysis (150 tokens): ~$0.00006
- **Total: ~$0.00022 per menu item**

---

## References

- [GPT-5 New Parameters Documentation](https://cookbook.openai.com/examples/gpt-5/gpt-5_new_params_and_tools)
- [GPT-5 Reasoning Effort Guide](https://www.arsturn.com/blog/gpt-5-reasoning-effort-levels-explained)
- [Azure OpenAI Responses API](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/responses?view=foundry-classic)
- [OpenAI GPT-5 Developer Guide](https://www.datacamp.com/tutorial/openai-gpt-5-api)
- [OpenAI Developer Community - GPT-5-Nano Parameters](https://community.openai.com/t/gpt-5-nano-accepted-parameters/1355086)

---

**Last Updated:** 2025-12-02
**Implementation Status:** ✅ Updated with reasoning_effort=minimal
