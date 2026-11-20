# Amrit Astro Technical

A React and TypeScript course storefront for financial education, self-development and holistic wellness. Checkout starts in simulation mode. You can complete the entire purchase journey locally without credentials.

## Run locally

Use Node.js 22.12 or newer and npm. From the directory containing this README, run:

```sh
npm install
npm run dev
```

Open the local address printed by Vite. To check types and generate the production bundle, run `npm run build`. Run `npm run preview` to serve that bundle locally. Vite's development and preview servers serve the frontend. Use a host emulator such as `vercel dev` when exercising the real API routes.

## Customise

- **Catalogue** — Edit `src/data/products.js`. Prices are in rupees. Give a specialty module a numeric price to enable its cart controls. Keep product IDs stable because saved carts use them.
- **Pricing and contact details** — Edit `src/config.js`. Confirm the GST percentage and inclusive treatment with your CA. Set the convenience fee in rupees. Reference prices are hidden initially. Enable them only when you can substantiate the prior charges. Replace the form URL and contact email.
- **Policies** — Complete the operator name, registered address, contact email and refund window in `src/Legal.tsx`. Confirm that the published terms, retention practices and refund handling match how the business operates. The privacy notice is drafted with phased implementation of India's data protection framework in mind. [Digital Personal Data Protection Act](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023-1.pdf) · [Digital Personal Data Protection Rules](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)

## Connect Razorpay

1. Create an API key pair in the Razorpay dashboard. Use the gateway's test credentials for staging. Set the **server runtime** variables `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in your host's environment settings. Set the **frontend build** variable `VITE_RAZORPAY_KEY_ID` to the same public ID. For local emulators see `.env.example`. Keep secrets out of version control and frontend build variables.
2. Deploy both POST routes described below. In `src/config.js`, set `TEST_MODE = false` to exercise the gateway on your staging deploy. Rebuild both frontend and functions. Test order creation, cancellation, retries, payment capture, verification and the itemised receipt.
3. To accept actual payments, configure your activated merchant account's live key pair and capture settings, supply the matching live public ID, retain `TEST_MODE = false`, and redeploy. A test-mode simulation receipt represents a demonstration purchase. Fulfil real orders only against verified, captured Razorpay records. [Razorpay Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)

`POST /api/create-order` accepts `{"items":[{"id":"intro-webinar","quantity":1}]}`. The backend looks up pricing, applies quantity limits and computes the INR amount in paise. `POST /api/verify-payment` receives the order ID, payment ID and signature, checks the server-side order and signature, then checks payment amount, currency and capture status. Both functions use the shared handler in `api/_shared/payment.js`. A browser receipt is for display. Use the merchant dashboard or a server-side record for reconciliation and fulfilment.

## Deploy

Use the project directory as the host's root, `npm run build` as the build command, and `dist` as the static output directory. Set the frontend build and server runtime variables separately. A static-only deployment supports the simulated checkout.

### Vercel

Choose the Vite preset and deploy the project, including the root `api` directory. The two supplied Node handlers map to the required API paths. Configure SPA rewrites for direct visits to `/cart`, `/checkout`, `/success`, `/terms`, `/privacy`, `/refund-policy` and `/disclaimer`, with `/index.html` as the destination. Keep API routes and assets outside the SPA rewrite. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) · [Node functions](https://vercel.com/docs/functions/runtimes/node-js)

### Netlify

Use a Netlify Function to expose the shared handler. Save the adapter below as `netlify/functions/payment.mjs`. Set the server credentials with Functions scope. For direct page visits, add the SPA fallback `/* /index.html 200` to `public/_redirects`, after any explicit routes. Deploy the project so Netlify bundles functions as well as static assets. [Functions API](https://docs.netlify.com/build/functions/api/) · [SPA rewrites](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/)

```js
import { paymentRequest } from "../../api/_shared/payment.js";

export const config = { path: ["/api/create-order", "/api/verify-payment"] };

export default function payment(request) {
  const route = new URL(request.url).pathname.split("/").pop();
  return paymentRequest(route, request, process.env);
}
```

### Cloudflare Pages

Create `functions/api/[route].js` beside the project root's `src` directory using the adapter below. Set `RAZORPAY_KEY_SECRET` as a secret and `RAZORPAY_KEY_ID` as a runtime binding for the intended environment. Deploy with Pages Git integration or run `npx wrangler pages deploy dist` from this project directory after building. Pages discovers the root functions directory and serves the Vite app on unmatched frontend routes using its default SPA fallback. [Pages Functions routing](https://developers.cloudflare.com/pages/functions/routing/) · [Functions API](https://developers.cloudflare.com/pages/functions/api-reference/)

```js
import { paymentRequest } from "../../api/_shared/payment.js";

export function onRequest({ params, request, env }) {
  if (!["create-order", "verify-payment"].includes(params.route)) {
    return new Response("Unknown route", { status: 404 });
  }
  return paymentRequest(params.route, request, env);
}
```

After deployment, open each legal and checkout route directly and test the INR 99 webinar flow. In simulation mode, confirm that both the modal and receipt identify the payment as simulated. In gateway staging, confirm that verification agrees with the payment status shown in the merchant dashboard.

The Mind & Well-being course card uses the supplied park meditation photograph.
