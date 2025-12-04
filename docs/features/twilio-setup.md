# Twilio Phone Verification Setup Guide

This guide explains how to set up Twilio phone verification for the Taist application.

## What is Phone Verification?

Phone verification ensures that users signing up as chefs or customers have valid phone numbers. When a user enters their phone number during signup, they receive an SMS with a 6-digit verification code that they must enter to proceed.

## Setup Instructions

### 1. Create a Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Complete the verification process

### 2. Get Your Twilio Credentials

1. Log in to the [Twilio Console](https://www.twilio.com/console)
2. From the dashboard, copy your:
   - **Account SID** - Your unique account identifier
   - **Auth Token** - Your authentication token (click "Show" to reveal)

### 3. Get a Phone Number

1. In the Twilio Console, go to **Phone Numbers** > **Manage** > **Buy a number**
2. Select a phone number that supports SMS
3. Purchase the number (free trial accounts get one free number)
4. Copy the phone number in E.164 format (e.g., `+15551234567`)

### 4. Configure Environment Variables

Add the following to your `.env` file:

```env
# Twilio SMS Configuration
TWILIO_SID=your_account_sid_here
TWILIO_TOKEN=your_auth_token_here
TWILIO_FROM=+15551234567
```

Replace the placeholder values with your actual credentials from steps 2 and 3.

### 5. Verify the Setup

1. Start your backend server
2. Use the mobile app to sign up as a new user
3. When you reach the phone verification step, enter a valid phone number
4. You should receive an SMS with a 6-digit code
5. Enter the code to complete verification

## Troubleshooting

### Not Receiving SMS Messages

**Trial Account Limitations:**
- Twilio trial accounts can only send SMS to verified phone numbers
- To verify a phone number for testing:
  1. Go to **Phone Numbers** > **Manage** > **Verified Caller IDs**
  2. Click **Add a new Caller ID**
  3. Enter your phone number and verify it

**Solution for Production:**
- Upgrade your Twilio account to remove this restriction
- Production accounts can send to any valid phone number

### Invalid Phone Number Format

- Phone numbers must be in E.164 format: `+[country code][number]`
- Example: US number `(555) 123-4567` becomes `+15551234567`
- The backend automatically strips whitespace and formatting

### Error: "Twilio credentials not configured"

- Verify all three environment variables are set in `.env`:
  - `TWILIO_SID`
  - `TWILIO_TOKEN`
  - `TWILIO_FROM`
- Restart your backend server after updating `.env`
- Check the Laravel logs for more details

### Code Not Working

- Verification codes are valid for the current session only
- Request a new code using the "Resend Code" button
- Check that you're entering all 6 digits correctly

## Cost Information

### Trial Account
- Free $15.50 credit
- Can send SMS to verified numbers only
- 1 free phone number included

### Production Account
- Pay-as-you-go pricing
- SMS costs approximately $0.0079 per message (US)
- Phone number rental: $1.15/month (US)
- No sending restrictions

[Current Twilio Pricing](https://www.twilio.com/sms/pricing)

## Security Best Practices

1. **Never commit credentials to Git**
   - The `.env` file is already in `.gitignore`
   - Use environment variables in production

2. **Protect your Auth Token**
   - Treat it like a password
   - Rotate it regularly in the Twilio Console

3. **Monitor usage**
   - Set up usage alerts in Twilio Console
   - Monitor for unusual activity

4. **Rate limiting**
   - Consider implementing rate limits to prevent abuse
   - Limit verification attempts per phone number

## Development vs Production

### Development/Staging
- Can use trial account
- Add test phone numbers to Verified Caller IDs
- Lower SMS volume expected

### Production
- Must upgrade to production account
- Remove caller ID restrictions
- Set up usage alerts and billing limits
- Consider a dedicated phone number for your brand

## Implementation Details

### Backend
- Service class: `backend/app/Services/TwilioService.php`
- Controller method: `MapiController@verifyPhone`
- Route: `POST /mapi/verify_phone`

### Frontend
- Component: `frontend/app/screens/common/signup/steps/StepChefPhone.tsx`
- API client: `frontend/app/services/api.ts` (VerifyPhoneAPI)

### Workflow
1. User enters phone number
2. Frontend calls `verify_phone` API endpoint
3. Backend generates 6-digit code
4. Backend sends SMS via Twilio
5. Backend returns code to frontend (for verification)
6. User enters code in modal
7. Frontend validates code matches
8. User proceeds to next signup step

## Future Enhancements

Consider these improvements for production:

1. **Secure code storage**
   - Store verification codes in database with expiration
   - Don't return code directly to frontend

2. **Rate limiting**
   - Limit SMS sends per phone number per time period
   - Prevent abuse and reduce costs

3. **Code expiration**
   - Expire codes after 10-15 minutes
   - Require new code after expiration

4. **Attempt limiting**
   - Limit verification attempts (e.g., 3 tries)
   - Lock account after too many failed attempts

5. **Alternative verification**
   - Support voice calls as backup
   - Allow email verification as alternative

## Support

For Twilio-specific issues:
- [Twilio Documentation](https://www.twilio.com/docs)
- [Twilio Support](https://support.twilio.com/)

For Taist implementation issues:
- Check backend logs: `backend/storage/logs/laravel.log`
- Review the GitHub issues
