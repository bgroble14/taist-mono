# TMA: Chef Safety Quiz Tutorial Overhaul - Implementation Plan

## Executive Summary

This plan details the complete overhaul of the chef post-signup onboarding experience. The current multi-screen tutorial ([howToDo/index.tsx](../frontend/app/screens/chef/howToDo/index.tsx) and [onboarding/index.tsx](../frontend/app/screens/chef/onboarding/index.tsx)) will be replaced with an interactive, progressive food safety quiz that must be completed immediately after chef registration.

**Current Flow:**
1. Chef completes 7-step signup process
2. Registration API call sets `user_type: 2, is_pending: 1`
3. Chef redirected to [home/index.tsx](../frontend/app/screens/chef/home/index.tsx:97-99) which detects `is_pending === 1`
4. Auto-navigation to [howToDo/index.tsx](../frontend/app/screens/chef/howToDo/index.tsx:98) (6-page horizontal scroll tutorial)
5. After tutorial, chef sees onboarding checklist on home screen

**New Flow:**
1. Chef completes 7-step signup process
2. Registration API call sets `user_type: 2, is_pending: 1, quiz_completed: 0`
3. **NEW:** Chef sees beautiful Welcome screen with benefits + equipment checklist
4. **NEW:** Chef starts and completes interactive safety quiz (5 questions)
5. Quiz completion updates `quiz_completed: 1` via API
6. Chef proceeds to home screen with onboarding checklist

**What's Preserved from Old Tutorial:**
- ✅ Key benefits (24/7, pricing, custom menus) → Welcome screen
- ✅ Equipment requirements (pots, pans, cooler, cleaning supplies) → Welcome screen
- ✅ Food safety procedures → Interactive quiz (active learning)
- ✅ Background check + insurance info → Welcome screen
- ✅ Onboarding checklist (profile, menu, payment, etc.) → Existing home screen

---

## 1. Database Schema Changes

### 1.1 Add `quiz_completed` Field to `tbl_users`

**File:** [backend/database/migrations/](../backend/database/migrations/)

**Migration:** `2025_XX_XX_XXXXXX_add_quiz_completed_to_users.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddQuizCompletedToUsers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_users', function (Blueprint $table) {
            $table->tinyInteger('quiz_completed')
                  ->default(0)
                  ->comment('0:not completed,1:completed')
                  ->after('is_pending');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_users', function (Blueprint $table) {
            $table->dropColumn('quiz_completed');
        });
    }
}
```

**SQL Schema Update:**
```sql
ALTER TABLE tbl_users
ADD COLUMN quiz_completed TINYINT NOT NULL DEFAULT 0
COMMENT '0:not completed,1:completed'
AFTER is_pending;
```

**Update Schema Documentation:** [backend/database/taist-schema.sql](../backend/database/taist-schema.sql:475-505)

---

## 2. Backend API Changes

### 2.1 Update User Model

**File:** [backend/app/Listener.php](../backend/app/Listener.php:23)

**Change:** Add `quiz_completed` to `$fillable` array

```php
protected $fillable = [
    'first_name', 'last_name', 'email', 'password', 'phone', 'birthday',
    'address', 'city', 'state', 'zip', 'user_type', 'is_pending',
    'quiz_completed', // ADD THIS
    'verified', 'photo', 'api_token', 'code', 'token_date',
    'applicant_guid', 'order_guid', 'fcm_token', 'latitude', 'longitude'
];
```

### 2.2 Update Registration Controller

**File:** [backend/app/Http/Controllers/MapiController.php](../backend/app/Http/Controllers/MapiController.php:333)

**Change:** Modify `register()` method to set `quiz_completed: 0` for chefs

**Location:** Line 333-427 (register method)

```php
public function register(Request $request) {
    // ... existing validation code ...

    $user = new Listener;
    $user->first_name = $first_name;
    $user->last_name = $last_name;
    $user->email = $email;
    $user->password = $password;
    $user->phone = $phone;
    $user->birthday = $birthday;
    $user->address = $address;
    $user->city = $city;
    $user->state = $state;
    $user->zip = $zip;
    $user->photo = $photo;
    $user->user_type = $user_type;
    $user->latitude = $latitude;
    $user->longitude = $longitude;
    $user->fcm_token = $request->get('fcm_token') ?? '';

    // Set is_pending for chefs
    if ($user_type == 2) {
        $user->is_pending = 1;
        $user->quiz_completed = 0; // ADD THIS LINE
    }

    // ... rest of existing code ...
}
```

### 2.3 Create Quiz Completion Endpoint

**File:** [backend/app/Http/Controllers/MapiController.php](../backend/app/Http/Controllers/MapiController.php)

**New Method:** Add after existing methods (around line 450+)

```php
/**
 * Mark chef safety quiz as completed
 *
 * @param Request $request
 * @return JsonResponse
 */
public function completeChefQuiz(Request $request) {
    $user_id = $request->get('user_id');

    if (!$user_id) {
        return response()->json([
            'success' => 0,
            'message' => 'User ID is required'
        ]);
    }

    $user = Listener::find($user_id);

    if (!$user) {
        return response()->json([
            'success' => 0,
            'message' => 'User not found'
        ]);
    }

    // Verify user is a chef
    if ($user->user_type != 2) {
        return response()->json([
            'success' => 0,
            'message' => 'Only chefs can complete the safety quiz'
        ]);
    }

    // Update quiz completion status
    $user->quiz_completed = 1;
    $user->save();

    return response()->json([
        'success' => 1,
        'message' => 'Quiz completed successfully',
        'data' => $user
    ]);
}
```

### 2.4 Add Route

**File:** [backend/routes/mapi.php](../backend/routes/mapi.php)

**Add Route:** After existing routes (around line 30+)

```php
Route::post('/complete_chef_quiz', 'MapiController@completeChefQuiz');
```

---

## 3. Frontend Type Updates

### 3.1 Update User Interface

**File:** [frontend/app/types/user.interface.ts](../frontend/app/types/user.interface.ts:16)

**Change:** Add `quiz_completed` field

```typescript
export default interface UserInterface {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  birthday?: number;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  user_type?: number;
  is_pending?: number;
  quiz_completed?: number; // ADD THIS LINE
  verified?: number;
  photo?: string;
  social?: string;
  applicant_guid?: string;
  token_date?: string;
  created_at?: number;
  updated_at?: number;

  remember?: boolean;
  password?: string;
}
```

---

## 4. Frontend Welcome Screen Implementation

### 4.1 Create Chef Welcome Screen

**New File:** `frontend/app/screens/chef/chefWelcome/index.tsx`

This is a beautiful single-page welcome screen that:
- Shows hero image of chefs cooking
- Lists key benefits (24/7, pricing, custom menus)
- Shows essential equipment checklist
- Mentions background check + insurance coverage
- Has prominent "Start Safety Quiz" button

**Design:**
- Clean, modern, visually appealing
- Uses existing onboarding images (chef1.jpg, onboarding_end.png)
- Icon-based equipment checklist
- Gradient background for premium feel
- Large, readable text
- Professional photography

(Full component code in implementation section below)

---

## 5. Frontend Quiz Component Implementation

### 5.1 Create Quiz Data Structure

**New File:** `frontend/app/screens/chef/safetyQuiz/quizData.ts`

```typescript
export interface QuizAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  answers: QuizAnswer[];
  correctAnswerId: string;
  explanation: string;
}

export const CHEF_SAFETY_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    category: 'Food Storage & Transportation Safety',
    question: 'You bought ingredients the day before a Taist order. What\'s the correct way to store them?',
    answers: [
      {
        id: 'A',
        text: 'Leave them in your car overnight so they\'re ready to grab',
        isCorrect: false
      },
      {
        id: 'B',
        text: 'Refrigerate them until you leave for the order',
        isCorrect: true
      },
      {
        id: 'C',
        text: 'Store raw and cooked foods together to save space',
        isCorrect: false
      }
    ],
    correctAnswerId: 'B',
    explanation: 'Ingredients bought ahead of time must stay refrigerated until you head out to keep them safe.'
  },
  {
    id: 2,
    category: 'Handwashing, Personal Hygiene & Arrival Readiness',
    question: 'You arrive at the customer\'s kitchen. What\'s the correct first step before you start cooking?',
    answers: [
      {
        id: 'A',
        text: 'Wash your hands, then wipe down any surfaces or appliances you\'ll be using if they\'re dirty',
        isCorrect: true
      },
      {
        id: 'B',
        text: 'Start organizing your ingredients before washing your hands',
        isCorrect: false
      },
      {
        id: 'C',
        text: 'Give the kitchen a quick look, and only wipe surfaces if something seems seriously dirty',
        isCorrect: false
      }
    ],
    correctAnswerId: 'A',
    explanation: 'Chefs must wash their hands immediately on arrival, and any surface or appliance they\'ll use must be cleaned before cooking begins.'
  },
  {
    id: 3,
    category: 'Proper Food Temperature Control',
    question: 'You\'re cooking chicken for a customer. What\'s the minimum safe internal temperature?',
    answers: [
      {
        id: 'A',
        text: '140°F',
        isCorrect: false
      },
      {
        id: 'B',
        text: '150°F',
        isCorrect: false
      },
      {
        id: 'C',
        text: '165°F',
        isCorrect: true
      }
    ],
    correctAnswerId: 'C',
    explanation: 'Chicken must reach 165°F internally to kill harmful bacteria.'
  },
  {
    id: 4,
    category: 'Cross-Contamination Prevention',
    question: 'What\'s the safest way to handle your cutting boards during prep?',
    answers: [
      {
        id: 'A',
        text: 'Use the same board for everything as long as you wipe it',
        isCorrect: false
      },
      {
        id: 'B',
        text: 'Use separate boards for raw meat and ready-to-eat items',
        isCorrect: true
      },
      {
        id: 'C',
        text: 'Use paper towels as cutting surfaces',
        isCorrect: false
      }
    ],
    correctAnswerId: 'B',
    explanation: 'Using separate boards prevents raw proteins from contaminating ready-to-eat foods.'
  },
  {
    id: 5,
    category: 'Cleaning & Equipment Reset Before Leaving',
    question: 'After finishing the meal, what should you do with the pots and pans you brought from home?',
    answers: [
      {
        id: 'A',
        text: 'Ask the customer if they want to wash them',
        isCorrect: false
      },
      {
        id: 'B',
        text: 'Take them home dirty to wash later',
        isCorrect: false
      },
      {
        id: 'C',
        text: 'Wash them before you leave and put the kitchen back as you found it',
        isCorrect: true
      }
    ],
    correctAnswerId: 'C',
    explanation: 'Taist requires chefs to reset the kitchen, including cleaning any personal equipment used.'
  }
];
```

### 4.2 Create Quiz Screen Component

**New File:** `frontend/app/screens/chef/safetyQuiz/index.tsx`

**Component Structure:**
- Single-question-per-screen progressive flow
- Cannot advance until correct answer selected
- Visual feedback for correct/incorrect answers
- Progress indicator (Question X of 5)
- Explanation shown after correct answer before proceeding
- Final completion screen
- API call to mark quiz as complete

**Key Features:**
1. **Question Display**
   - Large, readable question text
   - Category badge at top
   - Progress indicator
   - Three answer buttons with A/B/C labels

2. **Answer Interaction**
   - Tap to select answer
   - Immediate feedback (green for correct, red for incorrect)
   - If incorrect: Show error message, allow retry
   - If correct: Show explanation, show "Next" button

3. **Navigation**
   - Cannot skip questions
   - Cannot go back to previous questions
   - "Next" only appears after correct answer
   - Final question shows "Complete Quiz" button

4. **Styling**
   - Clean, modern design matching existing app theme
   - Use [AppColors](../frontend/constants/theme.ts) for consistency
   - Similar layout to [SignupStepContainer](../frontend/app/screens/common/signup/components/SignupStepContainer.tsx)
   - Animations for answer feedback

```typescript
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { navigate } from '../../../utils/navigation';
import Container from '../../../layout/Container';
import { AppColors } from '../../../../constants/theme';
import { CHEF_SAFETY_QUIZ, QuizAnswer } from './quizData';
import { CompleteChefQuizAPI } from '../../../services/api';
import { setUser } from '../../../reducers/userSlice';
import { showLoading, hideLoading } from '../../../reducers/loadingSlice';
import { ShowErrorToast, ShowSuccessToast } from '../../../utils/toast';

const SafetyQuiz = () => {
  const dispatch = useAppDispatch();
  const self = useAppSelector(x => x.user.user);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const currentQuestion = CHEF_SAFETY_QUIZ[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === CHEF_SAFETY_QUIZ.length - 1;
  const progress = ((currentQuestionIndex + 1) / CHEF_SAFETY_QUIZ.length) * 100;

  const handleAnswerSelect = (answer: QuizAnswer) => {
    if (showExplanation) return; // Prevent changing answer after correct selection

    setSelectedAnswer(answer.id);

    if (answer.isCorrect) {
      setAnswerFeedback('correct');
      setShowExplanation(true);
    } else {
      setAnswerFeedback('incorrect');
      // Reset after delay to allow retry
      setTimeout(() => {
        setSelectedAnswer(null);
        setAnswerFeedback(null);
      }, 1500);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleCompleteQuiz();
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnswerFeedback(null);
    }
  };

  const handleCompleteQuiz = async () => {
    dispatch(showLoading());

    try {
      const resp = await CompleteChefQuizAPI({ user_id: self.id });

      dispatch(hideLoading());

      if (resp.success === 1) {
        // Update user state with quiz_completed: 1
        dispatch(setUser(resp.data));
        ShowSuccessToast('Safety quiz completed!');
        // Navigate to chef home/tabs
        navigate.toChef.tabs();
      } else {
        ShowErrorToast(resp.message || 'Failed to complete quiz');
      }
    } catch (error) {
      dispatch(hideLoading());
      ShowErrorToast('An error occurred. Please try again.');
    }
  };

  const getAnswerButtonStyle = (answer: QuizAnswer) => {
    if (selectedAnswer === answer.id) {
      if (answerFeedback === 'correct') {
        return [styles.answerButton, styles.answerButtonCorrect];
      } else if (answerFeedback === 'incorrect') {
        return [styles.answerButton, styles.answerButtonIncorrect];
      }
    }
    return styles.answerButton;
  };

  return (
    <SafeAreaView style={styles.main}>
      <Container>
        <ScrollView contentContainerStyle={styles.pageView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Safety Quiz</Text>
            <Text style={styles.headerSubtitle}>
              Complete this short quiz to begin your chef journey
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Question {currentQuestionIndex + 1} of {CHEF_SAFETY_QUIZ.length}
            </Text>
          </View>

          {/* Question Card */}
          <View style={styles.questionCard}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{currentQuestion.category}</Text>
            </View>

            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            {/* Answer Options */}
            <View style={styles.answersContainer}>
              {currentQuestion.answers.map((answer) => (
                <TouchableOpacity
                  key={answer.id}
                  style={getAnswerButtonStyle(answer)}
                  onPress={() => handleAnswerSelect(answer)}
                  disabled={showExplanation}
                >
                  <View style={styles.answerLabelContainer}>
                    <View style={styles.answerLabel}>
                      <Text style={styles.answerLabelText}>{answer.id}</Text>
                    </View>
                  </View>
                  <Text style={styles.answerText}>{answer.text}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Explanation (shown after correct answer) */}
            {showExplanation && (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationTitle}>✓ Correct!</Text>
                <Text style={styles.explanationText}>
                  {currentQuestion.explanation}
                </Text>
              </View>
            )}

            {/* Incorrect Feedback */}
            {answerFeedback === 'incorrect' && (
              <View style={styles.incorrectFeedback}>
                <Text style={styles.incorrectText}>
                  Not quite. Please try again.
                </Text>
              </View>
            )}
          </View>

          {/* Next Button (only shown after correct answer) */}
          {showExplanation && (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? 'Complete Quiz' : 'Next Question'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  pageView: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: AppColors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.primary,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.text,
    lineHeight: 28,
    marginBottom: 24,
  },
  answersContainer: {
    gap: 12,
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  answerButtonCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  answerButtonIncorrect: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  answerLabelContainer: {
    marginRight: 12,
  },
  answerLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  answerLabelText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.primary,
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text,
    lineHeight: 22,
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: '#2E7D32',
    lineHeight: 21,
  },
  incorrectFeedback: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  incorrectText: {
    fontSize: 14,
    color: '#C62828',
    fontWeight: '600',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
});

export default SafetyQuiz;
```

### 4.3 Create API Service Function

**File:** [frontend/app/services/api.ts](../frontend/app/services/api.ts)

**Add Function:** After existing API functions

```typescript
/**
 * Complete chef safety quiz
 */
export const CompleteChefQuizAPI = async (params: {
  user_id?: number;
}): Promise<IResponse<IUser>> => {
  const data = await fetch(MAPI_URL + '/complete_chef_quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  return await data.json();
};
```

### 4.4 Update Navigation Utility

**File:** [frontend/app/utils/navigation.ts](../frontend/app/utils/navigation.ts:191)

**Add Route:** In `toChef` object (after line 191)

```typescript
toChef: {
  home: () => router.push('/screens/chef/(tabs)/home' as any),
  tabs: () => router.replace('/screens/chef/(tabs)' as any),
  orders: () => router.push('/screens/chef/(tabs)/orders' as any),
  menu: () => router.push('/screens/chef/(tabs)/menu' as any),
  profile: () => router.push('/screens/chef/(tabs)/profile' as any),
  earnings: () => router.push('/screens/chef/(tabs)/earnings' as any),
  safetyQuiz: () => router.push('/screens/chef/safetyQuiz' as any), // ADD THIS
  // ... rest of routes
}
```

### 4.5 Create Quiz Screen File

**New File:** `frontend/app/screens/chef/safetyQuiz.tsx`

This file will be the Expo Router entry point that imports the quiz component.

```typescript
import SafetyQuiz from './safetyQuiz/index';

export default SafetyQuiz;
```

---

## 5. Update Chef Home Navigation Logic

### 5.1 Modify Chef Home Screen

**File:** [frontend/app/screens/chef/home/index.tsx](../frontend/app/screens/chef/home/index.tsx:97-99)

**Change:** Update `useEffect` to check both `is_pending` and `quiz_completed`

**Current Code (Lines 96-100):**
```typescript
useEffect(() => {
  if (self.is_pending === 1) {
    navigate.toChef.howToDoIt();
  }
}, []);
```

**New Code:**
```typescript
useEffect(() => {
  // Redirect to safety quiz if chef is pending and hasn't completed quiz
  if (self.is_pending === 1 && self.quiz_completed === 0) {
    navigate.toChef.safetyQuiz();
  }
  // Note: If is_pending === 1 and quiz_completed === 1, show onboarding checklist (existing behavior)
}, []);
```

**Explanation:**
- If `is_pending === 1` AND `quiz_completed === 0`: Redirect to safety quiz
- If `is_pending === 1` AND `quiz_completed === 1`: Show onboarding checklist (lines 257-321)
- If `is_pending === 0`: Show normal chef dashboard with orders (lines 323-361)

---

## 6. Update Chef Layout Stack Navigator

### 6.1 Add Quiz Route to Stack

**File:** [frontend/app/screens/chef/_layout.tsx](../frontend/app/screens/chef/_layout.tsx)

**Add Route:** Add new stack screen for safety quiz

```typescript
<Stack.Screen
  name="safetyQuiz"
  options={{
    headerShown: false,
    presentation: 'card',
    animation: 'slide_from_right',
  }}
/>
```

**Location:** Add this screen definition alongside other chef screens like `howToDo`, `orderDetail`, etc.

---

## 7. Remove/Deprecate Old Tutorial Screens

### 7.1 Keep Files But Remove Navigation

**Important:** We will keep the old files but remove all navigation to them, effectively deprecating them.

**Files to Keep (but deprecate):**
- [frontend/app/screens/chef/howToDo/index.tsx](../frontend/app/screens/chef/howToDo/index.tsx)
- [frontend/app/screens/chef/onboarding/index.tsx](../frontend/app/screens/chef/onboarding/index.tsx)

**Why Keep Them:**
- Historical reference
- Potential rollback if issues arise
- May contain useful code patterns for future features

**Navigation Changes:**
- Remove `navigate.toChef.howToDoIt()` call from [home/index.tsx](../frontend/app/screens/chef/home/index.tsx:98)
- ✅ Already done in section 5.1 above

**Later (separate task):**
- After quiz is stable and tested, these files can be deleted entirely
- Remove `howToDo` route from `_layout.tsx`
- Remove assets: `onboarding_end.png` if no longer used

---

## 8. Testing Plan

### 8.1 Backend Testing

**Test Cases:**

1. **Database Migration**
   - ✓ Run migration successfully
   - ✓ Verify `quiz_completed` column exists with default value 0
   - ✓ Test rollback migration

2. **API Endpoint Testing**
   - ✓ POST `/complete_chef_quiz` with valid user_id (chef)
   - ✓ Verify response includes updated user with `quiz_completed: 1`
   - ✓ Test with invalid user_id (error handling)
   - ✓ Test with customer user_type (should fail)
   - ✓ Test with missing user_id parameter

3. **Registration Flow**
   - ✓ Create new chef account
   - ✓ Verify `is_pending: 1` and `quiz_completed: 0` in database
   - ✓ Verify customer accounts not affected (no quiz_completed set)

### 8.2 Frontend Testing

**Test Cases:**

1. **New Chef Signup**
   - ✓ Complete full chef signup flow (7 steps)
   - ✓ After signup, verify redirect to safety quiz screen
   - ✓ Verify quiz displays question 1 correctly

2. **Quiz Interaction**
   - ✓ Select incorrect answer → see red feedback, reset, retry
   - ✓ Select correct answer → see green feedback, explanation appears
   - ✓ Click "Next" → advance to question 2
   - ✓ Complete all 5 questions
   - ✓ Click "Complete Quiz" on question 5

3. **Quiz Completion**
   - ✓ Verify API call to `/complete_chef_quiz`
   - ✓ Verify user state updated with `quiz_completed: 1`
   - ✓ Verify navigation to chef home/tabs
   - ✓ Verify onboarding checklist displays (not quiz screen)

4. **Return User Flow**
   - ✓ Close app after completing quiz
   - ✓ Reopen app
   - ✓ Verify NO redirect to quiz (should go to home/tabs)
   - ✓ Verify quiz_completed persists in user state

5. **Edge Cases**
   - ✓ Test network failure during quiz completion
   - ✓ Test quiz state persistence if app crashes mid-quiz
   - ✓ Test back button behavior (should not allow going back)

### 8.3 Visual/UX Testing

**Test Cases:**
- ✓ Quiz displays properly on iPhone SE (small screen)
- ✓ Quiz displays properly on iPhone 14 Pro Max (large screen)
- ✓ Quiz displays properly on iPad (tablet layout)
- ✓ Answer buttons are easily tappable (min 44x44pt touch target)
- ✓ Text is readable (sufficient contrast, font size)
- ✓ Animations are smooth (answer feedback, transitions)
- ✓ Progress bar updates correctly
- ✓ Category badge displays properly
- ✓ Explanation text is readable and well-formatted

---

## 9. Implementation Phases

### Phase 1: Backend Setup (Day 1)
- [ ] Create database migration
- [ ] Run migration on development database
- [ ] Update `Listener.php` model
- [ ] Create `completeChefQuiz` API endpoint
- [ ] Add route to `mapi.php`
- [ ] Test API with Postman/curl
- [ ] Update `register()` method to set `quiz_completed: 0`

### Phase 2: Frontend Data Layer (Day 1)
- [ ] Update `user.interface.ts` with `quiz_completed` field
- [ ] Create `CompleteChefQuizAPI` function in `api.ts`
- [ ] Test API function in isolation

### Phase 3: Quiz Component (Day 2)
- [ ] Create `safetyQuiz/quizData.ts` with all questions
- [ ] Create `safetyQuiz/index.tsx` component
- [ ] Implement question display UI
- [ ] Implement answer selection logic
- [ ] Implement correct/incorrect feedback
- [ ] Implement explanation display
- [ ] Implement progress indicator
- [ ] Implement "Next" button logic
- [ ] Create `safetyQuiz.tsx` router file

### Phase 4: Navigation Integration (Day 2)
- [ ] Update `navigation.ts` with `safetyQuiz` route
- [ ] Add quiz route to `_layout.tsx`
- [ ] Update chef `home/index.tsx` navigation logic
- [ ] Test navigation flow from signup → quiz → home

### Phase 5: API Integration (Day 3)
- [ ] Connect quiz completion to API call
- [ ] Update Redux user state on completion
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Test full flow: signup → quiz → complete → home

### Phase 6: Styling & Polish (Day 3)
- [ ] Refine component styles
- [ ] Add animations for answer feedback
- [ ] Test responsive layouts
- [ ] Add accessibility labels
- [ ] Optimize performance

### Phase 7: Testing & QA (Day 4)
- [ ] Execute all test cases from section 8
- [ ] Fix bugs found during testing
- [ ] Test on physical devices
- [ ] Verify database changes on staging server
- [ ] User acceptance testing (UAT)

### Phase 8: Deployment (Day 5)
- [ ] Deploy backend changes to staging
- [ ] Test end-to-end on staging
- [ ] Deploy frontend to staging (TestFlight/internal)
- [ ] Final QA on staging
- [ ] Deploy to production
- [ ] Monitor for errors

### Phase 9: Deprecation (Post-Launch)
- [ ] Monitor quiz completion rates
- [ ] Gather user feedback
- [ ] After 2 weeks of stability, delete old tutorial files
- [ ] Remove unused routes from `_layout.tsx`
- [ ] Remove unused navigation functions

---

## 10. Code Citations & File References

### Files to Create
| File Path | Purpose |
|-----------|---------|
| `frontend/app/screens/chef/safetyQuiz/index.tsx` | Main quiz component |
| `frontend/app/screens/chef/safetyQuiz/quizData.ts` | Quiz questions data |
| `frontend/app/screens/chef/safetyQuiz.tsx` | Expo Router entry point |
| `backend/database/migrations/2025_XX_XX_XXXXXX_add_quiz_completed_to_users.php` | Database migration |

### Files to Modify
| File Path | Lines | Changes |
|-----------|-------|---------|
| [backend/app/Listener.php](../backend/app/Listener.php) | 23 | Add `quiz_completed` to `$fillable` |
| [backend/app/Http/Controllers/MapiController.php](../backend/app/Http/Controllers/MapiController.php) | 333-427 | Update `register()`, add `completeChefQuiz()` |
| [backend/routes/mapi.php](../backend/routes/mapi.php) | ~30+ | Add `/complete_chef_quiz` route |
| [backend/database/taist-schema.sql](../backend/database/taist-schema.sql) | 475-505 | Add `quiz_completed` column to schema |
| [frontend/app/types/user.interface.ts](../frontend/app/types/user.interface.ts) | 16 | Add `quiz_completed?: number` |
| [frontend/app/services/api.ts](../frontend/app/services/api.ts) | End | Add `CompleteChefQuizAPI` function |
| [frontend/app/utils/navigation.ts](../frontend/app/utils/navigation.ts) | 191 | Add `safetyQuiz` navigation function |
| [frontend/app/screens/chef/home/index.tsx](../frontend/app/screens/chef/home/index.tsx) | 97-99 | Update `useEffect` navigation logic |
| [frontend/app/screens/chef/_layout.tsx](../frontend/app/screens/chef/_layout.tsx) | - | Add `safetyQuiz` screen to Stack |

### Files to Deprecate (Keep but Not Use)
| File Path | Status |
|-----------|--------|
| [frontend/app/screens/chef/howToDo/index.tsx](../frontend/app/screens/chef/howToDo/index.tsx) | Deprecated - remove navigation to it |
| [frontend/app/screens/chef/onboarding/index.tsx](../frontend/app/screens/chef/onboarding/index.tsx) | Deprecated - already unused |

---

## 11. Rollback Plan

If critical issues arise post-deployment:

### Quick Rollback (< 1 hour)
1. Revert [home/index.tsx](../frontend/app/screens/chef/home/index.tsx:97-99) to call `navigate.toChef.howToDoIt()`
2. Deploy frontend hotfix
3. Leave database changes in place (backward compatible)

### Full Rollback (if needed)
1. Revert all frontend changes via git
2. Run database migration rollback: `php artisan migrate:rollback --step=1`
3. Remove `quiz_completed` API route
4. Deploy reverted backend
5. Deploy reverted frontend

---

## 12. Success Metrics

### Key Performance Indicators (KPIs)

**Completion Rates:**
- Target: 95%+ of new chefs complete quiz on first attempt
- Measure: Track quiz completion within 24 hours of signup

**User Experience:**
- Target: Average time to complete quiz < 3 minutes
- Measure: Time from quiz start to API completion call

**Error Rates:**
- Target: < 1% API failures during quiz completion
- Measure: Monitor API error logs for `/complete_chef_quiz`

**Retention:**
- Target: No decrease in chef retention vs. old tutorial
- Measure: Compare 7-day chef retention before/after launch

**Question Difficulty:**
- Track average attempts per question
- If question requires > 3 attempts on average, consider rewording

---

## 13. Future Enhancements (Out of Scope)

**V2 Features to Consider:**
1. **Quiz Analytics**
   - Track which questions chefs struggle with most
   - Store individual question attempts in database
   - Admin dashboard to view quiz performance

2. **Refresher Quizzes**
   - Require chefs to retake quiz every 6 months
   - Send push notifications for refresher reminders

3. **Certificate/Badge**
   - Display "Food Safety Certified" badge on chef profiles
   - Show certificate in chef app after completion

4. **Localization**
   - Translate quiz to Spanish and other languages
   - Store quiz language preference

5. **Images/Illustrations**
   - Add visual aids to questions
   - Use images to demonstrate correct procedures

6. **Video Explanations**
   - Replace text explanations with short 15-second videos
   - Show correct procedures visually

---

## 14. Dependencies & Prerequisites

### Backend
- Laravel framework (existing)
- MySQL database (existing)
- PHP 7.4+ (existing)
- Composer (existing)

### Frontend
- React Native (existing)
- Expo Router (existing)
- Redux Toolkit (existing)
- TypeScript (existing)

### External Services
- None required (all internal)

### Development Environment
- Access to staging database
- Access to staging API server
- iOS simulator or physical device for testing
- Postman or similar for API testing

---

## 15. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Chefs abandon signup due to quiz | Low | High | Keep quiz short (5 questions), make it engaging |
| API failure during completion | Medium | High | Implement retry logic, show error message |
| Quiz state lost if app crashes | Low | Medium | Consider persisting quiz progress to AsyncStorage |
| Incorrect answers frustrate users | Low | Medium | Provide helpful explanations, allow unlimited retries |
| Database migration fails in production | Low | Critical | Test migration thoroughly on staging, backup database |
| Old tutorial still accessible | Low | Low | Remove all navigation paths to old screens |
| Users bypass quiz (hack/exploit) | Very Low | Medium | Backend enforces quiz completion before approval |

---

## 16. Accessibility Considerations

**WCAG 2.1 Compliance:**
- [ ] Minimum touch target size: 44x44pt for all buttons
- [ ] Color contrast ratio: 4.5:1 for body text, 3:1 for large text
- [ ] Screen reader support: Add `accessibilityLabel` to all interactive elements
- [ ] Keyboard navigation: Support for hardware keyboards on iPad
- [ ] Dynamic text: Respect iOS text size settings
- [ ] VoiceOver testing: Ensure quiz is fully navigable with VoiceOver

**Inclusive Design:**
- Clear, simple language (avoid jargon)
- Visual feedback not reliant on color alone (use icons + text)
- Support for color blindness (green/red feedback also uses checkmarks/X)
- Large, readable fonts (minimum 16pt for body text)

---

## 17. Documentation Updates Needed

After implementation, update:
1. Chef onboarding documentation (if exists)
2. API documentation with new `/complete_chef_quiz` endpoint
3. Database schema documentation
4. TypeScript type definitions documentation
5. Internal wiki/knowledge base about chef signup flow

---

## 18. Sign-Off & Approval

**Plan Author:** [Your Name]
**Plan Date:** 2025-XX-XX
**Plan Version:** 1.0

**Stakeholder Approval Required:**
- [ ] Product Owner
- [ ] Engineering Lead
- [ ] QA Lead
- [ ] Design Review
- [ ] Compliance/Legal (food safety content)

---

## Appendix A: Current vs. New User Flow Comparison

### Current Flow (Before)
```
Chef Signup (7 steps)
    ↓
Registration API (is_pending: 1)
    ↓
Redirect to Chef Tabs
    ↓
Home Screen useEffect detects is_pending === 1
    ↓
Auto-navigate to HowToDo screen (6-page tutorial)
    ↓
Chef manually clicks through 6 pages
    ↓
Tutorial ends, back to Home
    ↓
Home displays onboarding checklist
    ↓
Chef completes 5 checklist items manually
    ↓
Admin approves (is_pending: 0)
    ↓
Chef sees normal dashboard
```

### New Flow (After)
```
Chef Signup (7 steps)
    ↓
Registration API (is_pending: 1, quiz_completed: 0)
    ↓
Redirect to Safety Quiz screen
    ↓
Chef answers 5 questions progressively
    ↓
Quiz completion API call (quiz_completed: 1)
    ↓
Redirect to Chef Tabs
    ↓
Home displays onboarding checklist (no tutorial)
    ↓
Chef completes 5 checklist items manually
    ↓
Admin approves (is_pending: 0)
    ↓
Chef sees normal dashboard
```

**Key Differences:**
- ✅ Quiz replaces passive tutorial with active learning
- ✅ Quiz completion tracked in database
- ✅ Progressive question flow enforces comprehension
- ✅ Shorter overall onboarding time (estimated 3 min vs. 5+ min)
- ✅ Better knowledge retention through active testing

---

## Appendix B: Quiz Question Design Rationale

### Question 1: Food Storage & Transportation
**Rationale:** Most critical food safety issue is temperature control. Chefs must understand refrigeration is non-negotiable.

### Question 2: Handwashing & Hygiene
**Rationale:** First action on arrival sets tone for entire order. Hand washing and surface cleaning prevent most contamination.

### Question 3: Food Temperature
**Rationale:** Specific temperature knowledge is critical for preventing foodborne illness. 165°F for chicken is industry standard.

### Question 4: Cross-Contamination
**Rationale:** Separate cutting boards are a simple, practical safety measure chefs must implement on every order.

### Question 5: Kitchen Reset
**Rationale:** Taist's unique requirement. Chefs must understand they're responsible for cleaning their own equipment.

---

## Appendix C: API Request/Response Examples

### Complete Chef Quiz API

**Request:**
```json
POST /complete_chef_quiz
Content-Type: application/json

{
  "user_id": 42
}
```

**Success Response:**
```json
{
  "success": 1,
  "message": "Quiz completed successfully",
  "data": {
    "id": 42,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "user_type": 2,
    "is_pending": 1,
    "quiz_completed": 1,
    "verified": 1,
    ...
  }
}
```

**Error Response (Not a chef):**
```json
{
  "success": 0,
  "message": "Only chefs can complete the safety quiz"
}
```

**Error Response (User not found):**
```json
{
  "success": 0,
  "message": "User not found"
}
```

---

## Appendix D: Component Style Guide

### Color Palette
- **Primary Orange:** `AppColors.primary` (#FF6B35 or similar)
- **Text Primary:** `AppColors.text` (#000000 or similar)
- **Text Secondary:** `AppColors.textSecondary` (#666666 or similar)
- **Background:** `AppColors.background` (#FFFFFF or similar)
- **Success Green:** `#4CAF50`
- **Error Red:** `#F44336`
- **Light Green Background:** `#E8F5E9`
- **Light Red Background:** `#FFEBEE`

### Typography
- **Header Title:** 32pt, Bold (700)
- **Question Text:** 20pt, Semibold (600)
- **Answer Text:** 16pt, Regular (400)
- **Button Text:** 18pt, Bold (700)
- **Category Badge:** 12pt, Semibold (600), Uppercase

### Spacing
- **Card Padding:** 24px
- **Element Gap:** 12-16px
- **Section Margin:** 24-32px

---

## End of Implementation Plan
