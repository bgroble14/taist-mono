# AI Menu Features - Quick Test Guide

## Pre-Testing Setup

1. **Verify OpenAI API Key is configured**
   ```bash
   cd backend
   grep OPENAI_API_KEY .env
   ```
   Should return: `OPENAI_API_KEY=sk-...`

2. **Start backend server** (if not already running)
   ```bash
   cd backend
   php artisan serve
   ```

3. **Start frontend app** (if not already running)
   ```bash
   cd frontend
   npm start
   # or
   npx expo start
   ```

---

## Test 1: Description Generation (2 minutes)

**Goal**: Verify AI generates a description when entering menu item name

1. Open app, log in as a chef
2. Navigate to "Add Menu Item"
3. Enter name: `Grilled Chicken Bowl`
4. Click "Continue"

**Expected Results**:
- ✅ Button shows "Generating..." briefly
- ✅ Loading text appears: "Creating AI description..."
- ✅ Page transitions to description step
- ✅ Blue box appears with AI-generated description
- ✅ Description mentions chicken, grilled, and bowl-related ingredients

**If it fails**:
- Check Laravel logs: `backend/storage/logs/laravel.log`
- Check browser console for errors
- Verify OpenAI API key is valid

---

## Test 2: Use AI Description (1 minute)

**Goal**: Verify "Use This Description" button works

1. Continue from Test 1 (on description page with AI suggestion)
2. Click "Use This Description" button

**Expected Results**:
- ✅ Blue box disappears
- ✅ Description text field is populated with the AI text
- ✅ Character count updates correctly
- ✅ Text is editable (try typing)

---

## Test 3: Enhancement - No Edits (1 minute)

**Goal**: Verify AI enhancement is skipped when description is unchanged

1. Continue from Test 2 (with AI description in field, no edits)
2. Click "Continue"

**Expected Results**:
- ✅ NO enhancement modal appears
- ✅ Page immediately transitions to categories step
- ✅ No "Checking grammar..." loading state

---

## Test 4: Enhancement - With Edits (2 minutes)

**Goal**: Verify AI enhancement works when description is edited

1. Start new menu item
2. Enter name: `Pasta Carbonara`
3. Click "Continue"
4. Ignore AI suggestion, type this (with typos):
   ```
   A delicous creamy pasta made with eggs, cheese, and bacon. Its a hearty meal.
   ```
5. Click "Continue"

**Expected Results**:
- ✅ Loading state: "Checking grammar and punctuation..."
- ✅ Modal appears: "How does this look?"
- ✅ Enhanced description shows corrections:
  - "delicous" → "delicious"
  - "Its" → "It's"
- ✅ Two buttons: "Looks Good!" and "Keep Original"

6. Click "Looks Good!"

**Expected Results**:
- ✅ Modal closes
- ✅ Description is updated with enhanced version
- ✅ Page transitions to categories

---

## Test 5: Keep Original (1 minute)

**Goal**: Verify "Keep Original" button works

1. Start new menu item
2. Enter name: `Spaghetti`
3. Continue, type: `my grandmas recepie` (intentional typos)
4. Click "Continue"
5. When modal appears, click "Keep Original"

**Expected Results**:
- ✅ Modal closes
- ✅ Original description (with typos) is kept
- ✅ Page transitions to categories

---

## Test 6: Metadata Auto-Population (2 minutes)

**Goal**: Verify AI pre-populates time, appliances, and allergens

1. Start new menu item
2. Enter name: `Grilled Salmon with Quinoa`
3. Click "Continue"
4. Use AI description or type:
   ```
   Pan-seared salmon fillet served over fluffy quinoa with roasted asparagus.
   ```
5. Click "Continue" (accept any enhancement)
6. **Categories step**: Select any category, click "Continue"
7. **Allergens step**:
   - ✅ Check if "Fish" or similar is pre-selected
   - Click "Continue"
8. **Kitchen/Appliances step**:
   - ✅ Check if "Stove" or "Oven" is pre-selected
   - Click "Continue"
9. **Pricing step**: Enter price, continue
10. **Review step**:
    - ✅ Check if "Estimated Time" shows a value (like 30m, 45m, etc.)

**Expected Results**:
- ✅ At least one allergen is pre-selected
- ✅ At least one appliance is pre-selected
- ✅ Estimated time is pre-filled
- ✅ All values can be manually changed

---

## Test 7: Error Handling - Invalid API Key (Optional)

**Goal**: Verify graceful degradation when AI fails

1. Temporarily invalidate OpenAI API key:
   ```bash
   cd backend
   # Edit .env and change OPENAI_API_KEY to invalid value
   ```

2. Restart backend server

3. Try creating a menu item:
   - Enter name: `Test Dish`
   - Click "Continue"

**Expected Results**:
- ✅ No error shown to user
- ✅ Page transitions normally
- ✅ Description step shows empty blue box OR no blue box
- ✅ User can still type description manually
- ✅ Flow completes successfully

4. Restore valid API key and restart server

---

## Test 8: Edit Existing Menu Item (1 minute)

**Goal**: Verify AI doesn't interfere with editing existing items

1. Create and save a menu item (use any method)
2. Navigate to chef menu, find the item
3. Click "Edit"
4. Verify all fields are pre-populated correctly
5. Edit the description slightly
6. Click through to save

**Expected Results**:
- ✅ No AI suggestion appears (since editing existing item)
- ✅ Enhancement still works on Continue
- ✅ Existing values are preserved
- ✅ Saves successfully

---

## Test 9: Very Long/Short Names (1 minute)

**Goal**: Test edge cases

**Test 9a - Very Short**:
1. Enter name: `Pie`
2. Continue

**Expected**:
- ✅ AI generates reasonable description for "Pie"

**Test 9b - Very Long**:
1. Enter name: `Grandma's Famous Italian-Style Lasagna with Homemade Ricotta and Grass-Fed Beef Bolognese`
2. Continue

**Expected**:
- ✅ AI generates description based on full name
- ✅ No errors occur

---

## Test 10: Special Characters (1 minute)

**Goal**: Verify special characters don't break AI

1. Enter name: `Chef's "Signature" Bowl (Gluten-Free)`
2. Continue

**Expected Results**:
- ✅ AI handles quotes, parentheses, dashes
- ✅ Description generated successfully

---

## Quick Smoke Test (5 minutes total)

If you're short on time, run this abbreviated version:

1. ✅ Create menu item with name "Grilled Chicken Bowl"
2. ✅ Verify AI description appears in blue box
3. ✅ Click "Use This Description"
4. ✅ Type a few extra words with a typo: `and its delicous`
5. ✅ Click Continue
6. ✅ Verify enhancement modal appears with correction
7. ✅ Click "Looks Good!"
8. ✅ Continue through all steps
9. ✅ Verify time/appliances/allergens have values
10. ✅ Save menu item successfully

---

## Troubleshooting

### AI description not appearing
```bash
# Check Laravel logs
tail -f backend/storage/logs/laravel.log

# Look for these errors:
# - "OpenAI API key is not configured"
# - "OpenAI API request failed"
# - "Generate Menu Description Error"
```

### Enhancement modal not appearing
```bash
# Check frontend console
# Look for: "Enhancement failed, continuing anyway"

# Check if description was actually edited
# (Modal only appears if description_edited is true)
```

### Metadata not pre-populating
```bash
# Check Laravel logs for:
# - "Analyze Menu Metadata Error"
# - "JSON Parse Error in analyzeMenuMetadata"

# Verify database has appliances and allergens:
cd backend
php artisan tinker
>>> \App\Models\Appliances::count();  // Should be > 0
>>> \App\Models\Allergens::count();   // Should be > 0
```

---

## Success Criteria

**Minimum Viable**:
- Tests 1, 2, 4, 6 pass

**Full Success**:
- All 10 tests pass

**Production Ready**:
- All tests pass + no errors in logs + good performance (<3s per AI call)

---

## Performance Benchmarks

Time each AI operation:

- Description generation: _____ seconds (target: <3s)
- Enhancement: _____ seconds (target: <2s)
- Metadata analysis: _____ seconds (target: <2s)

If any operation takes >5s consistently:
- Check network latency to OpenAI
- Consider using GPT-4o-mini instead of GPT-5-nano
- Check if max_tokens needs adjustment

---

## Post-Testing

After testing, document:

1. **Issues Found**: _______________
2. **Performance**: _______________
3. **User Experience**: _______________
4. **AI Quality**: _______________
5. **Ready for Production?**: ⬜ Yes ⬜ No ⬜ Needs fixes

---

**Happy Testing! 🧪**
