# TMA-014: Automatic Reload When New Zip Code Added - Implementation Plan

**Status:** Not Started  
**Complexity:** 🟡 Moderate  
**Estimated Time:** 2-3 hours

---

## Problem Statement

**Current Issue:**
When an admin adds a new zip code to the service area, users in that newly added zip code have no way of knowing Taist is now available in their area unless they manually:
1. Force quit and restart the app, OR
2. Log out and log back in

**Desired Behavior:**
1. When admin adds new zip codes → notify users in those areas automatically
2. When user changes their zip code → immediately check if they're now in a service area
3. App should automatically refresh chef listings when area becomes available

---

## Current Implementation Analysis

### 1. Zip Code Storage Structure

**Database:**
- **Table:** `tbl_zipcodes`
- **Structure:** Single row with ONE field containing comma-separated zip codes
- **Example:** `"10001,10002,10003,90210,90211"`

**Access:**
```php
// backend/app/Models/Zipcodes.php
$zipcodes = app(Zipcodes::class)->first();
// Returns: { id: 1, zipcodes: "10001,10002,10003", created_at: ..., updated_at: ... }
```

### 2. Admin Updates Zip Codes

**Controller:** `backend/app/Http/Controllers/Admin/AdminController.php` (lines 289-294)

```php
public function updateZipcodes(Request $request) {
    $zipcodes = app(Zipcodes::class)->first();
    $zipcodes->update(['zipcodes'=>$request->zipcodes, 'updated_at'=>time()]);
    return redirect()->to('/admin/zipcodes');
}
```

**View:** `backend/resources/views/admin/zipcodes.blade.php`
- Shows a textarea where admin can edit comma-separated list
- Submits via POST to `/admin/zipcodes`

### 3. Frontend Fetches Zip Codes

**API Call:** `frontend/app/services/api.ts` (lines 533-541)

```typescript
export const GetZipCodes = async (params: {}, dispatch?: any) => {
  var response = await GETAPICALL("get_zipcodes", params);
  if (response.success == 1 && dispatch) {
    dispatch(
      updateZipcodes(response.data.zipcodes.replace(/\s/g, "").split(","))
    );
  }
  return response;
};
```

**When Called:**
- On login (line 202 in `LoginAPI()`)
- Stored in Redux: `tableSlice.zipcodes` as an array
- Example: `["10001", "10002", "10003", "90210"]`

### 4. Service Area Check

**File:** `frontend/app/screens/customer/home/index.tsx` (line 54)

```typescript
const isInArea = zipcodes.includes(self.zip ?? '');
```

- If `isInArea === false`, shows "Not in service area" message
- If `isInArea === true`, shows chef listings

### 5. Existing Notification Infrastructure

**Backend:** `backend/app/Http/Controllers/MapiController.php` (lines 238-274)

```php
private function notification($token, $title, $body, $orderID, $role)
{
    $message = CloudMessage::fromArray([
        'token' => $token,
        'notification' => [
            'title' => $title,
            'body' => $body,
        ],
        'data' => [
            'order_id' => $orderID,
            'role' => $role,
            'body' => $body
        ],
    ]);
    
    $this->notification->send($message);
}
```

**Usage:** Already used for order status updates, chef approvals, etc.

---

## Implementation Strategy

### Scenarios to Cover

1. **Admin adds new zip code(s)** → Notify affected users
2. **User changes their zip code** → Check if now in service area, trigger refresh
3. **User updates their location** → Check if zip code changed, revalidate area

---

## Scenario 1: Admin Adds New Zip Code(s)

### Backend Changes

#### Step 1: Detect New Zip Codes Added

**File:** `backend/app/Http/Controllers/Admin/AdminController.php`

Update the `updateZipcodes()` method to detect newly added zip codes:

```php
public function updateZipcodes(Request $request) {
    $zipcodesRecord = app(Zipcodes::class)->first();
    
    // Get old and new zip codes as arrays
    $oldZipcodes = array_map('trim', explode(',', $zipcodesRecord->zipcodes));
    $newZipcodes = array_map('trim', explode(',', $request->zipcodes));
    
    // Find newly added zip codes
    $addedZipcodes = array_diff($newZipcodes, $oldZipcodes);
    
    // Update the database
    $zipcodesRecord->update([
        'zipcodes' => $request->zipcodes, 
        'updated_at' => time()
    ]);
    
    // If new zip codes were added, send notifications
    if (!empty($addedZipcodes)) {
        $this->notifyUsersAboutNewZipcodes($addedZipcodes);
    }
    
    return redirect()->to('/admin/zipcodes');
}
```

#### Step 2: Create Notification Method

Add new method to `AdminController.php`:

```php
private function notifyUsersAboutNewZipcodes($newZipcodes)
{
    // Import Firebase messaging
    $notification = Firebase::messaging();
    
    // Find users in the newly added zip codes who are customers
    $affectedUsers = app(Listener::class)
        ->where('user_type', 1) // Customers only
        ->whereIn('zip', $newZipcodes)
        ->whereNotNull('fcm_token')
        ->get();
    
    $zipList = implode(', ', $newZipcodes);
    $message = "Great news! Taist is now available in your area ({$zipList}). Check out local chefs now!";
    
    foreach ($affectedUsers as $user) {
        try {
            $fcmMessage = CloudMessage::fromArray([
                'token' => $user->fcm_token,
                'notification' => [
                    'title' => 'Taist Now Available in Your Area!',
                    'body' => $message,
                ],
                'data' => [
                    'type' => 'zipcode_update',
                    'new_zipcodes' => json_encode($newZipcodes),
                    'role' => 'user',
                ]
            ]);
            
            $notification->send($fcmMessage);
            
            // Log notification for tracking
            Notification::create([
                'title' => 'Service Area Expansion',
                'body' => $message,
                'image' => 'N/A',
                'fcm_token' => $user->fcm_token,
                'user_id' => $user->id,
                'navigation_id' => 0,
                'role' => 'user',
            ]);
            
        } catch (FirebaseException $e) {
            Log::error("Failed to send zip code notification to user {$user->id}: " . $e->getMessage());
        }
    }
    
    Log::info("Notified " . count($affectedUsers) . " users about new zip codes: " . $zipList);
}
```

#### Step 3: Add Required Imports

Add to top of `AdminController.php`:

```php
use Kreait\Laravel\Firebase\Facades\Firebase;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Exception\FirebaseException;
use Illuminate\Support\Facades\Log;
use App\Notification;
```

### Frontend Changes

#### Step 1: Handle Zip Code Update Notification

**File:** `frontend/app/firebase/index.ts` or notification handler

Add listener for `zipcode_update` notification type:

```typescript
// In your notification handler
messaging().onMessage(async remoteMessage => {
  const notifData = remoteMessage.data;
  
  if (notifData?.type === 'zipcode_update') {
    // Refresh zip codes list
    await GetZipCodes({}, dispatch);
    
    // Show alert
    Alert.alert(
      'Taist Now Available!',
      remoteMessage.notification?.body || 'Taist is now available in your area!',
      [
        {
          text: 'Explore Chefs',
          onPress: () => {
            // Navigate to home/chef listing
            navigate.toCustomer.tabs();
          }
        }
      ]
    );
    
    // Trigger a refresh of chef listings if on home screen
    // This could be done via an event emitter or Redux action
  }
});
```

#### Step 2: Add Background Notification Handler

**File:** `frontend/app/firebase/index.ts`

```typescript
// Handle background notifications
messaging().setBackgroundMessageHandler(async remoteMessage => {
  if (remoteMessage.data?.type === 'zipcode_update') {
    // Silently refresh zip codes when app is in background
    await GetZipCodes({}, null); // null dispatch since no UI to update yet
  }
});
```

---

## Scenario 2: User Changes Their Zip Code

### Backend Changes

#### Update User Endpoint to Return Area Status

**File:** `backend/app/Http/Controllers/MapiController.php`

Update `updateUser()` method to include zip code change detection:

```php
public function updateUser(Request $request, $id = "")
{
    // ... existing code ...
    
    if (isset($request->zip)) {
        $oldUser = app(Listener::class)->find($id);
        $oldZip = $oldUser->zip;
        $newZip = $request->zip;
        
        $ary['zip'] = $newZip;
        
        // Check if zip changed and if new zip is in service area
        if ($oldZip !== $newZip) {
            $zipcodes = app(Zipcodes::class)->first();
            $availableZips = array_map('trim', explode(',', $zipcodes->zipcodes));
            
            $wasInArea = in_array($oldZip, $availableZips);
            $nowInArea = in_array($newZip, $availableZips);
            
            // Store flags to return in response
            $zipChangeInfo = [
                'zip_changed' => true,
                'was_in_area' => $wasInArea,
                'now_in_area' => $nowInArea,
                'entered_service_area' => !$wasInArea && $nowInArea,
                'left_service_area' => $wasInArea && !$nowInArea,
            ];
        }
    }
    
    // ... rest of existing update logic ...
    
    app(Listener::class)->where('id', $id)->update($ary);
    $data = app(Listener::class)->where(['id' => $id])->first();
    
    // Include zip change info in response if applicable
    if (isset($zipChangeInfo)) {
        return response()->json([
            'success' => 1, 
            'data' => $data,
            'zip_change_info' => $zipChangeInfo
        ]);
    }
    
    return response()->json(['success' => 1, 'data' => $data]);
}
```

### Frontend Changes

#### Handle Zip Code Change Response

**File:** `frontend/app/services/api.ts`

Update `UpdateUserAPI` to handle zip change info:

```typescript
export const UpdateUserAPI = async (params: IUser, dispatch?: any) => {
  var response = await POSTAPICALL(`update_user/${params.id}`, params);
  
  if (response.success == 1 && dispatch) {
    dispatch(setUser(response.data));
    
    // Check if zip code changed and now in service area
    if (response.zip_change_info) {
      const info = response.zip_change_info;
      
      if (info.entered_service_area) {
        // User entered service area!
        Alert.alert(
          'Welcome to Taist!',
          'Good news! Taist is available in your new area. Check out local chefs now!',
          [
            {
              text: 'Browse Chefs',
              onPress: () => {
                // Refresh zip codes
                GetZipCodes({}, dispatch);
                // Navigate to home
                navigate.toCustomer.tabs();
              }
            }
          ]
        );
      } else if (info.left_service_area) {
        // User left service area
        Alert.alert(
          'Service Area Changed',
          'Unfortunately, Taist is not yet available in your new location. We\'ll notify you when we expand to your area!',
          [{ text: 'OK' }]
        );
      } else if (info.now_in_area) {
        // Still in service area, just refresh
        GetZipCodes({}, dispatch);
      }
    }
  }
  
  return response;
};
```

#### Add Refresh Trigger on Account Update

**File:** `frontend/app/screens/common/account/index.tsx`

After user saves their profile with new zip code:

```typescript
const handleSave = async () => {
  // ... existing validation ...
  
  dispatch(showLoading());
  const resp = await UpdateUserAPI(userInfo, dispatch);
  dispatch(hideLoading());
  
  if (resp.success == 1) {
    ShowSuccessToast('Profile updated successfully');
    
    // If zip changed and now in area, refresh data
    if (resp.zip_change_info?.now_in_area) {
      // Reload all table data including zipcodes
      await GetZipCodes({}, dispatch);
      await GetUsersAPI({}, dispatch);
    }
    
    navigate.back();
  } else {
    ShowErrorToast(resp.error || 'Update failed');
  }
};
```

---

## Scenario 3: Proactive Area Checking

### Optional: Periodic Zip Code Refresh

**File:** `frontend/app/screens/customer/home/index.tsx`

Add a check when user pulls to refresh:

```typescript
const onRefresh = async () => {
  setRefreshing(true);
  
  // Refresh zip codes to check for new service areas
  await GetZipCodes({}, dispatch);
  
  await loadDatax();
  setRefreshing(false);
  
  // Check if user is now in service area
  const updatedZipcodes = store.getState().table.zipcodes;
  const nowInArea = updatedZipcodes.includes(self.zip ?? '');
  
  if (nowInArea && !isInArea) {
    // User wasn't in area before but is now!
    Alert.alert(
      'Great News!',
      'Taist is now available in your area! Check out local chefs.',
      [{ text: 'Awesome!' }]
    );
  }
};
```

---

## Edge Cases & Considerations

### 1. Multiple Zip Codes Added at Once
**Scenario:** Admin adds 10 zip codes at once  
**Solution:** Group notification by city/state if possible, or send one notification per user listing all their newly added zip codes

### 2. User Not Logged In
**Scenario:** User's area becomes available but they haven't opened app  
**Solution:** Next time they open app and login, zip codes refresh automatically

### 3. User Has No FCM Token
**Scenario:** User disabled notifications or never granted permission  
**Solution:** 
- Notification fails silently (already handled by try/catch)
- User will see updated area next time they refresh or login

### 4. Zip Code Format Variations
**Scenario:** Admin enters "10001" but user has "10001-1234"  
**Solution:** Normalize zip codes by taking first 5 digits:

```php
// In comparison logic
$userZip = substr($user->zip, 0, 5);
$availableZips = array_map(function($zip) {
    return substr(trim($zip), 0, 5);
}, explode(',', $zipcodes->zipcodes));
```

### 5. Duplicate Notifications
**Scenario:** User changes zip multiple times quickly  
**Solution:** Add debouncing or rate limiting on notifications (check last notification time)

### 6. Admin Removes Zip Codes
**Scenario:** Admin removes a zip code from service  
**Solution:** Could add similar logic to notify users their area is no longer served (optional, might not be desired)

---

## Database Changes

### Optional: Track Notification Sent

If you want to track which users were notified about which zip codes:

```php
// Create migration for notification tracking (optional)
Schema::create('tbl_zipcode_notifications', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('tbl_users');
    $table->string('zip_code');
    $table->timestamp('notified_at');
    $table->timestamps();
    
    $table->index(['user_id', 'zip_code']);
});
```

This prevents duplicate notifications if admin re-adds the same zip code later.

---

## Testing Plan

### Test Scenarios

#### Test 1: Admin Adds Single New Zip Code
1. [ ] Admin logs in
2. [ ] Navigates to `/admin/zipcodes`
3. [ ] Adds new zip code "12345" to existing list
4. [ ] Clicks "Update"
5. [ ] Users with zip "12345" receive push notification
6. [ ] Notification title: "Taist Now Available in Your Area!"
7. [ ] Notification body mentions the new zip code
8. [ ] User taps notification → opens app to home screen
9. [ ] Chef listings now visible for that user

#### Test 2: Admin Adds Multiple New Zip Codes
1. [ ] Admin adds "12345, 12346, 12347"
2. [ ] Users in all three zips receive notifications
3. [ ] Notification mentions "your area" not specific zips
4. [ ] No duplicate notifications sent

#### Test 3: User Changes Zip to New Service Area
1. [ ] User logs in with zip "00000" (not in service)
2. [ ] Sees "Not in service area" message
3. [ ] Goes to Account settings
4. [ ] Changes zip to "10001" (in service)
5. [ ] Saves profile
6. [ ] Alert shows "Welcome to Taist!"
7. [ ] Home screen now shows chefs
8. [ ] No manual refresh needed

#### Test 4: User Changes Zip to Non-Service Area
1. [ ] User in service area changes zip to non-served area
2. [ ] Alert shows "Service not available in new location"
3. [ ] Home screen shows "Not in service area" message

#### Test 5: Background Notification
1. [ ] User has app in background
2. [ ] Admin adds user's zip code
3. [ ] Push notification appears in notification tray
4. [ ] User taps notification
5. [ ] App opens to chef listings

#### Test 6: No FCM Token
1. [ ] User has notifications disabled
2. [ ] Admin adds their zip
3. [ ] No notification sent (fails gracefully)
4. [ ] Next time user opens app and refreshes, sees chefs

#### Test 7: Zip Code Format Variations
1. [ ] User has zip "10001-1234"
2. [ ] Admin adds "10001"
3. [ ] User correctly identified as in service area

---

## Files to Modify

### Backend
1. **`backend/app/Http/Controllers/Admin/AdminController.php`**
   - Update `updateZipcodes()` method
   - Add `notifyUsersAboutNewZipcodes()` method
   - Add Firebase imports

2. **`backend/app/Http/Controllers/MapiController.php`**
   - Update `updateUser()` method to detect zip changes
   - Return zip change info in response

### Frontend
3. **`frontend/app/services/api.ts`**
   - Update `UpdateUserAPI` to handle zip change response
   - Handle alerts and refreshes

4. **`frontend/app/firebase/index.ts`**
   - Add handler for `zipcode_update` notification type
   - Add background notification handler

5. **`frontend/app/screens/common/account/index.tsx`**
   - Update save handler to refresh data on zip change

6. **`frontend/app/screens/customer/home/index.tsx`** (optional)
   - Add proactive check on pull-to-refresh

---

## Success Criteria

✅ **Task is complete when:**

1. Admin adds new zip code(s) → Users in those areas receive push notification
2. Push notification has clear title and message
3. Tapping notification opens app to home screen
4. User changes their zip → immediately checks if in service area
5. If entering service area → shows welcome alert and refreshes
6. If leaving service area → shows informational alert
7. No crashes or errors when FCM token is missing
8. Zip code format variations handled (5-digit extraction)
9. Notifications logged for tracking
10. All test scenarios pass

---

## Performance Considerations

- **Bulk notifications:** If 1000+ users affected, consider batching FCM sends
- **Database query:** `whereIn` with large arrays might be slow, add index on `zip` column
- **Rate limiting:** Consider rate limiting zip code updates (max once per minute)

---

## Future Enhancements

1. **Geo-targeting:** Use lat/long instead of just zip codes for more precise targeting
2. **Email notifications:** Also send email to users without push enabled
3. **SMS notifications:** For users who provided phone numbers
4. **Admin preview:** Show admin which users will be notified before confirming
5. **Notification settings:** Allow users to opt out of "new area" notifications
6. **Analytics:** Track how many users become active after area expansion

---

## Rollback Plan

If issues arise:

1. **Backend:** Remove notification call from `updateZipcodes()`, restore original method
2. **Frontend:** Remove notification handlers, revert API changes
3. **Quick disable:** Add feature flag `ENABLE_ZIPCODE_NOTIFICATIONS` in env

```php
// Add to updateZipcodes()
if (env('ENABLE_ZIPCODE_NOTIFICATIONS', true) && !empty($addedZipcodes)) {
    $this->notifyUsersAboutNewZipcodes($addedZipcodes);
}
```

---

## Estimated Implementation Time

| Task | Time | Notes |
|------|------|-------|
| Backend: Detect new zipcodes | 15 min | Array diff logic |
| Backend: Notification method | 30 min | FCM integration |
| Backend: Update user zip change | 20 min | Response enhancement |
| Frontend: Notification handler | 20 min | Listen for zipcode_update |
| Frontend: User zip change handling | 20 min | Alert and refresh |
| Frontend: Account screen updates | 10 min | Call refresh after save |
| Testing all scenarios | 45 min | Comprehensive testing |
| Edge case handling | 15 min | Format variations, etc. |
| **Total** | **~3 hours** | Including testing |

---

*Plan created: December 2, 2025*  
*Ready for implementation: ✅*


