// Only this public identifier belongs in the browser. Set the secret on the server.
export const RAZORPAY_KEY_ID = import.meta.env?.VITE_RAZORPAY_KEY_ID || "rzp_test_REPLACE_WITH_YOUR_KEY";
export const GST_RATE = 0; // Confirm applicable GST rate with your CA (e.g. 18 for 18%).
export const GST_INCLUSIVE = false;
export const CONVENIENCE_FEE = 0; // INR per order.
export const TEST_MODE = true; // Set to false once live Razorpay keys and backend endpoints are deployed.
export const WHATSAPP_NUMBER = "918229017643";
export const GOOGLE_FORM_URL = "https://forms.gle/REPLACE_WITH_YOUR_FORM_LINK";
export const CONTACT_EMAIL = "[CONTACT EMAIL]";
// Enable ONLY if these reference prices were genuinely charged previously
export const SHOW_REFERENCE_PRICE = false;
