# Admin Panel Fixes - Implementation Plan

**Date:** 2025-12-10
**Issues Reported by:** Dayne Arnett
**Environment:** STAGING

---

## Overview

Three issues were reported on the STAGING admin panel:
1. Cannot delete/remove chefs and customers
2. Cannot see new menu categories requested
3. Cannot activate chefs from Pending to Active

---

## Issue 1: Cannot Delete/Remove Chefs and Customers

### Current Implementation

**Backend API:** `/adminapi/change_chef_status` in [AdminapiController.php:78-117](backend/app/Http/Controllers/AdminapiController.php#L78-L117)

```php
public function changeChefStatus(Request $request) {
    $ids = explode(',', $request->ids);
    // ...
    if ($request->status == 4) {
        app(Listener::class)->whereIn('id',$ids)->delete();
    }
    // ...
}
```

**Frontend UI:**
- Chefs page: [chefs.blade.php:19](backend/resources/views/admin/chefs.blade.php#L19) - Has "Deleted" button with `data-status="4"`
- Customers page: [customers.blade.php:16](backend/resources/views/admin/customers.blade.php#L16) - Has "Deleted" button with `data-status="4"`

**JavaScript Handler:** [chefs.js:59-102](backend/public/assets/admin/chefs.js#L59-L102) and [customers.js:55-68](backend/public/assets/admin/customers.js#L55-L68)

```javascript
$('.bt_status').click(function () {
    var status = $(this).data('status')
    // ...
    $.getJSON('/adminapi/change_chef_status?ids='+data+'&api_token='+token+'&status='+status, function(res) {
        window.location.reload();
    });
})
```

**API Token:** Injected in [admin.blade.php:10](backend/resources/views/layouts/admin.blade.php#L10)
```javascript
var token = '{{ Auth::guard("admin")->user()->api_token }}';
```

### Root Cause Analysis

The implementation exists and appears correct. Potential issues:

1. **API token not being generated/stored** - The `api_token` field in `tbl_admins` might be NULL on staging
2. **Silent AJAX failures** - The `$.getJSON` call has no error handler, so failures are silent
3. **CORS or middleware issues** - The `/adminapi/*` routes might have different middleware on staging

### Investigation Steps (Before Fix)

1. Check staging database: `SELECT id, email, api_token FROM tbl_admins;`
2. Check browser console for JavaScript errors when clicking "Deleted" button
3. Check network tab for the actual API response (401, 403, 500, etc.)

### Proposed Fix

**File:** [backend/public/assets/admin/chefs.js](backend/public/assets/admin/chefs.js)

Add error handling to the AJAX call to surface failures:

```javascript
// Lines 96-100: Change from $.getJSON to $.ajax with error handler
showConfirm("", "Are you sure you want to change the selected chefs status?", function () {
    $.ajax({
        url: '/adminapi/change_chef_status',
        method: 'GET',
        data: {
            ids: data,
            api_token: token,
            status: status
        },
        success: function(res) {
            if (res.success) {
                window.location.reload();
            } else {
                showAlert('Error: ' + (res.error || 'Unknown error'));
            }
        },
        error: function(xhr, status, error) {
            showAlert('Request failed: ' + error + ' (Status: ' + xhr.status + ')');
            console.error('API Error:', xhr.responseText);
        }
    });
})
```

**File:** [backend/public/assets/admin/customers.js](backend/public/assets/admin/customers.js)

Same change for customers page (lines 63-67).

**Additional:** If `api_token` is NULL in staging, ensure admin login generates it:

**File:** Check admin login controller to ensure api_token is generated on login.

---

## Issue 2: Cannot See New Menu Categories Requested

### Current Implementation

**Backend Controller:** [AdminController.php:118-126](backend/app/Http/Controllers/Admin/AdminController.php#L118-L126)

```php
public function categories(Request $request) {
    $data['categories'] = DB::table('tbl_categories as c')
        ->leftJoin('tbl_users as u', 'c.chef_id', '=', 'u.id')
        ->select(['c.*', 'u.email as user_email'])
        ->get();  // <-- Gets ALL categories, no filtering
    return view("admin.categories", $data);
}
```

**Frontend View:** [categories.blade.php](backend/resources/views/admin/categories.blade.php)
- Shows all categories in a single table
- Status buttons exist (Requested/Approved/Rejected) for changing status
- No visual distinction for pending items
- No filtering

### Root Cause

The categories page shows ALL categories (requested, approved, rejected) in one list. There's no:
- Filter to show only "Requested" (status=1) categories
- Visual highlighting for pending items
- Separate "New Requests" section
- Badge/notification for pending count

Category status values:
- `status=1`: Requested (pending approval)
- `status=2`: Approved
- `status=3`: Rejected

### Proposed Fix

**Option A: Add Default Filter for Requested Categories (Recommended)**

**File:** [backend/resources/views/admin/categories.blade.php](backend/resources/views/admin/categories.blade.php)

1. Add tab/toggle buttons to filter by status:

```html
<!-- Add after line 5, before div.div_table -->
<div class="flex flex_acenter mb10">
    <div class="fsize14 mr10">Filter:</div>
    <button class="bt_filter active" data-filter="requested">Requested ({{ $requestedCount }})</button>
    <button class="bt_filter" data-filter="approved">Approved</button>
    <button class="bt_filter" data-filter="rejected">Rejected</button>
    <button class="bt_filter" data-filter="all">All</button>
</div>
```

2. Add visual highlighting for requested categories (yellow/orange background)

**File:** [backend/app/Http/Controllers/Admin/AdminController.php](backend/app/Http/Controllers/Admin/AdminController.php)

Add count of requested categories:

```php
public function categories(Request $request) {
    // ... existing code ...
    $data['requestedCount'] = DB::table('tbl_categories')->where('status', 1)->count();
    return view("admin.categories", $data);
}
```

**File:** [backend/public/assets/admin/categories.js](backend/public/assets/admin/categories.js)

Add DataTable filtering by status column:

```javascript
// Add after table initialization
// Default filter to show only "Requested" categories
table.column(4).search('Requested').draw();

// Filter button handlers
$('.bt_filter').click(function() {
    $('.bt_filter').removeClass('active');
    $(this).addClass('active');
    var filter = $(this).data('filter');
    if (filter === 'all') {
        table.column(4).search('').draw();
    } else if (filter === 'requested') {
        table.column(4).search('Requested').draw();
    } else if (filter === 'approved') {
        table.column(4).search('Approved').draw();
    } else if (filter === 'rejected') {
        table.column(4).search('Rejected').draw();
    }
});
```

**Option B: Add Badge to Sidebar Menu**

Show pending count in the admin sidebar next to "Categories" menu item.

---

## Issue 3: Cannot Activate Chefs from Pending to Active (CRITICAL)

### Current Implementation

**Pendings Page:** [pendings.blade.php](backend/resources/views/admin/pendings.blade.php)
- Shows pending chefs in a table
- Has individual `<select>` dropdowns for status (lines 66-71) but these are NOT wired up
- **MISSING:** The action buttons that exist on the chefs page

**Chefs Page (working reference):** [chefs.blade.php:13-21](backend/resources/views/admin/chefs.blade.php#L13-L21)

```html
<div class="flex flex_acenter mb10">
    <div class="fsize18 font_bold">Change Selected Chefs Status:</div>
    <button class="bt_status color color1" data-status="0">Pending</button>
    <button class="bt_status color color3" data-status="1">Active</button>
    <button class="bt_status color color4" data-status="2">Rejected</button>
    <button class="bt_status color color2" data-status="4">Deleted</button>
    <button class="bt_status color color2" data-action="delete_stripe">Delete Stripe Account</button>
</div>
```

**JavaScript:** [chefs.js](backend/public/assets/admin/chefs.js) is loaded on pendings page (line 117), but the buttons don't exist to trigger it.

**Backend API:** The `/adminapi/change_chef_status` endpoint works correctly:
```php
// Status=1 activates chef and sends push notification
app(Listener::class)->whereIn('id',$ids)->update(['verified'=>$request->status, 'is_pending'=>0]);
```

### Root Cause

The pendings.blade.php template is **missing the action buttons section**. The chefs.js file is loaded and would work, but there are no buttons to click.

### Proposed Fix

**File:** [backend/resources/views/admin/pendings.blade.php](backend/resources/views/admin/pendings.blade.php)

Add the action buttons section. Insert after line 11 (before `<div class="div_table">`):

```html
<div class="div_table">
    <div class="flex flex_acenter mb10">
        <div class="fsize18 font_bold">Change Selected Chefs Status:</div>
        <button class="bt_status color color3" data-status="1">Activate (Active)</button>
        <button class="bt_status color color4" data-status="2">Reject</button>
        <button class="bt_status color color2" data-status="4">Delete</button>
    </div>
    <!-- existing table follows -->
```

Full diff for pendings.blade.php:

```diff
@@ -9,6 +9,12 @@
      <div class="flex flex_end mb10">
         <!--<a class="bt bt_new" style="margin:0" href="/admin/chef">+ Add</a>-->
      </div>
      <div class="div_table">
+        <div class="flex flex_acenter mb10">
+           <div class="fsize18 font_bold">Change Selected Chefs Status:</div>
+           <button class="bt_status color color3" data-status="1">Activate</button>
+           <button class="bt_status color color4" data-status="2">Reject</button>
+           <button class="bt_status color color2" data-status="4">Delete</button>
+        </div>
         <table class="table" id="table">
```

This will:
1. Allow admins to select pending chefs by clicking rows
2. Click "Activate" button to change status to Active (verified=1, is_pending=0)
3. Trigger push notification to newly activated chefs
4. The existing chefs.js already handles the `.bt_status` click events

---

## Summary of Changes

| Issue | File(s) to Modify | Priority |
|-------|-------------------|----------|
| 1. Delete chefs/customers | `chefs.js`, `customers.js` | Medium |
| 2. Category requests visibility | `categories.blade.php`, `categories.js`, `AdminController.php` | Medium |
| 3. Activate pending chefs | `pendings.blade.php` | **HIGH - Blocking testing** |

---

## Testing Plan

### Issue 1 (Delete)
1. Select a test chef/customer on staging
2. Click "Deleted" button
3. Check browser console for errors
4. Verify user is removed from database

### Issue 2 (Categories)
1. Create a new category request as a chef
2. Go to admin Categories page
3. Verify the new request appears and is visually distinct
4. Test the filter buttons work

### Issue 3 (Activate Chefs)
1. Go to /admin/pendings
2. Select a pending chef by clicking the row
3. Click "Activate" button
4. Confirm the prompt
5. Verify chef appears in /admin/chefs as Active
6. Verify chef can place test order

---

## Deployment Notes

- All changes are to backend blade templates and static JS files
- No database migrations required
- No new dependencies
- Can be deployed independently
- Recommend deploying Issue 3 first as it's blocking testing
