# TMA-022: Profile (Bio and Hours) Not Visible from Admin Panel - Investigation & Plan

**Status:** Not Started  
**Complexity:** 🟢 Simple  
**Estimated Time:** 1-2 hours

---

## Problem Statement

**Current Issue:**
Admins can only see chef bio and availability hours AFTER the chef is activated/approved. They need to see this information BEFORE approving the chef to make an informed decision.

**User Flow:**
1. Chef signs up → becomes pending (`is_pending=1`, `verified=0`)
2. Chef fills out profile including bio and hours → saved to `tbl_availabilities`
3. Admin reviews pending chef in "Pendings" page → **CANNOT see bio/hours** ❌
4. Admin approves chef (changes to `verified=1`, `is_pending=0`)
5. Chef appears in "Profiles" page → **NOW bio/hours are visible** ✅

**Why This is a Problem:**
- Admins are approving chefs "blind" without seeing critical business information
- Bio quality should be reviewed before approval
- Availability hours should be verified for reasonableness
- Admins may need to contact chef about incomplete profiles before approving

---

## Current Implementation

### 1. Pendings Page (BROKEN)
**File:** `backend/resources/views/admin/pendings.blade.php`  
**Lines:** 1-94

**Controller Method:**
```php
// backend/app/Http/Controllers/Admin/AdminController.php (line 98-105)
public function pendings(Request $request) {
    $data['title'] = "Taist - Admin Panel";
    $user = $this->guard()->user();
    $data['user'] = $user;
    $data['pendings'] = app(Listener::class)
        ->where(['user_type'=>2, 'is_pending'=>1])
        ->get();  // ❌ Does NOT join with tbl_availabilities
    
    return view("admin.pendings", $data);
}
```

**View Columns Displayed:**
- Chef ID
- Email
- First Name
- Last Name
- Phone
- Birthday
- Address
- City
- State
- Zip
- Status (dropdown to approve/reject)
- Photo
- Created at

**Missing Columns:**
- ❌ Bio
- ❌ Monday hours
- ❌ Tuesday hours
- ❌ Wednesday hours
- ❌ Thursday hours
- ❌ Friday hours
- ❌ Saturday hours
- ❌ Sunday hours
- ❌ Min Order Amount
- ❌ Max Order Distance

### 2. Profiles Page (WORKING CORRECTLY)
**File:** `backend/resources/views/admin/profiles.blade.php`  
**Lines:** 1-71

**Controller Method:**
```php
// backend/app/Http/Controllers/Admin/AdminController.php (line 176-184)
public function profiles(Request $request) {
    $data['title'] = "Taist - Admin Panel";
    $user = $this->guard()->user();
    $data['user'] = $user;
    $data['profiles'] = DB::table('tbl_users as u')
        ->leftJoin('tbl_availabilities as a', 'a.user_id', '=', 'u.id')  // ✅ JOINS with availabilities
        ->where(['user_type' => 2, 'is_pending' => 0, 'verified' => 1])
        ->select([
            'u.*', 
            'a.bio', 
            'a.monday_start', 'a.monday_end',
            'a.tuesday_start', 'a.tuesday_end',
            'a.wednesday_start', 'a.wednesday_end',
            'a.thursday_start', 'a.thursday_end',
            'a.friday_start', 'a.friday_end',
            'a.saterday_start', 'a.saterday_end',
            'a.sunday_start', 'a.sunday_end',
            'a.minimum_order_amount',
            'a.max_order_distance'
        ])
        ->get();
    
    return view("admin.profiles", $data);
}
```

**View Columns Displayed:**
- ✅ All the columns from Pendings page PLUS:
- ✅ Bio
- ✅ All 7 days with start/end times
- ✅ Min Order Amount
- ✅ Max Order Distance
- ✅ Edit button

### 3. Database Structure

**Tables Involved:**
1. **`tbl_users`** - User account information
   - `id`, `email`, `first_name`, `last_name`, `phone`, etc.
   - `user_type` - 1=customer, 2=chef
   - `is_pending` - 0=approved, 1=pending approval
   - `verified` - 0=pending, 1=active, 2=rejected, 3=banned

2. **`tbl_availabilities`** - Chef profile and hours
   - `user_id` (foreign key to tbl_users)
   - `bio` - Chef biography
   - `monday_start`, `monday_end` - Timestamps
   - `tuesday_start`, `tuesday_end` - Timestamps
   - `wednesday_start`, `wednesday_end` - Timestamps
   - `thursday_start`, `thursday_end` - Timestamps
   - `friday_start`, `friday_end` - Timestamps
   - `saterday_start`, `saterday_end` - Timestamps
   - `sunday_start`, `sunday_end` - Timestamps
   - `minimum_order_amount` - Decimal
   - `max_order_distance` - Decimal

**Relationship:**
- One-to-one relationship
- Chef creates availability record from Profile screen in app
- Can exist even when chef is still pending

### 4. Chef Signup Flow

**When Bio/Hours Are Created:**

1. **Signup Phase** (`frontend/app/screens/common/signup/index.tsx`)
   - Chef provides email/password
   - Creates user record with `is_pending=1`, `verified=0`

2. **Profile Completion** (`frontend/app/screens/chef/profile/index.tsx`)
   - Chef fills out bio
   - Sets availability for each day of week
   - Sets minimum order amount and max distance
   - Calls `CreateAvailabiltyAPI()` or `UpdateAvailabiltyAPI()`
   - This creates/updates the `tbl_availabilities` record

3. **Admin Review** - Currently broken!
   - Admin goes to "Pendings" page
   - **Cannot see the bio/hours that chef just filled out**
   - Has to approve based only on basic user info

---

## Root Cause Analysis

**The Problem:**
The `pendings()` controller method queries ONLY the `tbl_users` table and doesn't join with `tbl_availabilities`.

**Why It Matters:**
- Even though the chef HAS filled out their profile, the admin panel query doesn't retrieve it
- The data exists in the database, it's just not being queried/displayed

**Simple Fix:**
Make the `pendings()` method query the same way as the `profiles()` method - with a LEFT JOIN to `tbl_availabilities`.

---

## Implementation Plan

### Backend Changes

#### File: `backend/app/Http/Controllers/Admin/AdminController.php`

**Update the `pendings()` method (line 98-105):**

```php
public function pendings(Request $request) {
    $data['title'] = "Taist - Admin Panel";
    $user = $this->guard()->user();
    $data['user'] = $user;
    
    // OLD CODE (line 102):
    // $data['pendings'] = app(Listener::class)->where(['user_type'=>2, 'is_pending'=>1])->get();
    
    // NEW CODE - Match the profiles() method:
    $data['pendings'] = DB::table('tbl_users as u')
        ->leftJoin('tbl_availabilities as a', 'a.user_id', '=', 'u.id')
        ->where(['user_type' => 2, 'is_pending' => 1])
        ->select([
            'u.*',
            'a.bio',
            'a.monday_start', 'a.monday_end',
            'a.tuesday_start', 'a.tuesday_end',
            'a.wednesday_start', 'a.wednesday_end',
            'a.thursday_start', 'a.thursday_end',
            'a.friday_start', 'a.friday_end',
            'a.saterday_start', 'a.saterday_end',
            'a.sunday_start', 'a.sunday_end',
            'a.minimum_order_amount',
            'a.max_order_distance'
        ])
        ->get();
    
    return view("admin.pendings", $data);
}
```

**Why LEFT JOIN?**
- LEFT JOIN ensures we still show pending chefs even if they haven't filled out their availability yet
- If they haven't filled it out, bio and hours will be NULL
- If they have filled it out, we'll see the data

### Frontend Changes

#### File: `backend/resources/views/admin/pendings.blade.php`

**Update the table headers (line 18-33) to add new columns:**

```html
<thead>
   <tr>
      <th>Chef ID</th>
      <th>Email</th>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Phone</th>
      <th>Birthday</th>
      <th>Address</th>
      <th>City</th>
      <th>State</th>
      <th>Zip</th>
      <!-- ADD THESE NEW COLUMNS: -->
      <th>Bio</th>
      <th>Monday</th>
      <th>Tuesday</th>
      <th>Wednesday</th>
      <th>Thursday</th>
      <th>Friday</th>
      <th>Saturday</th>
      <th>Sunday</th>
      <th>Min Order Amount</th>
      <th>Max Order Distance</th>
      <!-- END NEW COLUMNS -->
      <th>Status</th>
      <th>Photo</th>
      <th>Created at</th>
   </tr>
</thead>
```

**Update the table body (line 36-62) to display new columns:**

```html
<tbody>
   <?php foreach ($pendings as $a) { ?>
      <tr id="<?php echo $a->id;?>">
         <td><?php echo 'CHEF'.sprintf('%07d', $a->id);?></td>
         <td><?php echo $a->email;?></td>
         <td><?php echo $a->first_name;?></td>
         <td><?php echo $a->last_name;?></td>
         <td><?php echo $a->phone;?></td>
         <td class="date" date="<?php echo $a->birthday;?>"></td>
         <td><?php echo $a->address;?></td>
         <td><?php echo $a->city;?></td>
         <td><?php echo $a->state;?></td>
         <td><?php echo $a->zip;?></td>
         
         <!-- ADD NEW CELLS: -->
         <td><?php echo $a->bio ?? 'Not provided';?></td>
         <td><?php echo $a->monday_start?date('H:i', $a->monday_start):'';?> - <?php echo $a->monday_end?date('H:i', $a->monday_end):'';?></td>
         <td><?php echo $a->tuesday_start?date('H:i', $a->tuesday_start):'';?> - <?php echo $a->tuesday_end?date('H:i', $a->tuesday_end):'';?></td>
         <td><?php echo $a->wednesday_start?date('H:i', $a->wednesday_start):'';?> - <?php echo $a->wednesday_end?date('H:i', $a->wednesday_end):'';?></td>
         <td><?php echo $a->thursday_start?date('H:i', $a->thursday_start):'';?> - <?php echo $a->thursday_end?date('H:i', $a->thursday_end):'';?></td>
         <td><?php echo $a->friday_start?date('H:i', $a->friday_start):'';?> - <?php echo $a->friday_end?date('H:i', $a->friday_end):'';?></td>
         <td><?php echo $a->saterday_start?date('H:i', $a->saterday_start):'';?> - <?php echo $a->saterday_end?date('H:i', $a->saterday_end):'';?></td>
         <td><?php echo $a->sunday_start?date('H:i', $a->sunday_start):'';?> - <?php echo $a->sunday_end?date('H:i', $a->sunday_end):'';?></td>
         <td><?php echo $a->minimum_order_amount ?? 'Not set';?></td>
         <td><?php echo $a->max_order_distance ?? 'Not set';?></td>
         <!-- END NEW CELLS -->
         
         <td>
            <select id="user_status">
               <option value="0" <?php echo $a->verified==0?'selected':'';?>>Pending</option>
               <option value="1" <?php echo $a->verified==1?'selected':'';?>>Chef</option>
               <option value="2" <?php echo $a->verified==2?'selected':'';?>>Rejected</option>
               <option value="3" <?php echo $a->verified==3?'selected':'';?>>Banned</option>
            </select>
         </td>
         <td><?php echo $a->photo;?></td>
         <td class="date" date="<?php echo $a->created_at;?>"></td>
      </tr>
   <?php } ?>
</tbody>
```

**Update the table footer (line 65-83) to match new columns:**

```html
<tfoot>
   <tr>
      <th>Chef ID</th>
      <th>Email</th>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Phone</th>
      <th>Birthday</th>
      <th>Address</th>
      <th>City</th>
      <th>State</th>
      <th>Zip</th>
      <!-- ADD NEW FOOTER COLUMNS: -->
      <th>Bio</th>
      <th>Monday</th>
      <th>Tuesday</th>
      <th>Wednesday</th>
      <th>Thursday</th>
      <th>Friday</th>
      <th>Saturday</th>
      <th>Sunday</th>
      <th>Min Order Amount</th>
      <th>Max Order Distance</th>
      <!-- END NEW FOOTER COLUMNS -->
      <th>Status</th>
      <th>Photo</th>
      <th>Created at</th>
   </tr>
</tfoot>
```

---

## CSS/UI Considerations

**Issue:** Adding 10+ new columns will make the table very wide

**Solutions:**

### Option 1: Make Table Horizontally Scrollable (Easiest)
The table already appears to be in a `div_table` container - ensure it has overflow-x:

```css
.div_table {
    overflow-x: auto;
    width: 100%;
}
```

### Option 2: Make Bio and Hours Collapsible (Better UX)
Add a toggle button to show/hide availability columns:

```html
<button onclick="toggleAvailability()">Show/Hide Availability</button>
```

### Option 3: Create a Detail View (Best but More Work)
Add a "View Details" button that opens a modal or separate page showing full bio and hours:

```html
<td class="tright">
   <a class="bt_view clrblue1 mr20" href="/admin/pendings/<?php echo $a->id;?>">View Details</a>
</td>
```

**Recommendation:** 
- **Phase 1 (MVP):** Use Option 1 - simple scrollable table
- **Phase 2 (Polish):** Add Option 2 or 3 if feedback suggests table is too wide

---

## Testing Plan

### Test Cases

1. **Pending chef WITH bio and hours filled out:**
   - [ ] Bio displays correctly
   - [ ] All 7 days show correct hours in H:i format (e.g., "09:00 - 17:00")
   - [ ] Empty days show blank or dash
   - [ ] Min order amount displays
   - [ ] Max distance displays

2. **Pending chef WITHOUT bio/hours (new signup):**
   - [ ] Row still displays
   - [ ] Bio shows "Not provided" or blank
   - [ ] Hour columns show blank
   - [ ] Min/max show "Not set" or blank
   - [ ] No errors or broken layout

3. **Status dropdown still works:**
   - [ ] Can change status from Pending to Chef
   - [ ] Can reject/ban if needed
   - [ ] Status persists after page reload

4. **Table layout:**
   - [ ] Table is scrollable horizontally if too wide
   - [ ] All columns are readable
   - [ ] Export to Excel still works

5. **Data integrity:**
   - [ ] Hours display as times not timestamps
   - [ ] Timezone handling (if applicable)
   - [ ] Special characters in bio don't break layout

### Test Data Scenarios

**Scenario A: Complete Profile**
- Chef: john@example.com
- Bio: "I specialize in Italian cuisine with 10 years experience..."
- Hours: Mon-Fri 10:00-18:00, Sat 12:00-20:00
- Min order: $25
- Max distance: 15 miles

**Scenario B: Partial Profile**
- Chef: jane@example.com
- Bio: Present
- Hours: Only Mon-Wed filled
- Min/max: Not set

**Scenario C: No Profile**
- Chef: bob@example.com
- Just signed up, no availability record exists
- All profile fields should show as empty/not provided

---

## Estimated Implementation Time

| Task | Time | Notes |
|------|------|-------|
| Update controller method | 5 min | Copy from profiles() method |
| Update view template (headers) | 5 min | Add column headers |
| Update view template (body) | 10 min | Add data cells with formatting |
| Update view template (footer) | 2 min | Match headers |
| Test with real data | 20 min | Create test scenarios |
| Fix any styling issues | 10 min | Ensure table is readable |
| Verify status dropdown still works | 5 min | Test approval flow |
| **Total** | **~1 hour** | Plus testing time |

---

## Potential Issues & Solutions

### Issue 1: Table Too Wide
**Problem:** 20+ columns makes table difficult to view  
**Solution:** Add horizontal scroll or prioritize essential columns

### Issue 2: Bio Text Too Long
**Problem:** Long bios make table row very tall  
**Solution:** 
```php
<td><?php echo substr($a->bio ?? '', 0, 100);?><?php echo strlen($a->bio ?? '') > 100 ? '...' : '';?></td>
```
Or add a tooltip/modal for full bio

### Issue 3: Time Formatting
**Problem:** Timestamps stored as Unix timestamps need formatting  
**Solution:** Already handled in profiles page with `date('H:i', $timestamp)`

### Issue 4: NULL Values
**Problem:** LEFT JOIN means some fields might be NULL  
**Solution:** Use `?? 'default value'` operator throughout template

### Issue 5: Status Dropdown Conflicts
**Problem:** Adding columns might affect existing JavaScript  
**Solution:** Test status change functionality after implementation

---

## Rollback Plan

If issues arise, rollback is simple:

1. **Controller:** Revert to original query (line 102 in AdminController.php)
2. **View:** Restore original pendings.blade.php from git

**Git commands:**
```bash
git checkout backend/app/Http/Controllers/Admin/AdminController.php
git checkout backend/resources/views/admin/pendings.blade.php
```

---

## Alternative Approaches Considered

### Alternative 1: Separate "View Profile" Page
**Pros:** Clean, doesn't clutter table  
**Cons:** Extra clicks, slower workflow  
**Verdict:** Better for polish phase, not MVP

### Alternative 2: Expandable Rows
**Pros:** Clean main view, details on demand  
**Cons:** Requires JavaScript, more complex  
**Verdict:** Good for Phase 2

### Alternative 3: Summary Icons/Indicators
**Pros:** Shows if profile is complete without showing details  
**Cons:** Still need to click through to see actual content  
**Verdict:** Could complement main solution

**Recommended:** Implement the straightforward table approach first (as outlined above), then add refinements based on admin feedback.

---

## Success Criteria

✅ **Task is complete when:**
1. Pendings page displays bio column
2. Pendings page displays all 7 day availability columns
3. Pendings page displays min order amount and max distance
4. Empty/NULL values handled gracefully
5. Status approval workflow still functions
6. Table is readable (scrollable if needed)
7. No errors in browser console or Laravel logs

---

## Files to Modify

**Backend:**
- `backend/app/Http/Controllers/Admin/AdminController.php` (1 method, ~15 lines)

**Frontend/View:**
- `backend/resources/views/admin/pendings.blade.php` (add ~10 columns to table)

**Total:** 2 files

---

## Dependencies

**None** - This is a self-contained change that doesn't affect:
- Mobile app
- API endpoints  
- Database schema (uses existing structure)
- Other admin pages

---

## Post-Implementation

After implementation, monitor for:
- Admin feedback on table width/usability
- Any performance issues with the JOIN query
- Requests for additional profile fields to display
- Need for filtering/sorting by availability

Consider adding in future:
- "View Full Profile" modal
- Filter by "has bio" / "no bio"
- Sort by completion percentage
- Highlight incomplete profiles

---

*Investigation completed: December 2, 2025*  
*Ready for implementation: ✅*


