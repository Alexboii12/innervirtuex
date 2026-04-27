# Publish INNER VIRTUE X

## 1. Before you deploy

Edit `index.html` and paste your real Razorpay links into:

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

Optional:

- Add Stripe links later
- Replace `audioSrc`

## 2. Create Brevo credentials

You need:

- `BREVO_API_KEY`
- `BREVO_LIST_ID`

Optional:

- `BREVO_DOI_TEMPLATE_ID`
- `BREVO_REDIRECT_URL`

## 3. Deploy to Vercel

1. Push this folder to GitHub
2. Import the repo into Vercel
3. In Vercel project settings, add environment variables:
   - `BREVO_API_KEY`
   - `BREVO_LIST_ID`
   - optional `BREVO_DOI_TEMPLATE_ID`
   - optional `BREVO_REDIRECT_URL`
4. Redeploy

## 4. Test after deploy

1. Open the live site on mobile
2. Submit your own email in the subscribe form
3. Click each Razorpay product button
4. Confirm the correct product/payment page opens
5. Confirm the site still feels smooth after entering through the gateway

## 5. Launch checklist

- Subscribe form returns success
- Razorpay links are real
- No `example.com` URLs remain
- Audio file is real or intentionally disabled
- Domain is connected
- Instagram bio points to the live URL
