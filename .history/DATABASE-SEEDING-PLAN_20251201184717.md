# Database Setup & Seeding Plan

Complete plan for setting up a local Taist database with realistic test data.

---

## 📊 Current State

- **Migrations**: Exist but only 2 recent ones found (notifications, versions)
- **Seeders**: Empty DatabaseSeeder.php (no logic)
- **Tables**: ~15+ tables based on models (users, menus, orders, etc.)
- **Data**: None - needs comprehensive test data

---

## 🎯 Goals

Create a fully functional local database with:
1. ✅ Active service areas (ZIP codes)
2. ✅ Reference data (categories, allergens, appliances)
3. ✅ Test users (customers, chefs, admin)
4. ✅ Chef profiles with availability schedules
5. ✅ Menu items with images and customizations
6. ✅ Sample reviews and ratings
7. ✅ Realistic test orders (optional)

---

## 📋 Database Tables & Dependencies

### Dependency Order (Bottom-up)

```
Level 1 (No dependencies):
├── tbl_categories          # Menu categories
├── tbl_allergens          # Food allergens
├── tbl_appliances         # Kitchen equipment
└── tbl_zipcodes           # Service areas

Level 2 (Depends on Level 1):
├── tbl_users              # Customers & chefs
└── tbl_admins            # Admin users

Level 3 (Depends on Users):
├── tbl_chef_profiles      # Chef details
└── tbl_availabilities     # Chef schedules

Level 4 (Depends on Chef + Categories):
└── tbl_menus             # Menu items

Level 5 (Depends on Menus):
└── tbl_customizations    # Menu add-ons

Level 6 (Depends on Users + Menus):
├── tbl_orders            # Customer orders
└── tbl_conversations     # Chat threads

Level 7 (Depends on Orders):
├── tbl_order_items       # Order details
├── tbl_reviews           # Chef reviews
└── tbl_transactions      # Payments
```

---

## 🗂️ Data to Seed

### 1. ZIP Codes (tbl_zipcodes) - ~20 entries

**Purpose**: Define service areas where chefs can operate

**Sample Data**:
```
California:
- 94102 (San Francisco) ✅
- 94103 (San Francisco) ✅
- 90210 (Beverly Hills) ✅
- 90211 (Beverly Hills) ✅
- 94607 (Oakland) ✅

New York:
- 10001 (Manhattan) ✅
- 10002 (Manhattan) ✅
- 11201 (Brooklyn) ✅
- 11211 (Brooklyn) ✅

Texas:
- 78701 (Austin) ✅
- 78702 (Austin) ✅
- 75201 (Dallas) ✅

Illinois:
- 60601 (Chicago) ✅
- 60602 (Chicago) ✅

Florida:
- 33139 (Miami Beach) ✅
- 33140 (Miami Beach) ✅
```

**Fields**:
- `zipcodes` (e.g., "94102")
- `city` (e.g., "San Francisco")
- `state` (e.g., "CA")
- `is_active` (1)
- `delivery_fee` (optional, e.g., 5.00)
- `tax_rate` (optional, e.g., 8.5)

---

### 2. Categories (tbl_categories) - ~12 entries

**Purpose**: Menu item categories

**Sample Data**:
```
Breakfast & Brunch:
- Breakfast Classics ✅
- Brunch Specials ✅

Lunch & Dinner:
- Appetizers ✅
- Soups & Salads ✅
- Main Courses ✅
- Entrees ✅
- Pasta & Noodles ✅
- Seafood ✅
- Vegetarian ✅

Sides & Extras:
- Side Dishes ✅

Desserts:
- Desserts & Sweets ✅
- Baked Goods ✅
```

**Fields**:
- `name` (e.g., "Appetizers")
- `description` (e.g., "Small bites to start your meal")
- `image` (optional)
- `display_order` (1, 2, 3...)
- `is_active` (1)

---

### 3. Allergens (tbl_allergens) - ~14 entries

**Purpose**: Food allergen tracking

**Sample Data**:
```
Common Allergens:
- Peanuts ✅
- Tree Nuts ✅
- Milk/Dairy ✅
- Eggs ✅
- Wheat/Gluten ✅
- Soy ✅
- Fish ✅
- Shellfish ✅
- Sesame ✅

Other:
- Corn ✅
- Mustard ✅
- Sulfites ✅
- Celery ✅
- Lupin ✅
```

**Fields**:
- `name` (e.g., "Peanuts")
- `description` (optional)
- `icon` (optional)

---

### 4. Appliances (tbl_appliances) - ~15 entries

**Purpose**: Kitchen equipment chefs may need

**Sample Data**:
```
Cooking Appliances:
- Oven ✅
- Stovetop ✅
- Microwave ✅
- Air Fryer ✅
- Slow Cooker ✅
- Instant Pot ✅
- Grill ✅
- Griddle ✅

Prep Equipment:
- Blender ✅
- Food Processor ✅
- Stand Mixer ✅
- Hand Mixer ✅

Specialty:
- Sous Vide ✅
- Deep Fryer ✅
- Toaster Oven ✅
```

**Fields**:
- `name` (e.g., "Oven")
- `description` (optional)

---

### 5. Users (tbl_users) - ~15-20 entries

**Purpose**: Test customers and chefs

#### A. Customers (~5 users)

**Sample Data**:
```
1. Test Customer 1
   - Email: customer1@test.com
   - Password: password123
   - Name: John, Smith
   - Phone: (555) 111-0001
   - ZIP: 94102 (SF)
   - user_type: 1

2. Test Customer 2
   - Email: customer2@test.com
   - Name: Jane, Doe
   - ZIP: 10001 (NYC)
   - user_type: 1

3. Test Customer 3
   - Email: customer3@test.com
   - Name: Mike, Johnson
   - ZIP: 78701 (Austin)
   - user_type: 1

4. Test Customer 4
   - Email: customer4@test.com
   - Name: Sarah, Williams
   - ZIP: 60601 (Chicago)
   - user_type: 1

5. Test Customer 5
   - Email: customer5@test.com
   - Name: David, Brown
   - ZIP: 33139 (Miami)
   - user_type: 1
```

#### B. Chefs (~10-12 users)

**Sample Data**:
```
San Francisco Area:
1. Chef Maria Garcia
   - Email: maria@cheftaist.com
   - Specialty: Italian Cuisine
   - ZIP: 94102
   - Bio: "Authentic Italian recipes from my grandmother"
   - user_type: 2

2. Chef James Chen
   - Email: james@cheftaist.com
   - Specialty: Asian Fusion
   - ZIP: 94103
   - user_type: 2

3. Chef Sophie Laurent
   - Email: sophie@cheftaist.com
   - Specialty: French Pastries
   - ZIP: 94607
   - user_type: 2

New York Area:
4. Chef Michael Rodriguez
   - Email: michael@cheftaist.com
   - Specialty: Latin American
   - ZIP: 10001
   - user_type: 2

5. Chef Emily Thompson
   - Email: emily@cheftaist.com
   - Specialty: Vegan & Healthy
   - ZIP: 11201
   - user_type: 2

Austin Area:
6. Chef Robert "BBQ Bob" Johnson
   - Email: bbqbob@cheftaist.com
   - Specialty: Texas BBQ
   - ZIP: 78701
   - user_type: 2

7. Chef Lisa Martinez
   - Email: lisa@cheftaist.com
   - Specialty: Tex-Mex
   - ZIP: 78702
   - user_type: 2

Chicago Area:
8. Chef Antonio Russo
   - Email: antonio@cheftaist.com
   - Specialty: Deep Dish Pizza
   - ZIP: 60601
   - user_type: 2

Miami Area:
9. Chef Carlos Diaz
   - Email: carlos@cheftaist.com
   - Specialty: Cuban Cuisine
   - ZIP: 33139
   - user_type: 2

10. Chef Isabella Romano
    - Email: isabella@cheftaist.com
    - Specialty: Mediterranean
    - ZIP: 33140
    - user_type: 2
```

**Fields**:
- `first_name`, `last_name`
- `email` (unique)
- `password` (hashed)
- `phone`
- `address`, `city`, `state`, `zip`
- `user_type` (1=customer, 2=chef)
- `is_pending` (0 for active)
- `verified` (1)
- `photo` (placeholder or actual image)
- `latitude`, `longitude` (optional)

---

### 6. Chef Profiles (tbl_chef_profiles) - ~10 entries

**Purpose**: Detailed chef information

**Sample Data** (for each chef):
```
{
  chef_user_id: <user_id>,
  bio: "Passionate chef with 10+ years experience...",
  specialties: "Italian, Pasta, Risotto",
  monday_start: 32400 (9:00 AM in seconds),
  monday_end: 68400 (7:00 PM),
  tuesday_start: 32400,
  tuesday_end: 68400,
  // ... similar for all days
  rating: 4.5,
  total_orders: 127,
  response_time: "< 2 hours",
  has_food_handlers_cert: 1,
  kitchen_photos: JSON array of photo URLs
}
```

**Fields**:
- Weekly schedule (start/end times for each day)
- Bio and specialties
- Ratings and stats
- Certifications
- Photos

---

### 7. Availabilities (tbl_availabilities) - Optional

**Purpose**: More granular chef availability (if separate from profiles)

Can be auto-generated from chef_profiles schedule or skipped if redundant.

---

### 8. Menu Items (tbl_menus) - ~50-100 entries

**Purpose**: Chef menu offerings

**Sample Data** (5-10 items per chef):

#### Chef Maria (Italian):
```
1. Homemade Lasagna
   - Category: Main Courses
   - Price: $24.99
   - Description: "Layered pasta with beef, ricotta, and marinara"
   - Prep time: 45 minutes
   - Images: ["lasagna1.jpg", "lasagna2.jpg"]
   - Allergens: [Dairy, Wheat, Eggs]

2. Margherita Pizza
   - Category: Main Courses
   - Price: $18.99
   - Description: "Classic tomato, mozzarella, basil"
   - Prep time: 30 minutes
   - Allergens: [Dairy, Wheat]

3. Tiramisu
   - Category: Desserts
   - Price: $8.99
   - Description: "Coffee-soaked ladyfingers with mascarpone"
   - Prep time: 15 minutes
   - Allergens: [Dairy, Eggs]
```

#### Chef James (Asian Fusion):
```
1. Kung Pao Chicken
   - Category: Main Courses
   - Price: $16.99
   - Allergens: [Peanuts, Soy]

2. Vegetable Fried Rice
   - Category: Entrees
   - Price: $12.99
   - Allergens: [Soy, Eggs]

3. Spring Rolls (6pcs)
   - Category: Appetizers
   - Price: $7.99
   - Allergens: [Wheat, Soy]
```

#### Chef Sophie (French Pastries):
```
1. Croissants (3pcs)
   - Category: Baked Goods
   - Price: $9.99
   - Allergens: [Wheat, Dairy, Eggs]

2. Crème Brûlée
   - Category: Desserts
   - Price: $7.99
   - Allergens: [Dairy, Eggs]
```

**Fields**:
- `chef_id` (foreign key)
- `category_id` (foreign key)
- `name`
- `description`
- `price` (decimal)
- `images` (JSON array)
- `preparation_time` (minutes)
- `is_available` (1)
- `allergen_info` (JSON array of allergen IDs)
- `serving_size` (e.g., "Serves 2-3")

---

### 9. Customizations (tbl_customizations) - ~50-100 entries

**Purpose**: Menu item add-ons and options

**Sample Data** (for relevant menu items):
```
For Lasagna:
1. Extra Cheese
   - Type: checkbox
   - Price: +$2.00

2. Spice Level
   - Type: dropdown
   - Options: ["Mild", "Medium", "Spicy"]
   - Price: $0.00

3. Add Garlic Bread
   - Type: checkbox
   - Price: +$4.00

For Pizza:
1. Size
   - Type: radio
   - Options: ["Personal (8in)", "Medium (12in)", "Large (16in)"]
   - Prices: [0, +$5, +$10]
   - Required: true

2. Extra Toppings
   - Type: checkboxes
   - Options: ["Pepperoni", "Mushrooms", "Olives", "Peppers"]
   - Price: +$1.50 each
```

**Fields**:
- `menu_id` (foreign key)
- `name` (e.g., "Extra Cheese")
- `type` (checkbox, radio, dropdown, text)
- `options` (JSON array if applicable)
- `upcharge_price` (decimal)
- `is_required` (0 or 1)

---

### 10. Reviews (tbl_reviews) - ~20-30 entries

**Purpose**: Chef ratings and feedback

**Sample Data**:
```
For Chef Maria:
1. ⭐⭐⭐⭐⭐ (5 stars)
   - Customer: John Smith
   - Review: "Best lasagna I've ever had! Maria is amazing!"
   - Date: 2 weeks ago

2. ⭐⭐⭐⭐ (4 stars)
   - Customer: Jane Doe
   - Review: "Delicious food, slightly late delivery"
   - Date: 1 week ago
   - Chef Response: "Thank you! Sorry about the delay..."

For Chef James:
1. ⭐⭐⭐⭐⭐ (5 stars)
   - Customer: Mike Johnson
   - Review: "Kung Pao was perfectly spiced!"
   - Date: 3 days ago
```

**Fields**:
- `order_id` (foreign key, can be NULL for test data)
- `customer_id` (foreign key)
- `chef_id` (foreign key)
- `rating` (1-5)
- `review_text`
- `photos` (JSON array, optional)
- `chef_response` (optional)
- `created_at`

---

### 11. Orders (tbl_orders) - Optional, ~10 entries

**Purpose**: Sample order history (optional for testing)

**Fields**:
- Customer, Chef IDs
- Status (delivered, pending, etc.)
- Items, pricing
- Delivery info

**Note**: Can skip initially and create orders through the app instead.

---

## 🛠️ Implementation Strategy

### Phase 1: Setup & Reference Data (Quick Win)
**Goal**: Get basic structure working ASAP

1. Create database: `taist_local`
2. Run migrations: `php artisan migrate`
3. Seed reference data:
   - ZIP codes (20)
   - Categories (12)
   - Allergens (14)
   - Appliances (15)

**Result**: App can load but no chefs yet

---

### Phase 2: Users & Chefs (Core Functionality)
**Goal**: Enable browsing chefs

4. Seed users:
   - 5 test customers
   - 10 test chefs
5. Seed chef profiles
6. Link chefs to appliances (many-to-many)

**Result**: Chefs appear in app, can view profiles

---

### Phase 3: Menu Items (Main Feature)
**Goal**: Enable ordering

7. Seed menu items (5-10 per chef = 50-100 total)
8. Seed customizations for relevant items
9. Link menus to allergens (many-to-many)

**Result**: Can browse menus, add to cart

---

### Phase 4: Social Proof (Polish)
**Goal**: Make it look real

10. Seed reviews (2-3 per chef = 20-30 total)
11. Update chef ratings based on reviews

**Result**: Chefs have realistic ratings and reviews

---

### Phase 5: Optional Extras
**Goal**: Full ecosystem

12. Seed sample conversations (optional)
13. Seed sample orders (optional)
14. Add admin users (optional)

**Result**: Fully populated database

---

## 📝 Seeder Files to Create

```
backend/database/seeds/
├── DatabaseSeeder.php (orchestrator)
├── ZipcodeSeeder.php
├── CategorySeeder.php
├── AllergenSeeder.php
├── ApplianceSeeder.php
├── UserSeeder.php
├── ChefProfileSeeder.php
├── MenuSeeder.php
├── CustomizationSeeder.php
├── ReviewSeeder.php
└── (optional) OrderSeeder.php
```

---

## ⚙️ Seeder Configuration

### Realistic vs Fast Mode

**Fast Mode** (Quick Testing):
- 5 chefs
- 3 menu items per chef
- 1 review per chef
- **Total: ~30 records**
- **Time: ~5 seconds**

**Realistic Mode** (Full Demo):
- 10-12 chefs
- 8-10 menu items per chef
- 2-3 reviews per chef
- **Total: ~150 records**
- **Time: ~15 seconds**

**Production-Like** (Comprehensive):
- 20 chefs
- 15 menu items per chef
- 5 reviews per chef
- Sample orders
- **Total: ~400+ records**
- **Time: ~30 seconds**

---

## 🎯 Success Criteria

After seeding, you should be able to:

1. ✅ Open app and see list of chefs in your area
2. ✅ Filter chefs by ZIP code
3. ✅ View chef profiles with ratings
4. ✅ Browse menu items with photos
5. ✅ See menu item customizations
6. ✅ Add items to cart
7. ✅ See allergen information
8. ✅ Read chef reviews
9. ✅ Place test orders (with full address)
10. ✅ Test checkout flow end-to-end

---

## 📊 Database Size Estimates

### Minimal Setup:
- ZIP codes: ~1 KB
- Categories: ~1 KB
- Allergens: ~1 KB
- Appliances: ~1 KB
- Users: ~5 KB
- Menus: ~20 KB
- **Total: ~30 KB**

### Realistic Setup:
- ZIP codes: ~2 KB
- Reference data: ~5 KB
- Users & profiles: ~15 KB
- Menus & customizations: ~50 KB
- Reviews: ~10 KB
- **Total: ~100 KB**

### With Images:
- If using real image URLs: Same as above
- If storing base64: Add 1-2 MB
- **Recommendation**: Use image URLs, not base64

---

## 🚀 Execution Plan

### Option A: Manual SQL Import (Fastest)
1. Create SQL dump file with all test data
2. Import: `mysql taist_local < test_data.sql`
3. **Time: 1 minute**

### Option B: Laravel Seeders (Recommended)
1. Create seeder classes
2. Run: `php artisan db:seed`
3. **Time: 5-10 minutes** (one-time setup)
4. **Benefit**: Reusable, version controlled, customizable

### Option C: Hybrid Approach (Best)
1. Create seeders with faker library
2. Add flag for quick vs full seed
3. Run: `php artisan db:seed --class=QuickSeeder`
4. **Benefit**: Fast for testing, comprehensive for demo

---

## 🎨 Image Strategy

### For Realistic Demo:

**Option 1: Placeholder Service**
- Use: https://via.placeholder.com/400x300.png
- Or: https://picsum.photos/400/300
- **Pros**: Fast, no storage
- **Cons**: Generic images

**Option 2: Unsplash API**
- Use: https://source.unsplash.com/400x300/?food
- **Pros**: Real food photos
- **Cons**: Random, may not match dish

**Option 3: Pre-defined URLs**
- Store curated image URLs in seeder
- Use Unsplash direct links for specific dishes
- **Pros**: Realistic and relevant
- **Cons**: Manual curation needed

**Recommendation**: Option 3 with ~20-30 curated food images

---

## 📋 Next Steps

1. **Review this plan** - Confirm scope and priorities
2. **Choose seeding mode** - Fast, Realistic, or Production-Like
3. **Decide on images** - Placeholder, API, or curated URLs
4. **Implement seeders** - Start with Phase 1 (reference data)
5. **Test progressively** - Verify each phase works
6. **Document** - Add seeder usage to README

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Create database | 2 min |
| Run migrations | 2 min |
| Write seeders (all) | 2-3 hours |
| Run seeders | 10-30 seconds |
| Verify data | 10 min |
| **Total First Time** | **3-4 hours** |
| **Subsequent Runs** | **~5 minutes** |

---

## 🎯 Recommended Starting Point

**For immediate testing:**

```bash
# 1. Create database
mysql -u root -p
CREATE DATABASE taist_local;
EXIT;

# 2. Run migrations
cd backend
php artisan migrate

# 3. Create & run quick seeder
php artisan make:seeder QuickStartSeeder
# (We'll create this with minimal data)
php artisan db:seed --class=QuickStartSeeder

# 4. Verify
php artisan tinker
>>> DB::table('tbl_users')->where('user_type', 2)->count();
>>> DB::table('tbl_menus')->count();
```

**Expected output:**
- 5 chefs
- 25 menu items
- 5 customers
- 15 ZIP codes
- Ready to test signup and browsing!

---

**Ready to proceed?** Let me know which approach you prefer and I'll start implementing the seeders! 🚀

