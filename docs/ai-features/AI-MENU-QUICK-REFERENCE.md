# AI Menu Features - Quick Reference Card

## 🎯 What It Does

Automatically generates professional menu descriptions, checks grammar, and pre-fills metadata (time, appliances, allergens) using AI.

---

## 🔌 API Endpoints

### 1. Generate Description
```
POST /mapi/generate-menu-description
```
**Body**: `{ "dish_name": "Grilled Chicken Bowl" }`

**Response**: `{ "success": 1, "description": "..." }`

---

### 2. Enhance Description
```
POST /mapi/enhance-menu-description
```
**Body**: `{ "description": "griled chicken with rice" }`

**Response**: `{ "success": 1, "enhanced_description": "Grilled chicken with rice." }`

---

### 3. Analyze Metadata
```
POST /mapi/analyze-menu-metadata
```
**Body**:
```json
{
  "dish_name": "Grilled Chicken",
  "description": "Grilled chicken with quinoa..."
}
```

**Response**:
```json
{
  "success": 1,
  "metadata": {
    "estimated_time": 45,
    "appliance_ids": [1, 3],
    "allergen_ids": [2]
  }
}
```

---

## 📁 Files Modified

### Backend
| File | Lines | What Changed |
|------|-------|--------------|
| `MapiController.php` | 1120-1346 | Added 3 new AI methods |
| `mapi.php` | 63-66 | Added 3 new routes |

### Frontend
| File | What Changed |
|------|--------------|
| `api.ts` | Added 3 API functions |
| `menu.interface.ts` | Added AI fields to type |
| `StepMenuItemName.tsx` | Calls AI on Continue button |
| `StepMenuItemDescription.tsx` | Shows AI suggestion + enhancement modal |
| `AddMenuItem/index.tsx` | Calls metadata analysis |

---

## 🔑 Environment Variables

```env
# Required in backend/.env
OPENAI_API_KEY=sk-proj-...
```

---

## 💰 Cost

**Per menu item**: ~$0.00017

**Models Used**:
- GPT-5-nano for all operations
- Temperature 0.7 (creative) for descriptions
- Temperature 0.3 (precise) for enhancement/metadata

---

## 🎨 User Flow

```
1. Name Step
   ├─ Enter: "Grilled Chicken"
   ├─ Click: "Continue"
   └─ AI generates description →

2. Description Step
   ├─ See: Blue box with AI suggestion
   ├─ Option A: Click "Use This Description"
   ├─ Option B: Type own description
   ├─ Click: "Continue"
   └─ AI enhances description →

3. Enhancement Modal
   ├─ See: "How does this look?"
   ├─ Option A: "Looks Good!" (use enhanced)
   └─ Option B: "Keep Original"

4. Metadata Analysis
   ├─ Happens silently in background
   └─ Pre-fills: time, appliances, allergens
```

---

## 🛡️ Error Handling

**All AI failures are graceful**:
- User never sees error message
- Flow continues normally
- User can complete manually
- Errors logged to Laravel logs

---

## 🔍 Debugging

### Check AI is working:
```bash
# Backend logs
tail -f backend/storage/logs/laravel.log

# Look for:
# - "Generate Menu Description Error"
# - "Enhance Menu Description Error"
# - "Analyze Menu Metadata Error"
```

### Check API key:
```bash
cd backend
php artisan tinker
>>> config('services.openai.api_key')
```

### Test endpoint directly:
```bash
# Get auth token from app first, then:
curl -X POST http://localhost:8000/mapi/generate-menu-description \
  -H "Content-Type: application/json" \
  -H "apiKey: YOUR_API_KEY" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"dish_name":"Test Dish"}'
```

---

## ⚡ Performance Targets

| Operation | Target | Max |
|-----------|--------|-----|
| Generate description | <2s | 5s |
| Enhance description | <2s | 5s |
| Analyze metadata | <2s | 5s |

---

## 🧪 Quick Test

```bash
# 1. Verify API key exists
grep OPENAI_API_KEY backend/.env

# 2. Start servers
cd backend && php artisan serve &
cd frontend && npm start &

# 3. Create menu item:
#    - Name: "Grilled Chicken Bowl"
#    - Click Continue
#    - See AI description
#    - Click "Use This Description"
#    - Click Continue
#    - See enhancement modal
#    - Accept and continue
#    - Verify metadata pre-filled

# 4. Success! ✅
```

---

## 🚨 Rollback Plan

### Disable AI features:
```php
// In backend/routes/mapi.php, comment out:
// Route::post('generate-menu-description', 'MapiController@generateMenuDescription');
// Route::post('enhance-menu-description', 'MapiController@enhanceMenuDescription');
// Route::post('analyze-menu-metadata', 'MapiController@analyzeMenuMetadata');
```

App will work normally without AI assistance.

---

## 📊 Monitoring

Track these metrics:
- AI generation success rate
- Average response time
- User acceptance rate of AI suggestions
- Edit rate after using AI
- Cost per menu item

---

## 🔮 Future Ideas

- [ ] Multiple description styles (casual, formal, creative)
- [ ] Regenerate button for new AI suggestions
- [ ] Description templates by cuisine type
- [ ] Batch generate descriptions for multiple items
- [ ] A/B test AI vs manual descriptions

---

## 📞 Support

**Logs**: `backend/storage/logs/laravel.log`

**API Errors**: Check Laravel logs for "OpenAI" keyword

**Frontend Errors**: Check browser console

**Database Issues**:
```sql
SELECT COUNT(*) FROM tbl_appliances;  -- Should be > 0
SELECT COUNT(*) FROM tbl_allergens;   -- Should be > 0
```

---

## ✅ Checklist Before Deploy

- [ ] OpenAI API key configured
- [ ] Backend routes added
- [ ] Frontend imports updated
- [ ] Test on staging environment
- [ ] Verify costs are acceptable
- [ ] Monitor logs for errors
- [ ] Get feedback from 2-3 chefs

---

**Last Updated**: 2025-12-02
**Status**: ✅ Ready for Testing
**Version**: 1.0.0
