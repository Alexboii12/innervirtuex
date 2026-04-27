# INNER VIRTUE X Setup Guide

This site is now prepared for a real launch with:

1. Razorpay-first checkout buttons
2. A real backend subscribe endpoint at `/api/subscribe`
3. Brevo as the email provider behind that endpoint
4. Optional Stripe links as a secondary checkout path
5. Configurable protocol text and audio

Everything is configured from:

- `index.html`
- `api/subscribe.js`
- `.env.example`
- The `CONFIG` object inside the `<script>` block near the bottom

## Launch First

If your goal is to publish quickly, do these now:

1. Create your Razorpay payment links
2. Paste them into `CONFIG.paymentLinks.razorpay` in `index.html`
3. Create a Brevo account and list
4. Add the Brevo environment variables in Vercel
5. Deploy the folder to Vercel
6. Test one real subscribe and one real payment on mobile

## 1. Audio Setup

### What to do

Use one real ambient audio file for the site and optionally one file per protocol.

Inside `CONFIG`, update:

```js
audioSrc: "https://your-domain.com/audio/main-drone.mp3"
```

Optional per protocol:

```js
protocols: {
  anchor: {
    title: "PROTOCOL 01: THE ANCHOR",
    audioSrc: "https://your-domain.com/audio/anchor.mp3",
    holdMs: 5000,
    text: "..."
  }
}
```

### Best practice

- Use `.mp3`
- Keep it 2 to 8 minutes long if looping
- Export at a reasonable size so mobile users are not forced to load a huge file
- Use calm, low-intensity ambience without vocals
- Test on mobile because browser audio behavior is stricter there

### Where to host it

Good options:

- Cloudinary
- Amazon S3
- Supabase Storage
- Your own hosting/CDN

Avoid depending on a random public URL that might disappear later.

## 2. Subscribe Form Setup

The subscribe form is now already connected to a real backend route:

- `/api/subscribe`

That route is implemented in:

- `api/subscribe.js`

Do not put your Mailchimp, Brevo, or Kit API key directly in frontend JavaScript.
That would expose your secret key to everyone.

### How it should work

Use this flow:

1. Website form submits email
2. Your backend endpoint receives it
3. Backend calls your email platform API
4. Email platform stores subscriber and optionally sends double opt-in email

### What the backend does

The backend sends the email to Brevo using the official contact endpoints.

If you set both `BREVO_DOI_TEMPLATE_ID` and `BREVO_REDIRECT_URL`, it will use Brevo double opt-in.
If you leave those blank, it will create or update the contact directly in your selected list.

### Brevo setup steps

1. Create a Brevo account
2. Create a contact list
3. Copy the list ID
4. Create an API key
5. Add the environment variables in Vercel
6. Deploy
7. Test with a real email address

Official docs:

- [Brevo forms overview](https://help.brevo.com/hc/en-us/sections/202171729-Forms)
- [Create a sign-up form in Brevo](https://help.brevo.com/hc/en-us/articles/208771869-Create-a-subscription-form-)
- [Brevo create contact API](https://developers.brevo.com/reference/createcontact)
- [Brevo double opt-in API](https://developers.brevo.com/reference/createdoicontact)

### Required environment variables

Copy from `.env.example`:

```bash
BREVO_API_KEY=your_brevo_api_key
BREVO_LIST_ID=2
BREVO_DOI_TEMPLATE_ID=
BREVO_REDIRECT_URL=
```

### How to set them in Vercel

1. Open your Vercel project
2. Go to `Settings`
3. Go to `Environment Variables`
4. Add:
   - `BREVO_API_KEY`
   - `BREVO_LIST_ID`
   - optional `BREVO_DOI_TEMPLATE_ID`
   - optional `BREVO_REDIRECT_URL`
5. Redeploy the site

### Recommended mode

For fastest launch:

- Use Brevo without DOI first if you just want the form live quickly

For better list quality:

- Use Brevo DOI with:
  - `BREVO_DOI_TEMPLATE_ID`
  - `BREVO_REDIRECT_URL`

### What your backend should validate

- Email is present
- Email looks valid
- Reject duplicates gracefully
- Return success/failure JSON
- Enable CORS for your deployed domain if needed

## 3. Protocol 1, 2, 3 Setup

Protocols are now configured from `CONFIG.protocols`.

Each protocol supports:

- `title`
- `audioSrc`
- `holdMs`
- `text`

Example:

```js
protocols: {
  anchor: {
    title: "PROTOCOL 01: THE ANCHOR",
    audioSrc: "https://your-domain.com/audio/anchor.mp3",
    holdMs: 5000,
    text: "Your guided sequence here."
  }
}
```

### How to design each protocol well

Protocol 01:
- Focus on grounding
- Short, sensory, physical, stabilizing

Protocol 02:
- Focus on emotional regulation
- Slower pacing, more breath language, softer transitions

Protocol 03:
- Focus on observer consciousness
- More spacious, reflective, identity-shifting language

### Good writing rules

- Keep each one between 2 and 6 sentences
- Use short lines
- Avoid motivational language
- Use body sensation, breath, stillness, observation
- Let the silence do some of the work

## 4. Stripe Setup

You have two practical choices.

### Fastest option: Stripe Payment Links

This is the easiest path for a static site like yours.

Create one Payment Link per product in Stripe Dashboard, then paste each link into `CONFIG.paymentLinks.stripe`.

Example:

```js
paymentLinks: {
  stripe: {
    controlMind: "https://buy.stripe.com/...",
    emotionalDiscipline: "https://buy.stripe.com/...",
    resilienceJournal: "https://buy.stripe.com/...",
    library: "https://buy.stripe.com/..."
  }
}
```

Official docs:

- [Stripe Payment Links](https://docs.stripe.com/payments/payment-links)
- [Stripe no-code payments](https://docs.stripe.com/payments/no-code)

### Stripe Payment Link steps

1. Create a Stripe account
2. Add your business details and complete activation
3. Create each product in Stripe Dashboard
4. Create a Payment Link for each product
5. Copy each hosted checkout URL
6. Paste them into `CONFIG.paymentLinks.stripe`

### More advanced option: Stripe Checkout Sessions

Use this if you want:

- Dynamic pricing
- Coupon logic
- Better order tracking
- Webhooks
- Fulfillment automation

This requires a backend.

Official docs:

- [Stripe Checkout quickstart](https://docs.stripe.com/payments/checkout/quickstarts)
- [Checkout Sessions API](https://docs.stripe.com/api/checkout/sessions)

## 5. Razorpay Setup

Again, you have two practical choices.

### Fastest option: Razorpay Payment Links or Payment Buttons

For your current site, this is the correct launch-first route.

Create one link or button per product and paste the URLs into `CONFIG.paymentLinks.razorpay`.

Example:

```js
paymentLinks: {
  razorpay: {
    controlMind: "https://rzp.io/...",
    emotionalDiscipline: "https://rzp.io/...",
    resilienceJournal: "https://rzp.io/...",
    library: "https://rzp.io/..."
  }
}
```

Official docs:

- [Razorpay Payment Links](https://razorpay.com/docs/payments/payment-links/)
- [Razorpay Payment Button](https://razorpay.com/docs/payments/payment-button/)

### Razorpay link/button steps

1. Create a Razorpay account
2. Complete KYC and activation
3. Create product-specific Payment Links or Payment Buttons
4. Copy the hosted URLs
5. Paste them into `CONFIG.paymentLinks.razorpay`

### Advanced option: Razorpay Standard Checkout

Use this if you want custom order creation and payment verification.
This requires a backend because orders must be created server-side and signatures must be verified.

Official docs:

- [Razorpay Standard Checkout prerequisites](https://razorpay.com/docs/payment-gateway/integrations-guide/checkout/)
- [Razorpay Standard Checkout steps](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)

## 6. Recommended Order of Work

Do these in this order:

1. Add Razorpay links in `CONFIG.paymentLinks.razorpay`
2. Set Brevo environment variables in Vercel
3. Deploy to Vercel
4. Test subscribe form
5. Test Razorpay payment flow
6. Replace `CONFIG.audioSrc`
7. Finalize protocol texts
8. Add Stripe later if you still want it

## 7. What I Recommend For You

For the fastest real launch:

1. Use one ambient MP3 for all protocols
2. Use the built Brevo backend endpoint
3. Use Razorpay Payment Links as the main checkout
4. Add Stripe later if needed

That is the cleanest path from draft to a real published site.
