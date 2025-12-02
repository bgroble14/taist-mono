# Full-Stack Tasks - Detailed Implementation Plan

This document contains detailed implementation plans for all tasks requiring both frontend and backend work from Sprint 1.

---

## TMA-001: Twilio Text Notifications
**Status:** In Progress  
**Complexity:** 🟡 Moderate

### Overview
Implement SMS text notifications using Twilio to notify users about important order events alongside existing push notifications.

### Backend Changes

#### 1. Install Twilio SDK
```bash
cd backend
composer require twilio/sdk
```

#### 2. Environment Configuration
**File:** `backend/.env`
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_ENABLED=true
```

#### 3. Create Twilio Service
**Create:** `backend/app/Services/TwilioService.php`

```php
<?php

namespace App\Services;

use Twilio\Rest\Client;
use Log;

class TwilioService
{
    private $client;
    private $fromNumber;
    private $enabled;
    
    public function __construct()
    {
        $this->enabled = env('TWILIO_ENABLED', false);
        
        if ($this->enabled) {
            $sid = env('TWILIO_ACCOUNT_SID');
            $token = env('TWILIO_AUTH_TOKEN');
            $this->fromNumber = env('TWILIO_PHONE_NUMBER');
            
            $this->client = new Client($sid, $token);
        }
    }
    
    public function sendSMS($to, $message)
    {
        if (!$this->enabled) {
            Log::info("Twilio disabled, would have sent: {$message} to {$to}");
            return ['success' => true, 'message' => 'Twilio disabled'];
        }
        
        try {
            // Format phone number
            $to = $this->formatPhoneNumber($to);
            
            if (!$to) {
                return ['success' => false, 'error' => 'Invalid phone number'];
            }
            
            $message = $this->client->messages->create(
                $to,
                [
                    'from' => $this->fromNumber,
                    'body' => $message
                ]
            );
            
            Log::info("SMS sent successfully to {$to}: {$message->sid}");
            
            return [
                'success' => true,
                'sid' => $message->sid,
                'status' => $message->status
            ];
            
        } catch (\Exception $e) {
            Log::error("Failed to send SMS to {$to}: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    private function formatPhoneNumber($phone)
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Add +1 for US numbers if not present
        if (strlen($phone) === 10) {
            $phone = '+1' . $phone;
        } elseif (strlen($phone) === 11 && substr($phone, 0, 1) === '1') {
            $phone = '+' . $phone;
        } elseif (substr($phone, 0, 1) !== '+') {
            $phone = '+' . $phone;
        }
        
        // Validate phone number length (US format)
        if (strlen($phone) !== 12) {
            Log::warning("Invalid phone number format: {$phone}");
            return null;
        }
        
        return $phone;
    }
}
```

#### 4. Update Order Status Changes to Send SMS
**File:** `backend/app/Http/Controllers/MapiController.php`  
**Function:** `updateOrderStatus` (around line 1997)

Add SMS notifications alongside existing push notifications:

```php
use App\Services\TwilioService;

public function updateOrderStatus(Request $request, $id = "")
{
    // ... existing code ...
    
    $twilioService = new TwilioService();
    
    if ($request->status == 1) {
        // Order placed - notify chef
        $user = app(Listener::class)->where(['id' => $order->chef_user_id])->first();
        
        // Existing FCM notification...
        
        // Add SMS notification
        if ($user->phone) {
            $smsMessage = "New order received! Check your Taist app to accept.";
            $twilioService->sendSMS($user->phone, $smsMessage);
        }
        
    } else if ($request->status == 2) {
        // Order accepted - notify customer
        $user = app(Listener::class)->where(['id' => $order->customer_user_id])->first();
        
        // Existing FCM notification...
        
        // Add SMS notification
        if ($user->phone) {
            $smsMessage = "Your order has been accepted! The chef is preparing your meal.";
            $twilioService->sendSMS($user->phone, $smsMessage);
        }
        
    } else if ($request->status == 3) {
        // Order ready - notify customer
        $user = app(Listener::class)->where(['id' => $order->customer_user_id])->first();
        
        if ($user->phone) {
            $smsMessage = "Your order is ready for pickup!";
            $twilioService->sendSMS($user->phone, $smsMessage);
        }
        
    } else if ($request->status == 5) {
        // Order completed - notify customer
        $user = app(Listener::class)->where(['id' => $order->customer_user_id])->first();
        
        if ($user->phone) {
            $smsMessage = "Your order is complete! Please leave a review on Taist.";
            $twilioService->sendSMS($user->phone, $smsMessage);
        }
        
    } else if ($request->status == 6) {
        // Order cancelled - notify both
        $customer = app(Listener::class)->where(['id' => $order->customer_user_id])->first();
        $chef = app(Listener::class)->where(['id' => $order->chef_user_id])->first();
        
        if ($customer->phone) {
            $twilioService->sendSMS($customer->phone, "Your order has been cancelled.");
        }
        if ($chef->phone) {
            $twilioService->sendSMS($chef->phone, "Order #{$order->id} has been cancelled.");
        }
    }
    
    // ... rest of existing code ...
}
```

#### 5. Add SMS Logging Table (Optional)
Track SMS messages sent:

```php
// Migration
Schema::create('tbl_sms_logs', function (Blueprint $table) {
    $table->id();
    $table->string('to_phone');
    $table->text('message');
    $table->string('twilio_sid')->nullable();
    $table->string('status');
    $table->foreignId('user_id')->nullable()->constrained('tbl_users');
    $table->foreignId('order_id')->nullable()->constrained('tbl_orders');
    $table->timestamps();
});
```

### Frontend Changes

#### 1. Add SMS Preference Toggle
**File:** `frontend/app/screens/common/account/index.tsx`

Add user preference for SMS notifications:

```typescript
const [smsEnabled, setSmsEnabled] = useState(userInfo.sms_notifications_enabled ?? true);

// In the render section, add toggle:
<View style={styles.settingRow}>
  <Text style={styles.settingLabel}>SMS Notifications</Text>
  <Switch
    value={smsEnabled}
    onValueChange={(value) => {
      setSmsEnabled(value);
      setUserInfo({...userInfo, sms_notifications_enabled: value});
    }}
  />
</View>
```

#### 2. Update User Type
**File:** `frontend/app/types/index.ts`

```typescript
export interface IUser {
  // ... existing fields ...
  sms_notifications_enabled?: boolean;
}
```

### Testing
- Test SMS delivery in Twilio sandbox mode
- Verify all order status transitions send SMS
- Test phone number formatting for various formats
- Ensure SMS only sent when user has valid phone
- Test SMS preference toggle

### Cost Considerations
- Twilio charges per SMS (~$0.0075 per message)
- Consider rate limiting
- Only send SMS for critical events
- Allow users to opt out

---

## TMA-006: Simplify Chef Stripe Signup Without Moving to App
**Status:** Not Started  
**Complexity:** 🟡 Moderate

### Overview
Currently, chefs receive an email with a Stripe Connect link and must complete onboarding in a browser. Simplify this process while keeping it web-based but making it feel more integrated.

### Current Issues
**File:** `backend/app/Http/Controllers/MapiController.php` (lines 2478-2558)
- Email sent with external Stripe link
- Long instructions in email
- No in-app status tracking
- Confusing for users

### Backend Changes

#### 1. Create Stripe Onboarding Status Endpoint
**Add to MapiController.php:**

```php
public function getStripeOnboardingStatus(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);
    
    $user = $this->_authUser();
    
    // Get user's stripe account
    $paymentMethod = app(PaymentMethodListener::class)
        ->where(['user_id' => $user->id])
        ->first();
    
    if (!$paymentMethod || !$paymentMethod->stripe_account_id) {
        return response()->json([
            'success' => 1,
            'data' => [
                'status' => 'not_started',
                'account_id' => null,
                'onboarding_complete' => false
            ]
        ]);
    }
    
    try {
        include $_SERVER['DOCUMENT_ROOT'] . '/include/config.php';
        require_once('../stripe-php/init.php');
        $stripe = new \Stripe\StripeClient($stripe_key);
        
        $account = $stripe->accounts->retrieve($paymentMethod->stripe_account_id);
        
        $isComplete = $account->details_submitted && 
                      $account->charges_enabled && 
                      $account->payouts_enabled;
        
        return response()->json([
            'success' => 1,
            'data' => [
                'status' => $isComplete ? 'complete' : 'incomplete',
                'account_id' => $account->id,
                'onboarding_complete' => $isComplete,
                'charges_enabled' => $account->charges_enabled,
                'payouts_enabled' => $account->payouts_enabled,
                'requirements' => $account->requirements
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json(['success' => 0, 'error' => $e->getMessage()]);
    }
}

public function createStripeOnboardingLink(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);
    
    $user = $this->_authUser();
    
    try {
        include $_SERVER['DOCUMENT_ROOT'] . '/include/config.php';
        require_once('../stripe-php/init.php');
        $stripe = new \Stripe\StripeClient($stripe_key);
        
        // Get or create Stripe account
        $paymentMethod = app(PaymentMethodListener::class)
            ->where(['user_id' => $user->id])
            ->first();
        
        $accountId = null;
        
        if ($paymentMethod && $paymentMethod->stripe_account_id) {
            $accountId = $paymentMethod->stripe_account_id;
        } else {
            // Create new account
            $account = $stripe->accounts->create([
                'email' => $user->email,
                'country' => 'US',
                'business_type' => 'individual',
                'controller' => [
                    'fees' => ['payer' => 'application'],
                    'losses' => ['payments' => 'application'],
                    'stripe_dashboard' => ['type' => 'express'],
                ],
                'capabilities' => [
                    'card_payments' => ['requested' => true],
                    'transfers' => ['requested' => true],
                ],
            ]);
            
            $accountId = $account->id;
            
            // Save to database
            if ($paymentMethod) {
                $paymentMethod->update(['stripe_account_id' => $accountId]);
            } else {
                app(PaymentMethodListener::class)->create([
                    'user_id' => $user->id,
                    'stripe_account_id' => $accountId,
                    'active' => 1,
                ]);
            }
        }
        
        // Create account link with mobile-friendly URLs
        $returnUrl = $request->return_url ?? 'taist://stripe-return';
        $refreshUrl = $request->refresh_url ?? 'taist://stripe-refresh';
        
        $account_link = $stripe->accountLinks->create([
            'account' => $accountId,
            'refresh_url' => $refreshUrl,
            'return_url' => $returnUrl,
            'type' => 'account_onboarding',
        ]);
        
        return response()->json([
            'success' => 1,
            'data' => [
                'url' => $account_link->url,
                'account_id' => $accountId
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json(['success' => 0, 'error' => $e->getMessage()]);
    }
}
```

#### 2. Add Routes
**File:** `backend/routes/mapi.php`

```php
Route::get('/stripe/onboarding-status', [MapiController::class, 'getStripeOnboardingStatus']);
Route::post('/stripe/create-onboarding-link', [MapiController::class, 'createStripeOnboardingLink']);
```

### Frontend Changes

#### 1. Create Stripe Onboarding Screen
**Create:** `frontend/app/screens/chef/stripeOnboarding/index.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useAppSelector } from '@/app/hooks/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { styles } from './styles';

const StripeOnboarding = () => {
  const user = useAppSelector(x => x.user.user);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [openingLink, setOpeningLink] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    setLoading(true);
    try {
      // Call your API
      const response = await fetch(`${API_URL}/stripe/onboarding-status`, {
        headers: {
          'Authorization': `Bearer ${user.api_token}`,
          'apiKey': API_KEY,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    setOpeningLink(true);
    try {
      const response = await fetch(`${API_URL}/stripe/create-onboarding-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.api_token}`,
          'apiKey': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          return_url: 'taist://stripe-complete',
          refresh_url: 'taist://stripe-refresh',
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data.url) {
        // Open in external browser
        await Linking.openURL(data.data.url);
      }
    } catch (error) {
      console.error('Error creating link:', error);
    } finally {
      setOpeningLink(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Setup</Text>
      
      {status?.onboarding_complete ? (
        <View style={styles.successContainer}>
          <FontAwesomeIcon icon={faCheckCircle} size={60} color="#4CAF50" />
          <Text style={styles.successText}>
            Your payment account is all set up!
          </Text>
          <Text style={styles.subText}>
            You can now receive payments from customers.
          </Text>
        </View>
      ) : (
        <View style={styles.setupContainer}>
          <FontAwesomeIcon icon={faExclamationCircle} size={60} color="#FF9800" />
          <Text style={styles.setupText}>
            Complete your payment setup to start earning
          </Text>
          <Text style={styles.instructions}>
            You'll be taken to Stripe to securely set up your payment information.
            This usually takes 5-10 minutes.
          </Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={startOnboarding}
            disabled={openingLink}
          >
            {openingLink ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>
                {status?.status === 'not_started' ? 'Start Setup' : 'Continue Setup'}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={checkOnboardingStatus}
          >
            <Text style={styles.refreshText}>Refresh Status</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default StripeOnboarding;
```

#### 2. Create Styles
**Create:** `frontend/app/screens/chef/stripeOnboarding/styles.ts`

```typescript
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
  },
  successContainer: {
    alignItems: 'center',
  },
  successText: {
    fontSize: 20,
    color: '#ffffff',
    marginTop: 20,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#cccccc',
    marginTop: 10,
    textAlign: 'center',
  },
  setupContainer: {
    alignItems: 'center',
    width: '100%',
  },
  setupText: {
    fontSize: 20,
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    marginTop: 20,
  },
  refreshText: {
    color: '#FF6B35',
    fontSize: 14,
  },
});
```

#### 3. Update Chef Home/Profile to Show Status
**File:** `frontend/app/screens/chef/home/index.tsx`

Add a banner if Stripe onboarding is incomplete:

```typescript
const [stripeComplete, setStripeComplete] = useState(true);

useEffect(() => {
  checkStripeStatus();
}, []);

const checkStripeStatus = async () => {
  // Call API to check status
  // If incomplete, show banner
};

// In render:
{!stripeComplete && (
  <TouchableOpacity
    style={styles.stripeBanner}
    onPress={() => navigate.toChef.stripeOnboarding()}
  >
    <Text style={styles.stripeBannerText}>
      ⚠️ Complete your payment setup to receive orders
    </Text>
  </TouchableOpacity>
)}
```

### Implementation Steps
1. Add backend endpoints for status checking
2. Create frontend onboarding screen
3. Test Stripe Connect flow
4. Add status checks to chef dashboard
5. Update email template to be simpler

---

## TMA-008: Overall Entire Chef Signup Flow
**Status:** Not Started  
**Complexity:** 🔴 Complex

### Overview
Redesign the chef signup process to be multi-step instead of one long form, with better UX including:
- Auto-populated fields from existing data
- Address autocomplete
- Step-by-step wizard
- Progress indicators
- Save draft functionality

### Current Issues
**File:** `frontend/app/screens/common/account/index.tsx` (lines 65-556)
- One massive form with all fields
- No progress indication
- Fields not pre-populated
- No address autocomplete
- Can't save and continue later

### Backend Changes

#### 1. Add Draft Profile Table
**Migration:**

```php
Schema::create('tbl_chef_signup_drafts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('tbl_users');
    $table->integer('current_step')->default(1);
    $table->json('form_data');
    $table->timestamps();
    
    $table->unique('user_id');
});
```

#### 2. Add Draft Save/Load Endpoints
**Add to MapiController.php:**

```php
public function saveChefSignupDraft(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);
    
    $user = $this->_authUser();
    
    $draft = app(ChefSignupDrafts::class)->updateOrCreate(
        ['user_id' => $user->id],
        [
            'current_step' => $request->current_step,
            'form_data' => json_encode($request->form_data),
            'updated_at' => now(),
        ]
    );
    
    return response()->json(['success' => 1, 'data' => $draft]);
}

public function getChefSignupDraft(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);
    
    $user = $this->_authUser();
    
    $draft = app(ChefSignupDrafts::class)
        ->where('user_id', $user->id)
        ->first();
    
    if ($draft) {
        return response()->json([
            'success' => 1,
            'data' => [
                'current_step' => $draft->current_step,
                'form_data' => json_decode($draft->form_data, true),
            ]
        ]);
    }
    
    return response()->json(['success' => 1, 'data' => null]);
}
```

### Frontend Changes

#### 1. Create Multi-Step Wizard Component
**Create:** `frontend/app/screens/chef/signup/ChefSignupWizard.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { AddressStep } from './steps/AddressStep';
import { BioStep } from './steps/BioStep';
import { AvailabilityStep } from './steps/AvailabilityStep';
import { ReviewStep } from './steps/ReviewStep';
import { ProgressBar } from '@/app/components/ProgressBar';
import { styles } from './styles';

const TOTAL_STEPS = 5;

const ChefSignupWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    photo: '',
    
    // Step 2: Address
    address: '',
    city: '',
    state: '',
    zip: '',
    latitude: null,
    longitude: null,
    
    // Step 3: Bio
    bio: '',
    cuisine_types: [],
    
    // Step 4: Availability
    availability: {},
    minimum_order_amount: '',
    max_order_distance: '',
    
    // Step 5: Review (no new fields)
  });

  useEffect(() => {
    loadDraft();
    prefillFromUser();
  }, []);

  const loadDraft = async () => {
    // Load saved draft from API
    // const draft = await API.getChefSignupDraft();
    // if (draft) { setFormData(draft.form_data); setCurrentStep(draft.current_step); }
  };

  const prefillFromUser = async () => {
    // Prefill from existing user data
    // const user = await API.getCurrentUser();
    // setFormData(prev => ({ ...prev, ...user }));
  };

  const saveDraft = async () => {
    // Save current progress
    // await API.saveChefSignupDraft({ current_step: currentStep, form_data: formData });
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      saveDraft();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const submitSignup = async () => {
    // Final submission
    // await API.registerChef(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <AddressStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <BioStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <AvailabilityStep
            data={formData}
            onUpdate={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <ReviewStep
            data={formData}
            onSubmit={submitSignup}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chef Registration</Text>
        <ProgressBar current={currentStep} total={TOTAL_STEPS} />
      </View>
      
      <View style={styles.stepContainer}>
        {renderStep()}
      </View>
    </ScrollView>
  );
};

export default ChefSignupWizard;
```

#### 2. Create Individual Step Components

**Create:** `frontend/app/screens/chef/signup/steps/AddressStep.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { styles } from '../styles';

interface Props {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AddressStep: React.FC<Props> = ({ data, onUpdate, onNext, onBack }) => {
  const [address, setAddress] = useState(data.address || '');
  const [city, setCity] = useState(data.city || '');
  const [state, setState] = useState(data.state || '');
  const [zip, setZip] = useState(data.zip || '');

  const handleAddressSelect = (details: any) => {
    // Parse Google Places result
    const addressComponents = details.address_components;
    
    let street = '';
    let cityName = '';
    let stateName = '';
    let zipCode = '';
    
    addressComponents.forEach((component: any) => {
      if (component.types.includes('street_number')) {
        street = component.long_name + ' ';
      }
      if (component.types.includes('route')) {
        street += component.long_name;
      }
      if (component.types.includes('locality')) {
        cityName = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        stateName = component.short_name;
      }
      if (component.types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });
    
    setAddress(street);
    setCity(cityName);
    setState(stateName);
    setZip(zipCode);
    
    const coords = details.geometry.location;
    
    onUpdate({
      address: street,
      city: cityName,
      state: stateName,
      zip: zipCode,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  const handleNext = () => {
    if (!address || !city || !state || !zip) {
      alert('Please fill in all address fields');
      return;
    }
    onNext();
  };

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Where do you cook?</Text>
      <Text style={styles.stepDescription}>
        This helps us show you to nearby customers
      </Text>
      
      <GooglePlacesAutocomplete
        placeholder="Start typing your address..."
        onPress={(data, details = null) => {
          if (details) handleAddressSelect(details);
        }}
        query={{
          key: 'YOUR_GOOGLE_PLACES_API_KEY',
          language: 'en',
          components: 'country:us',
        }}
        fetchDetails={true}
        styles={{
          textInput: styles.input,
          description: styles.autocompleteItem,
        }}
      />
      
      <Text style={styles.label}>Street Address</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={(text) => {
          setAddress(text);
          onUpdate({ ...data, address: text });
        }}
        placeholder="123 Main St"
      />
      
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={(text) => {
              setCity(text);
              onUpdate({ ...data, city: text });
            }}
          />
        </View>
        
        <View style={styles.quarterWidth}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            value={state}
            onChangeText={(text) => {
              setState(text);
              onUpdate({ ...data, state: text });
            }}
            maxLength={2}
          />
        </View>
        
        <View style={styles.quarterWidth}>
          <Text style={styles.label}>ZIP</Text>
          <TextInput
            style={styles.input}
            value={zip}
            onChangeText={(text) => {
              setZip(text);
              onUpdate({ ...data, zip: text });
            }}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

#### 3. Add Google Places API
**Install dependency:**
```bash
npm install react-native-google-places-autocomplete
```

**Add API key to environment:**
```typescript
// app.config.js
export default {
  // ...
  extra: {
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
  },
};
```

### Implementation Priority
1. Create backend draft system
2. Build wizard wrapper component
3. Create individual step components
4. Add Google Places autocomplete
5. Implement save/load draft functionality
6. Add prefill logic from user data
7. Style and polish UI
8. Test entire flow

---

## TMA-009: AI for Menu Page
**Status:** In Progress  
**Complexity:** 🔴 Complex

### Overview
Add AI assistance to help chefs create menu items with better descriptions, pricing suggestions, and category recommendations.

### Backend Changes

#### 1. Create AI Menu Service
**Create:** `backend/app/Services/AIMenuService.php`

```php
<?php

namespace App\Services;

use GuzzleHttp\Client;
use Log;

class AIMenuService
{
    private $apiKey;
    private $client;
    
    public function __construct()
    {
        $this->apiKey = env('OPENAI_API_KEY');
        $this->client = new Client();
    }
    
    public function enhanceMenuDescription($title, $basicDescription)
    {
        $prompt = "As a food marketing expert, enhance this menu item description to be more appealing to customers:\n\n" .
                  "Dish: {$title}\n" .
                  "Current description: {$basicDescription}\n\n" .
                  "Write a concise, appetizing description (max 100 words) that highlights flavors, textures, and what makes this dish special. " .
                  "Use sensory language and make it sound delicious.";
        
        return $this->callOpenAI($prompt, 150);
    }
    
    public function suggestPricing($title, $description, $estimatedTime)
    {
        $prompt = "Based on this homemade dish, suggest a fair price range:\n\n" .
                  "Dish: {$title}\n" .
                  "Description: {$description}\n" .
                  "Estimated cooking time: {$estimatedTime} minutes\n\n" .
                  "Respond with just a price range in this format: $X-$Y";
        
        $response = $this->callOpenAI($prompt, 50);
        
        // Parse the response to extract numeric values
        preg_match('/\$(\d+)-\$(\d+)/', $response, $matches);
        
        if (count($matches) === 3) {
            return [
                'min' => (float)$matches[1],
                'max' => (float)$matches[2],
                'suggested' => ((float)$matches[1] + (float)$matches[2]) / 2
            ];
        }
        
        return null;
    }
    
    public function suggestCategories($title, $description)
    {
        // Get available categories from database
        $categories = app(\App\Models\Categories::class)->pluck('name')->toArray();
        $categoriesList = implode(', ', $categories);
        
        $prompt = "Given these available categories: [{$categoriesList}]\n\n" .
                  "Which categories best fit this dish?\n\n" .
                  "Dish: {$title}\n" .
                  "Description: {$description}\n\n" .
                  "Respond with 1-3 category names from the list above, comma-separated.";
        
        $response = $this->callOpenAI($prompt, 50);
        
        // Parse response and match to actual category IDs
        $suggestedNames = array_map('trim', explode(',', $response));
        
        $categoryIds = app(\App\Models\Categories::class)
            ->whereIn('name', $suggestedNames)
            ->pluck('id')
            ->toArray();
        
        return $categoryIds;
    }
    
    public function generateMenuItemFromPhoto($imageBase64)
    {
        // Use GPT-4 Vision to analyze food photo
        try {
            $response = $this->client->post('https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => 'gpt-4-vision-preview',
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'text',
                                    'text' => 'Analyze this food photo and suggest: 1) A catchy dish name, 2) A brief description, 3) Main ingredients. Format as JSON.'
                                ],
                                [
                                    'type' => 'image_url',
                                    'image_url' => [
                                        'url' => "data:image/jpeg;base64,{$imageBase64}"
                                    ]
                                ]
                            ]
                        ]
                    ],
                    'max_tokens' => 300,
                ]
            ]);
            
            $data = json_decode($response->getBody(), true);
            $content = $data['choices'][0]['message']['content'] ?? null;
            
            if ($content) {
                // Try to parse as JSON
                $parsed = json_decode($content, true);
                if ($parsed) {
                    return $parsed;
                }
                return ['raw' => $content];
            }
            
        } catch (\Exception $e) {
            Log::error('AI photo analysis failed: ' . $e->getMessage());
        }
        
        return null;
    }
    
    private function callOpenAI($prompt, $maxTokens = 200)
    {
        try {
            $response = $this->client->post('https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => 'gpt-4',
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a food marketing and pricing expert.'],
                        ['role' => 'user', 'content' => $prompt]
                    ],
                    'temperature' => 0.7,
                    'max_tokens' => $maxTokens,
                ]
            ]);
            
            $data = json_decode($response->getBody(), true);
            return trim($data['choices'][0]['message']['content'] ?? '');
            
        } catch (\Exception $e) {
            Log::error('OpenAI API call failed: ' . $e->getMessage());
            return null;
        }
    }
}
```

#### 2. Add AI Enhancement Endpoints
**Add to MapiController.php:**

```php
use App\Services\AIMenuService;

public function enhanceMenuDescription(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);
    
    $aiService = new AIMenuService();
    
    $enhanced = $aiService->enhanceMenuDescription(
        $request->title,
        $request->description
    );
    
    if ($enhanced) {
        return response()->json(['success' => 1, 'data' => ['description' => $enhanced]]);
    }
    
    return response()->json(['success' => 0, 'error' => 'Could not enhance description']);
}

public function suggestMenuPricing(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);
    
    $aiService = new AIMenuService();
    
    $pricing = $aiService->suggestPricing(
        $request->title,
        $request->description,
        $request->estimated_time
    );
    
    if ($pricing) {
        return response()->json(['success' => 1, 'data' => $pricing]);
    }
    
    return response()->json(['success' => 0, 'error' => 'Could not suggest pricing']);
}

public function suggestMenuCategories(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);
    
    $aiService = new AIMenuService();
    
    $categories = $aiService->suggestCategories(
        $request->title,
        $request->description
    );
    
    return response()->json(['success' => 1, 'data' => ['category_ids' => $categories]]);
}

public function analyzeMenuPhoto(Request $request)
{
    if ($this->_checktaistApiKey($request->header('apiKey')) === false)
        return response()->json(['success' => 0, 'error' => "Access denied."]);
    
    if (!$request->hasFile('photo')) {
        return response()->json(['success' => 0, 'error' => 'No photo provided']);
    }
    
    $photo = $request->file('photo');
    $imageData = base64_encode(file_get_contents($photo->getRealPath()));
    
    $aiService = new AIMenuService();
    $analysis = $aiService->generateMenuItemFromPhoto($imageData);
    
    if ($analysis) {
        return response()->json(['success' => 1, 'data' => $analysis]);
    }
    
    return response()->json(['success' => 0, 'error' => 'Could not analyze photo']);
}
```

### Frontend Changes

#### 1. Update Add Menu Item Screen
**File:** `frontend/app/screens/chef/addMenuItem/index.tsx`

Add AI enhancement buttons:

```typescript
import { useState } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMagic, faLightbulb } from '@fortawesome/free-solid-svg-icons';

const AddMenuItem = () => {
  // ... existing state ...
  
  const [enhancingDescription, setEnhancingDescription] = useState(false);
  const [suggestingPrice, setSuggestingPrice] = useState(false);

  const enhanceDescription = async () => {
    if (!title || !description) {
      alert('Please enter a title and basic description first');
      return;
    }
    
    setEnhancingDescription(true);
    try {
      const response = await fetch(`${API_URL}/enhance-menu-description`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.api_token}`,
          'apiKey': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDescription(data.data.description);
        alert('Description enhanced! Review and edit as needed.');
      }
    } catch (error) {
      console.error('Error enhancing description:', error);
    } finally {
      setEnhancingDescription(false);
    }
  };

  const suggestPrice = async () => {
    if (!title || !description || !estimatedTime) {
      alert('Please fill in title, description, and estimated time first');
      return;
    }
    
    setSuggestingPrice(true);
    try {
      const response = await fetch(`${API_URL}/suggest-menu-pricing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.api_token}`,
          'apiKey': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, estimated_time: estimatedTime }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const { min, max, suggested } = data.data;
        alert(`Suggested price range: $${min}-$${max}\nRecommended: $${suggested}`);
        setPrice(suggested.toString());
      }
    } catch (error) {
      console.error('Error suggesting price:', error);
    } finally {
      setSuggestingPrice(false);
    }
  };

  return (
    <ScrollView>
      {/* ... existing title field ... */}
      
      {/* Description field with AI button */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholder="Describe your dish..."
        />
        <TouchableOpacity
          style={styles.aiButton}
          onPress={enhanceDescription}
          disabled={enhancingDescription}
        >
          {enhancingDescription ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <FontAwesomeIcon icon={faMagic} size={16} color="#fff" />
              <Text style={styles.aiButtonText}>Enhance with AI</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Price field with AI button */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Price</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        <TouchableOpacity
          style={styles.aiButton}
          onPress={suggestPrice}
          disabled={suggestingPrice}
        >
          {suggestingPrice ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <FontAwesomeIcon icon={faLightbulb} size={16} color="#fff" />
              <Text style={styles.aiButtonText}>Suggest Price</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* ... rest of form ... */}
    </ScrollView>
  );
};
```

### Cost Considerations
- OpenAI GPT-4 API costs ~$0.03 per 1K tokens
- GPT-4 Vision costs ~$0.01-$0.03 per image
- Consider rate limiting per user
- Show token usage in admin panel
- Maybe limit free AI uses per month

---

## TMA-022: Profile (Bio and Hours) Not Visible from Admin Panel
**Status:** Not Clear - Appears Already Visible  
**Complexity:** 🟢 Simple (if actually broken)

### Current State Investigation

Looking at the code, the admin panel DOES show bio and hours:

**File:** `backend/resources/views/admin/profiles.blade.php` (lines 1-62)
- Shows bio in column (line 41)
- Shows all availability hours (lines 42-48)
- Has edit functionality (line 53)

**File:** `backend/app/Http/Controllers/Admin/AdminController.php` (lines 176-184)
- Properly joins `tbl_availabilities` table
- Selects bio and all day hours

### Possible Issues

1. **Data might not be loaded properly** - Join might be failing
2. **UI might have display issues** - CSS hiding content
3. **User reported issue might be outdated** - Already fixed

### If Actually Broken - Fix

#### Backend: Verify Join
```php
// In AdminController.php profiles() method
$data['profiles'] = DB::table('tbl_users as u')
    ->leftJoin('tbl_availabilities as a', 'a.user_id', '=', 'u.id')
    ->where(['user_type' => 2, 'is_pending' => 0, 'verified' => 1])
    ->select([
        'u.*',
        'a.id as availability_id', // Add this to confirm join worked
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
```

#### Frontend: Ensure Bio/Hours Display
Check if the table is scrollable horizontally to see all columns.

---

## TMA-023: Remove Serving Size and Replace with MOQ (Minimum Order Quantity)
**Status:** Not Clear  
**Complexity:** 🟡 Moderate

### Overview
Replace "Serving Size" field with "Minimum Order Quantity" (MOQ) throughout the application.

### Database Changes

#### 1. Migration to Rename Column
**Create migration:**

```php
Schema::table('tbl_menus', function (Blueprint $table) {
    // If renaming existing column
    $table->renameColumn('serving_size', 'minimum_order_quantity');
    
    // Or if adding new and keeping old temporarily
    // $table->integer('minimum_order_quantity')->default(1)->after('serving_size');
});
```

### Backend Changes

#### 1. Update Menu Creation/Update
**File:** `backend/app/Http/Controllers/MapiController.php`

```php
// Update createMenu function (line 1032)
$ary = [
    // ... other fields ...
    'minimum_order_quantity' => $request->minimum_order_quantity ?? 1, // Changed from serving_size
    // ... other fields ...
];

// Update updateMenu function (line 1082)
if ($request->minimum_order_quantity) $ary['minimum_order_quantity'] = $request->minimum_order_quantity;
```

#### 2. Update API Response
Ensure responses use new field name or include both for backwards compatibility:

```php
// Add accessor to model if keeping backwards compatibility
// File: backend/app/Models/Menus.php
public function getServingSizeAttribute()
{
    return $this->attributes['minimum_order_quantity'];
}
```

### Frontend Changes

#### 1. Update Menu Item Creation Form
**File:** `frontend/app/screens/chef/addMenuItem/index.tsx`

```typescript
// Change state variable
const [minimumOrderQuantity, setMinimumOrderQuantity] = useState('1');

// Update form field
<View style={styles.fieldContainer}>
  <Text style={styles.label}>Minimum Order Quantity</Text>
  <Text style={styles.helperText}>
    Minimum number of servings customers must order
  </Text>
  <TextInput
    style={styles.input}
    value={minimumOrderQuantity}
    onChangeText={setMinimumOrderQuantity}
    keyboardType="numeric"
    placeholder="1"
  />
</View>

// Update API call
const menuData = {
  // ...
  minimum_order_quantity: minimumOrderQuantity,
  // ...
};
```

#### 2. Update Menu Display
**Files to update:**
- `frontend/app/screens/customer/chef/index.tsx` - Chef menu display
- `frontend/app/screens/customer/addToOrder/index.tsx` - Add to order screen
- `frontend/app/screens/chef/menuItem/index.tsx` - Chef's own menu view

```typescript
// Example in menu display
<View style={styles.menuInfo}>
  <Text style={styles.infoLabel}>Min. Order:</Text>
  <Text style={styles.infoValue}>{menuItem.minimum_order_quantity} servings</Text>
</View>
```

#### 3. Update Order Validation
Ensure orders meet minimum quantity:

```typescript
// In add to order screen
const validateOrder = () => {
  if (quantity < menuItem.minimum_order_quantity) {
    alert(`Minimum order quantity is ${menuItem.minimum_order_quantity}`);
    return false;
  }
  return true;
};
```

### Implementation Steps
1. Backup database
2. Run migration to rename column
3. Update backend API endpoints
4. Update frontend components
5. Test menu creation/editing
6. Test order placement with MOQ validation
7. Update admin panel if needed

---

## TMA-024: Automatic App Updates for Users
**Status:** Not Clear  
**Complexity:** 🟡 Moderate

### Overview
Implement automatic app update notifications and facilitate seamless updates for users.

### Approaches

#### Option 1: Over-The-Air (OTA) Updates with Expo
**Pros:** Instant updates without app store approval  
**Cons:** Only works for JS/assets, not native code changes

**Implementation:**

1. **Setup EAS Update**
```bash
npm install expo-updates
```

2. **Configure** (`app.config.js`):
```javascript
export default {
  // ...
  updates: {
    url: "https://u.expo.dev/your-project-id",
    fallbackToCacheTimeout: 0,
  },
  runtimeVersion: {
    policy: "sdkVersion"
  },
};
```

3. **Add Update Check to App**
**File:** `frontend/App.tsx` or `frontend/app/_layout.tsx`

```typescript
import * as Updates from 'expo-updates';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        
        // Show dialog to user
        Alert.alert(
          'Update Available',
          'A new version is available. Restart to update?',
          [
            {
              text: 'Later',
              style: 'cancel',
            },
            {
              text: 'Update Now',
              onPress: () => Updates.reloadAsync(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  // ... rest of app
}
```

4. **Publish Updates**
```bash
eas update --branch production --message "Bug fixes and improvements"
```

#### Option 2: Force Update via Backend
Check version against backend and force update if too old.

**Backend:**

1. **Add Version Endpoint**
```php
// MapiController.php
public function getAppVersion(Request $request)
{
    $latestVersion = app(Version::class)
        ->orderBy('created_at', 'desc')
        ->first();
    
    $currentVersion = $request->current_version;
    
    $updateRequired = version_compare($currentVersion, $latestVersion->minimum_version, '<');
    
    return response()->json([
        'success' => 1,
        'data' => [
            'latest_version' => $latestVersion->version,
            'minimum_version' => $latestVersion->minimum_version,
            'update_required' => $updateRequired,
            'update_url_ios' => $latestVersion->ios_url,
            'update_url_android' => $latestVersion->android_url,
            'release_notes' => $latestVersion->notes,
        ]
    ]);
}
```

2. **Update Version Model** (already exists)
**File:** `backend/app/Models/Version.php`

**Frontend:**

1. **Create Update Check Service**
**Create:** `frontend/app/services/updateService.ts`

```typescript
import { Platform, Linking, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

const APP_VERSION = Application.nativeApplicationVersion;

export const checkAppVersion = async () => {
  try {
    const response = await fetch(`${API_URL}/app-version`, {
      method: 'POST',
      headers: {
        'apiKey': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_version: APP_VERSION,
        platform: Platform.OS,
      }),
    });
    
    const data = await response.json();
    
    if (data.success && data.data.update_required) {
      showForceUpdateDialog(data.data);
    } else if (data.success && data.data.latest_version !== APP_VERSION) {
      showOptionalUpdateDialog(data.data);
    }
  } catch (error) {
    console.error('Error checking version:', error);
  }
};

const showForceUpdateDialog = (versionData: any) => {
  Alert.alert(
    'Update Required',
    `A new version of Taist is available. You must update to continue using the app.\n\nVersion ${versionData.latest_version}\n${versionData.release_notes}`,
    [
      {
        text: 'Update Now',
        onPress: () => {
          const url = Platform.OS === 'ios' 
            ? versionData.update_url_ios 
            : versionData.update_url_android;
          Linking.openURL(url);
        },
      },
    ],
    { cancelable: false }
  );
};

const showOptionalUpdateDialog = (versionData: any) => {
  Alert.alert(
    'Update Available',
    `Version ${versionData.latest_version} is now available.\n\n${versionData.release_notes}`,
    [
      {
        text: 'Later',
        style: 'cancel',
      },
      {
        text: 'Update',
        onPress: () => {
          const url = Platform.OS === 'ios' 
            ? versionData.update_url_ios 
            : versionData.update_url_android;
          Linking.openURL(url);
        },
      },
    ]
  );
};
```

2. **Call on App Launch**
**File:** `frontend/app/index.tsx` or main layout

```typescript
import { checkAppVersion } from './services/updateService';

useEffect(() => {
  checkAppVersion();
}, []);
```

### Recommended Approach
Use **both**:
- OTA updates for quick fixes (JS/assets)
- Version checking for major native updates

---

## Task Ranking: Easiest to Hardest

### 🟢 Level 1: Simple (< 2 hours)
1. **TMA-022** - Profile visibility in admin (IF actually broken)
   - Just a UI or query fix
   - Already seems to work

### 🟡 Level 2: Moderate (2-8 hours)
2. **TMA-023** - Replace Serving Size with MOQ
   - Database migration
   - Update API endpoints
   - Update frontend forms and displays
   - Clear scope, straightforward changes

3. **TMA-024** - Automatic app updates
   - Setup EAS Updates OR version checking
   - Add update dialog
   - Configuration and testing

4. **TMA-001** - Twilio SMS notifications
   - Install Twilio SDK
   - Create service class
   - Add SMS calls to existing notification points
   - Well-defined scope

5. **TMA-006** - Simplify Stripe signup
   - New endpoints for status/link creation
   - Create onboarding screen
   - Integrate with existing flow
   - Moderate backend + frontend work

### 🔴 Level 3: Complex (8+ hours)
6. **TMA-009** - AI for menu page
   - OpenAI integration
   - Multiple AI features
   - Complex prompt engineering
   - Frontend integration
   - Cost management

7. **TMA-008** - Chef signup flow overhaul
   - Complete redesign of signup
   - Multi-step wizard
   - Draft saving system
   - Google Places integration
   - Multiple step components
   - Extensive testing needed

---

## Recommended Implementation Order

### Phase 1: Quick Wins (2-3 days)
1. ✅ TMA-022 - Admin profile visibility check (1 hour)
2. ✅ TMA-023 - MOQ replacement (4-6 hours)
3. ✅ TMA-001 - Twilio SMS (4-6 hours)

**Total: ~10-13 hours**

### Phase 2: Medium Features (1 week)
4. TMA-024 - Auto updates (4-6 hours)
5. TMA-006 - Simplified Stripe signup (6-8 hours)

**Total: ~10-14 hours**

### Phase 3: Major Projects (2-3 weeks)
6. TMA-009 - AI menu assistance (12-16 hours)
7. TMA-008 - Chef signup redesign (16-24 hours)

**Total: ~28-40 hours**

---

## Overall Notes

- **Total Full-Stack Tasks: 7** (2 in progress, 5 not started)
- **Estimated Total Time: ~48-67 hours** (about 1.5-2 weeks of focused work)
- Most tasks require coordination between frontend and backend
- Testing is critical for all tasks
- Consider feature flags for gradual rollouts
- API versioning may be needed for breaking changes

---

*Last Updated: December 1, 2025*


