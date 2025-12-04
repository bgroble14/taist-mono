# AI Menu Description Feature - Implementation Plan

## Overview
Implement AI-powered menu item description generation and enhancement using the existing OpenAI service. The feature will help chefs create professional, appealing menu descriptions with minimal effort.

## User Flow

### Step 1: Name Input (StepMenuItemName)
- User enters dish name (e.g., "Grilled lemon-garlic chicken bowl")
- When clicking "Continue", the app sends the dish name to OpenAI to generate a description
- Description is stored in menuItemData for use in the next step

### Step 2: Description Page (StepMenuItemDescription)
- Show empty text input field (existing)
- Display "Start with AI Description" button that populates the field with the AI-generated description
- User can either:
  - Click the AI button to use the generated description as a starting point
  - Type their own description from scratch
- Description becomes editable text after being populated (regardless of source)

### Step 3: Pre-save Enhancement & Validation
- Before saving to backend, if user edited the AI description OR wrote their own:
  - AI performs spell check and grammar correction
  - Show "How does this look?" preview
  - User confirms or makes final edits
  - Whatever they confirm is what gets saved

### Step 4: AI Auto-population (same save flow)
- AI analyzes the final description and pre-populates:
  - Estimated prep time (`estimated_time`)
  - Required appliances (`appliances`)
  - Allergen information (`allergens`)
- User can still modify these values in subsequent steps

---

## Code Changes Required

### 1. Backend API Endpoints

#### **File: `/backend/app/Http/Controllers/MapiController.php`**

Add new endpoint for AI description generation (after line ~1022):

```php
/**
 * Generate AI description for menu item
 */
public function generateMenuDescription(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied. Api key is not valid."]);

    $user = $this->_authUser();

    try {
        $openAI = new \App\Services\OpenAIService();

        $dishName = $request->dish_name;
        $prompt = $this->buildDescriptionPrompt($dishName);

        $result = $openAI->chat(
            $prompt,
            \App\Services\OpenAIService::MODEL_GPT_5_NANO,
            ['temperature' => 0.7, 'max_tokens' => 200]
        );

        if ($result['success']) {
            return response()->json([
                'success' => 1,
                'description' => trim($result['content'])
            ]);
        } else {
            return response()->json([
                'success' => 0,
                'error' => 'Failed to generate description'
            ]);
        }
    } catch (\Exception $e) {
        return response()->json([
            'success' => 0,
            'error' => $e->getMessage()
        ]);
    }
}

/**
 * Build prompt for menu description generation
 */
private function buildDescriptionPrompt(string $dishName): string
{
    return "You are a professional food writer for a personal chef marketplace app called Taist. Customers browse menu items and hire chefs to cook these dishes for them at home.

Write a compelling, appetizing menu description for: {$dishName}

Guidelines:
- Keep it 1-2 sentences (40-80 words)
- Focus on flavors, textures, and key ingredients
- Use appealing, sensory language
- Sound professional but approachable
- Proper grammar and punctuation
- No emojis or excessive adjectives

Examples of good descriptions:
1. \"Grilled lemon-garlic chicken (or tofu), turmeric quinoa, roasted rainbow veggies, avocado fan, tahini-lime drizzle, and microgreens\"
2. \"Chickpea pasta in roasted red pepper cashew cream, sautéed spinach, blistered cherry tomatoes, tomato basil chicken sausage, and garlic herb sourdough\"
3. \"Day 1: Blackened salmon, wild rice, grilled asparagus • Day 2: Bison meatballs, sweet potato mash, sautéed kale • Day 3: Sauteed Korean BBQ chicken thighs, broccoli, and jasmine rice\"

Description:";
}
```

Add endpoint for description enhancement (spell check, grammar):

```php
/**
 * Enhance/correct menu description
 */
public function enhanceMenuDescription(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied. Api key is not valid."]);

    $user = $this->_authUser();

    try {
        $openAI = new \App\Services\OpenAIService();

        $description = $request->description;
        $prompt = "You are an editor for a personal chef marketplace. Fix any spelling, grammar, or punctuation errors in this menu description. Maintain the original meaning and style. Only output the corrected description, nothing else.\n\nDescription: {$description}\n\nCorrected:";

        $result = $openAI->chat(
            $prompt,
            \App\Services\OpenAIService::MODEL_GPT_5_NANO,
            ['temperature' => 0.3, 'max_tokens' => 200]
        );

        if ($result['success']) {
            return response()->json([
                'success' => 1,
                'enhanced_description' => trim($result['content'])
            ]);
        } else {
            return response()->json([
                'success' => 0,
                'error' => 'Failed to enhance description'
            ]);
        }
    } catch (\Exception $e) {
        return response()->json([
            'success' => 0,
            'error' => $e->getMessage()
        ]);
    }
}
```

Add endpoint for auto-population of metadata:

```php
/**
 * Analyze menu description and suggest metadata
 */
public function analyzeMenuMetadata(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied. Api key is not valid."]);

    $user = $this->_authUser();

    try {
        $openAI = new \App\Services\OpenAIService();

        $dishName = $request->dish_name;
        $description = $request->description;

        $prompt = "Based on this menu item, provide estimates in JSON format.

Dish: {$dishName}
Description: {$description}

Provide:
1. estimated_time: prep + cook time in minutes (15, 30, 45, 60, 90, or 120+)
2. appliances: array of IDs from: {$this->getAppliancesReference()}
3. allergens: array of IDs from: {$this->getAllergensReference()}

Respond ONLY with valid JSON:
{
  \"estimated_time\": 60,
  \"appliance_ids\": [1, 3],
  \"allergen_ids\": [2, 5]
}";

        $result = $openAI->chat(
            $prompt,
            \App\Services\OpenAIService::MODEL_GPT_5_NANO,
            ['temperature' => 0.3, 'max_tokens' => 150]
        );

        if ($result['success']) {
            $metadata = json_decode($result['content'], true);
            return response()->json([
                'success' => 1,
                'metadata' => $metadata
            ]);
        } else {
            return response()->json([
                'success' => 0,
                'error' => 'Failed to analyze metadata'
            ]);
        }
    } catch (\Exception $e) {
        return response()->json([
            'success' => 0,
            'error' => $e->getMessage()
        ]);
    }
}

private function getAppliancesReference(): string
{
    // Fetch from database
    $appliances = \App\Models\Appliance::all();
    return json_encode($appliances->map(function($a) {
        return ['id' => $a->id, 'name' => $a->name];
    }));
}

private function getAllergensReference(): string
{
    // Fetch from database
    $allergens = \App\Models\Allergen::all();
    return json_encode($allergens->map(function($a) {
        return ['id' => $a->id, 'name' => $a->name];
    }));
}
```

#### **File: `/backend/routes/mapi.php`**

Add routes (after line ~60):

```php
Route::post('generate-menu-description', 'MapiController@generateMenuDescription');
Route::post('enhance-menu-description', 'MapiController@enhanceMenuDescription');
Route::post('analyze-menu-metadata', 'MapiController@analyzeMenuMetadata');
```

---

### 2. Frontend API Service

#### **File: `/frontend/app/services/api.ts`**

Add new API functions (after line ~572):

```typescript
export const GenerateMenuDescriptionAPI = async (params: { dish_name: string }) => {
  const response = await POSTAPICALL("generate-menu-description", params);
  return response;
};

export const EnhanceMenuDescriptionAPI = async (params: { description: string }) => {
  const response = await POSTAPICALL("enhance-menu-description", params);
  return response;
};

export const AnalyzeMenuMetadataAPI = async (params: {
  dish_name: string;
  description: string;
}) => {
  const response = await POSTAPICALL("analyze-menu-metadata", params);
  return response;
};
```

---

### 3. Frontend Type Updates

#### **File: `/frontend/app/types/menu.interface.ts`**

Add optional AI fields (after line ~19):

```typescript
export default interface MenuInterface {
  // ... existing fields ...

  // AI-generated fields (not sent to backend, just for UI state)
  ai_generated_description?: string;
  description_edited?: boolean;
}
```

---

### 4. Frontend UI Changes

#### **File: `/frontend/app/screens/chef/addMenuItem/steps/StepMenuItemName.tsx`**

Current: Lines 1-108

**Changes needed:**
1. After user clicks "Continue" and validation passes, call AI API to generate description
2. Store the generated description in `menuItemData.ai_generated_description`
3. Show loading state during API call
4. Handle errors gracefully (allow user to continue even if AI fails)

**Updated implementation:**
```typescript
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { GenerateMenuDescriptionAPI } from '../../../../services/api';

export const StepMenuItemName: React.FC<StepMenuItemNameProps> = ({
  menuItemData,
  onUpdateMenuItemData,
  onNext,
  onBack,
}) => {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const validateAndProceed = async () => {
    // Validate name
    if (!menuItemData.title || menuItemData.title.trim().length === 0) {
      ShowErrorToast('Please enter a menu item name');
      return;
    }

    if (menuItemData.title.trim().length < 3) {
      ShowErrorToast('Menu item name must be at least 3 characters');
      return;
    }

    // Generate AI description in background
    setIsGeneratingDescription(true);
    try {
      const response = await GenerateMenuDescriptionAPI({
        dish_name: menuItemData.title
      });

      if (response.success === 1 && response.description) {
        onUpdateMenuItemData({
          ai_generated_description: response.description
        });
      }
    } catch (error) {
      console.log('AI description generation failed, continuing anyway', error);
    } finally {
      setIsGeneratingDescription(false);
    }

    onNext();
  };

  return (
    <MenuItemStepContainer
      title="What's the name of your dish?"
      subtitle="This is the name that will be displayed to customers."
      currentStep={1}
      totalSteps={8}
    >
      <StyledTextInput
        label="Menu Item Name"
        placeholder="e.g., Grandma's Lasagna"
        value={menuItemData.title ?? ''}
        onChangeText={(val) => onUpdateMenuItemData({ title: val })}
        autoCapitalize="words"
        maxLength={100}
      />

      <View style={styles.buttonContainer}>
        <StyledButton
          title={isGeneratingDescription ? "Generating..." : "Continue"}
          onPress={validateAndProceed}
          disabled={isGeneratingDescription}
          icon={isGeneratingDescription ? (
            <ActivityIndicator size="small" color="white" />
          ) : undefined}
        />
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>
    </MenuItemStepContainer>
  );
};
```

---

#### **File: `/frontend/app/screens/chef/addMenuItem/steps/StepMenuItemDescription.tsx`**

Current: Lines 1-139

**Changes needed:**
1. Add state for tracking whether AI description has been used
2. Show "Start with AI Description" button if `ai_generated_description` exists
3. When clicked, populate the text field with AI description
4. Track if user has edited the description
5. Before moving to next step, optionally enhance the description

**Updated implementation:**
```typescript
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { EnhanceMenuDescriptionAPI } from '../../../../services/api';

export const StepMenuItemDescription: React.FC<StepMenuItemDescriptionProps> = ({
  menuItemData,
  onUpdateMenuItemData,
  onNext,
  onBack,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showEnhancePreview, setShowEnhancePreview] = useState(false);
  const [enhancedDescription, setEnhancedDescription] = useState('');
  const [hasUsedAI, setHasUsedAI] = useState(false);

  const handleUseAIDescription = () => {
    if (menuItemData.ai_generated_description) {
      onUpdateMenuItemData({
        description: menuItemData.ai_generated_description,
        description_edited: false
      });
      setHasUsedAI(true);
    }
  };

  const handleDescriptionChange = (val: string) => {
    onUpdateMenuItemData({
      description: val,
      description_edited: hasUsedAI || !!menuItemData.ai_generated_description
    });
  };

  const enhanceDescription = async (description: string) => {
    setIsEnhancing(true);
    try {
      const response = await EnhanceMenuDescriptionAPI({ description });

      if (response.success === 1 && response.enhanced_description) {
        setEnhancedDescription(response.enhanced_description);
        setShowEnhancePreview(true);
      } else {
        // If enhancement fails, just continue
        onNext();
      }
    } catch (error) {
      console.log('Enhancement failed, continuing anyway', error);
      onNext();
    } finally {
      setIsEnhancing(false);
    }
  };

  const acceptEnhancedDescription = () => {
    onUpdateMenuItemData({ description: enhancedDescription });
    setShowEnhancePreview(false);
    onNext();
  };

  const validateAndProceed = () => {
    // Validate description
    if (!menuItemData.description || menuItemData.description.trim().length === 0) {
      ShowErrorToast('Please enter a description');
      return;
    }

    if (menuItemData.description.trim().length < 20) {
      ShowErrorToast('Description must be at least 20 characters');
      return;
    }

    // If user edited the description or wrote their own, enhance it
    if (menuItemData.description_edited || !menuItemData.ai_generated_description) {
      enhanceDescription(menuItemData.description);
    } else {
      // AI description used without edits, skip enhancement
      onNext();
    }
  };

  return (
    <MenuItemStepContainer
      title="Describe your menu offering"
      subtitle="Give customers a short summary of what makes this item special."
      currentStep={2}
      totalSteps={8}
    >
      {/* AI Description Button */}
      {menuItemData.ai_generated_description && !hasUsedAI && (
        <View style={styles.aiSuggestionBox}>
          <Text style={styles.aiSuggestionLabel}>AI Generated Description:</Text>
          <Text style={styles.aiSuggestionText}>
            {menuItemData.ai_generated_description}
          </Text>
          <StyledButton
            title="Use This Description"
            onPress={handleUseAIDescription}
            style={styles.aiUseButton}
          />
        </View>
      )}

      <StyledTextInput
        label="Description"
        placeholder="e.g., A hearty Italian classic with layers of pasta, rich meat sauce, and creamy ricotta cheese, baked to perfection."
        value={menuItemData.description ?? ''}
        onChangeText={handleDescriptionChange}
        multiline
        numberOfLines={5}
        maxLength={500}
        style={styles.textArea}
      />

      <Text style={styles.charCount}>
        {(menuItemData.description ?? '').length}/500 characters
      </Text>

      {/* Enhancement Preview Modal */}
      {showEnhancePreview && (
        <View style={styles.previewModal}>
          <Text style={styles.previewTitle}>How does this look?</Text>
          <Text style={styles.previewText}>{enhancedDescription}</Text>
          <View style={styles.previewButtons}>
            <StyledButton
              title="Looks Good"
              onPress={acceptEnhancedDescription}
            />
            <StyledButton
              title="Keep Original"
              onPress={() => {
                setShowEnhancePreview(false);
                onNext();
              }}
              style={styles.secondaryButton}
            />
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <StyledButton
          title={isEnhancing ? "Enhancing..." : "Continue"}
          onPress={validateAndProceed}
          disabled={isEnhancing}
        />
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>
    </MenuItemStepContainer>
  );
};

// Add new styles
const styles = StyleSheet.create({
  // ... existing styles ...

  aiSuggestionBox: {
    backgroundColor: '#f0f9ff',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  aiSuggestionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: Spacing.xs,
  },
  aiSuggestionText: {
    fontSize: 14,
    color: '#1e3a8a',
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
  aiUseButton: {
    backgroundColor: '#3b82f6',
  },
  previewModal: {
    backgroundColor: 'white',
    padding: Spacing.lg,
    borderRadius: 12,
    marginTop: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  previewText: {
    fontSize: 14,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  previewButtons: {
    gap: Spacing.sm,
  },
  secondaryButton: {
    backgroundColor: AppColors.textSecondary,
  },
});
```

---

#### **File: `/frontend/app/screens/chef/addMenuItem/index.tsx`**

Current: Lines 1-289

**Changes needed:**
1. Before final submission in `handleCompleteMenuItem`, call AI metadata analysis API
2. Pre-populate `estimated_time`, `appliances`, and `allergens` if not already set
3. This happens silently in background before the user reaches those steps

**Updated implementation:**

Add this function before `handleCompleteMenuItem` (around line 107):

```typescript
// Auto-populate metadata using AI analysis
const analyzeAndPopulateMetadata = async () => {
  if (!menuItemData.title || !menuItemData.description) return;

  try {
    const response = await AnalyzeMenuMetadataAPI({
      dish_name: menuItemData.title,
      description: menuItemData.description
    });

    if (response.success === 1 && response.metadata) {
      const updates: Partial<IMenu> = {};

      // Only update if user hasn't manually set these
      if (!menuItemData.estimated_time && response.metadata.estimated_time) {
        updates.estimated_time = response.metadata.estimated_time;

        // Also set completion_time_id for UI
        const completionTimes = [
          { id: '6', m: 15 },
          { id: '5', m: 30 },
          { id: '4', m: 45 },
          { id: '3', m: 60 },
          { id: '2', m: 90 },
          { id: '1', m: 120 },
        ];
        const match = completionTimes.find(ct => ct.m === response.metadata.estimated_time);
        if (match) updates.completion_time_id = match.id;
      }

      if (!menuItemData.appliances && response.metadata.appliance_ids?.length) {
        updates.appliances = response.metadata.appliance_ids as any;
      }

      if (!menuItemData.allergens && response.metadata.allergen_ids?.length) {
        updates.allergens = response.metadata.allergen_ids as any;
      }

      if (Object.keys(updates).length > 0) {
        handleUpdateMenuItemData(updates);
      }
    }
  } catch (error) {
    console.log('Metadata analysis failed, skipping', error);
  }
};
```

Call this function when moving from description to categories (update around line 203):

```typescript
case 2:
  return (
    <StepMenuItemDescription
      menuItemData={menuItemData}
      onUpdateMenuItemData={handleUpdateMenuItemData}
      onNext={async () => {
        await analyzeAndPopulateMetadata();
        setStep(3);
      }}
      onBack={() => setStep(1)}
    />
  );
```

---

## Database Schema

No changes needed! All AI-generated content fits into existing fields:
- `menus.description` - stores the final description
- `menus.estimated_time` - stores prep time in minutes
- `menus.appliances` - stores comma-separated appliance IDs
- `menus.allergens` - stores comma-separated allergen IDs

---

## Testing Checklist

### Backend
- [ ] Test `generateMenuDescription` with various dish names
- [ ] Test `enhanceMenuDescription` with typos and grammar errors
- [ ] Test `analyzeMenuMetadata` returns valid JSON with correct IDs
- [ ] Verify OpenAI API key is configured
- [ ] Test error handling when OpenAI API fails

### Frontend
- [ ] Test AI description generation on name submission
- [ ] Test "Use AI Description" button functionality
- [ ] Test manual description entry (without AI)
- [ ] Test description enhancement preview
- [ ] Test accepting/rejecting enhanced description
- [ ] Test metadata auto-population in subsequent steps
- [ ] Test behavior when AI APIs fail (graceful degradation)
- [ ] Test edit mode (existing menu items)

### User Experience
- [ ] Loading states are clear and not blocking
- [ ] Errors don't prevent user from continuing
- [ ] AI suggestions are helpful but not forced
- [ ] Users can override all AI suggestions
- [ ] Character count and validation still work

---

## Cost Estimation

Using GPT-5-nano ($0.05/1M input tokens, $0.40/1M output tokens):

**Per menu item creation:**
1. Description generation: ~100 input tokens + ~100 output tokens = $0.000045
2. Description enhancement: ~150 input tokens + ~150 output tokens = $0.000075
3. Metadata analysis: ~200 input tokens + ~100 output tokens = $0.00005

**Total per menu item: ~$0.00017** (extremely affordable)

For 1000 menu items created: **~$0.17**

---

## Rollout Strategy

### Phase 1: Description Generation Only
- Implement just the AI description generation
- Show "Use AI Description" button
- Gather user feedback

### Phase 2: Enhancement
- Add spell check and grammar enhancement
- Test with real user-written descriptions

### Phase 3: Metadata Auto-population
- Implement appliances, allergens, and time estimation
- Monitor accuracy and adjust prompts as needed

---

## Open Questions

1. **Should we cache AI descriptions?** If a chef creates the same dish name multiple times, should we reuse the description?

2. **Model selection:** Should we use GPT-5-nano (fastest, cheapest) or GPT-5-mini (smarter)?

3. **Prompt refinement:** Should we include more examples in the prompt or let the model be more creative?

4. **User preference:** Should we add a setting to disable AI features for chefs who prefer full manual control?

---

## File References

### Backend Files to Modify
- [`/backend/app/Http/Controllers/MapiController.php`](backend/app/Http/Controllers/MapiController.php) - Add 3 new methods
- [`/backend/routes/mapi.php`](backend/routes/mapi.php:59-60) - Add 3 new routes
- [`/backend/app/Services/OpenAIService.php`](backend/app/Services/OpenAIService.php) - Already exists, no changes needed

### Frontend Files to Modify
- [`/frontend/app/services/api.ts`](frontend/app/services/api.ts:558-572) - Add 3 new API functions
- [`/frontend/app/types/menu.interface.ts`](frontend/app/types/menu.interface.ts:1-19) - Add optional AI fields
- [`/frontend/app/screens/chef/addMenuItem/steps/StepMenuItemName.tsx`](frontend/app/screens/chef/addMenuItem/steps/StepMenuItemName.tsx:1-108) - Add AI generation on continue
- [`/frontend/app/screens/chef/addMenuItem/steps/StepMenuItemDescription.tsx`](frontend/app/screens/chef/addMenuItem/steps/StepMenuItemDescription.tsx:1-139) - Add AI button and enhancement
- [`/frontend/app/screens/chef/addMenuItem/index.tsx`](frontend/app/screens/chef/addMenuItem/index.tsx:1-289) - Add metadata analysis

### Files Referenced (No Changes Needed)
- [`/frontend/app/screens/chef/addMenuItem/steps/StepMenuItemKitchen.tsx`](frontend/app/screens/chef/addMenuItem/steps/StepMenuItemKitchen.tsx) - Appliances selection
- [`/frontend/app/screens/chef/addMenuItem/steps/StepMenuItemAllergens.tsx`](frontend/app/screens/chef/addMenuItem/steps/StepMenuItemAllergens.tsx) - Allergens selection
