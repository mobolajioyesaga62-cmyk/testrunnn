# Paystack Integration Setup Guide

## Overview

Paystack payment integration has been implemented in your e-commerce platform. This guide walks you through the setup process.

## Prerequisites

1. A Paystack account (create one at https://dashboard.paystack.com if you don't have one)
2. Paystack API keys (Secret Key and Public Key)
3. Deployed Supabase project with edge functions

## Step 1: Get Your Paystack API Keys

1. Log in to your Paystack dashboard at https://dashboard.paystack.com
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your **Secret Key** and **Public Key**
   - Secret Key: Used on the backend (edge functions)
   - Public Key: Used on the frontend (client-side)

## Step 2: Configure Paystack Secret Key

The Paystack Secret Key needs to be configured as an environment variable in your Supabase Edge Functions.

### To set the environment variable:

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. Click on the **initialize_payment** function
4. In the function details, scroll to **Environment Variables**
5. Add a new environment variable:
   - **Key**: `PAYSTACK_SECRET_KEY`
   - **Value**: Your Paystack Secret Key (starts with `sk_`)
6. Save the changes

## Step 3: Configure Paystack Public Key (Optional)

If you want to use Paystack's JavaScript SDK for additional features:

1. Add the following to your `index.html`:

```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

2. You can then use the public key in your frontend code:

```typescript
const publicKey = "your_paystack_public_key";
```

## Step 4: Configure Payment Callback URL

Configure Paystack webhook to notify your application of payment status:

1. In Paystack dashboard, go to **Settings** → **API Keys & Webhooks**
2. Find the **Webhooks** section
3. Add a webhook URL:
   - **URL**: `https://your-domain.com/payment-callback`
   - **Events**: Select "Charge Success"
4. Save the webhook

Note: Replace `your-domain.com` with your actual domain.

## How Payment Flow Works

### 1. Customer Places Order
- Customer fills shipping information
- Selects Paystack as payment method
- Clicks "Place Order"

### 2. Order Creation
- Order is created in database with status "pending"
- Order items are added
- Inventory is reserved

### 3. Payment Initialization
- Frontend calls `/functions/v1/initialize_payment` edge function
- Function sends request to Paystack API
- Paystack returns authorization URL

### 4. Payment Processing
- Customer is redirected to Paystack payment page
- Customer enters payment details
- Paystack processes the payment

### 5. Payment Verification
- Customer is redirected back to `/payment-callback?reference=REFERENCE`
- Frontend calls `/functions/v1/verify_payment` edge function
- Function verifies payment with Paystack
- If successful, order status is updated to "paid"
- Customer sees success page with order details

## Testing Paystack Integration

### Using Paystack Test Keys

1. Get your test keys from Paystack dashboard (if in test mode)
2. Use test card details:

| Field | Value |
|-------|-------|
| Card Number | 4111 1111 1111 1111 |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | 123456 |

### Testing Locally

For local development, you'll need to:

1. Deploy edge functions to your Supabase project (already done)
2. Set the PAYSTACK_SECRET_KEY environment variable (as described above)
3. Use your actual Paystack test keys
4. Use a tool like ngrok to expose your local port if testing webhooks

## Production Checklist

Before going live with real payments:

- [ ] Switch Paystack account to live mode
- [ ] Update edge function environment variable with live Secret Key
- [ ] Test full payment flow with real payment method
- [ ] Configure webhook URL to your production domain
- [ ] Test order creation and status updates
- [ ] Verify email notifications are sent
- [ ] Test edge case scenarios (connection failures, timeouts)
- [ ] Monitor Paystack dashboard for transaction logs
- [ ] Set up alerts for failed transactions

## Supported Payment Methods

Paystack supports:
- Card payments (Visa, Mastercard, Verve)
- Bank transfers
- USSD
- Mobile money
- QR codes

All these methods are automatically available when customers are redirected to Paystack.

## Troubleshooting

### Payment initialization fails
- Check that PAYSTACK_SECRET_KEY is set correctly in edge functions
- Verify the edge function is deployed
- Check browser console for network errors

### Payment verification fails
- Ensure the verify_payment function is deployed
- Check that the reference parameter is passed correctly
- Verify the payment status in Paystack dashboard

### Webhook not being triggered
- Verify webhook URL is correctly configured in Paystack
- Ensure your domain is accessible from the internet
- Check Paystack webhook logs in dashboard

### Order not being updated after payment
- Check database RLS policies allow updates
- Verify the order exists in database before payment
- Check edge function logs for errors

## Security Best Practices

1. **Never expose your Secret Key** - Always keep it in edge functions/backend
2. **Validate webhook signatures** - In production, validate Paystack webhook signatures
3. **Use HTTPS** - All communication must be over HTTPS
4. **Verify amounts** - Always verify the payment amount matches the order
5. **Handle edge cases** - What if payment succeeds but order update fails?

## Support

For Paystack support:
- Documentation: https://paystack.com/docs
- Email: support@paystack.com
- Status page: https://status.paystack.com

For application issues:
- Check browser developer console (F12)
- Check Supabase edge function logs
- Check Paystack transaction logs in dashboard

## API Reference

### Initialize Payment Endpoint

**POST** `/functions/v1/initialize_payment`

Request body:
```json
{
  "order_id": "uuid",
  "amount": 15000,
  "email": "customer@example.com",
  "phone": "+234801234567",
  "customer_name": "John Doe",
  "order_number": "ORD-20240101-001"
}
```

Response:
```json
{
  "success": true,
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "...",
  "reference": "..."
}
```

### Verify Payment Endpoint

**POST** `/functions/v1/verify_payment`

Request body:
```json
{
  "reference": "paystack_reference_code"
}
```

Response:
```json
{
  "success": true,
  "status": "success",
  "amount": 15000,
  "reference": "...",
  "message": "Authorization URL created"
}
```
