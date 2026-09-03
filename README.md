# Whisper — Anonymous Messaging MERN App

This repository is a deployable NGL-style anonymous messaging app with:

- React + Vite + TypeScript
- Tailwind CSS + Framer Motion
- React Query + Axios
- Socket.io live inbox updates
- Node + Express + TypeScript
- MongoDB / MongoDB Atlas + Mongoose
- JWT HTTP-only cookies
- bcryptjs
- Rate limiting and moderation
- Optional sender Instagram username
- Razorpay premium sender hints
- Razorpay message boosts
- GitHub Pages frontend deployment
- Render backend deployment

## Premium flow

1. Sender can optionally enter an Instagram username on the anonymous send form.
2. The username is stored only if voluntarily provided.
3. Recipient clicks **Unlock sender hint**.
4. Backend creates a Razorpay order.
5. Razorpay Checkout opens in the browser.
6. Backend verifies the Razorpay HMAC signature.
7. The backend unlocks the message entitlement.
8. Recipient can retrieve the premium hint.

Current default prices:
- Sender hint: ₹49
- Boost: ₹29

Change them with `HINT_PRICE_INR` and `BOOST_PRICE_INR` on the backend.

## Recommended free deployment

```text
GitHub Pages
    ↓ HTTPS
React/Vite frontend
    ↓ HTTPS + credentials
Render Web Service
    ↓
MongoDB Atlas
    ↓
Razorpay API
```

See **README-GITHUB-PAGES.md** for the complete setup.

## Important

GitHub Pages cannot run the Node/Express API. Keep the backend on Render.

Never commit:
- `server/.env`
- `client/.env`
- MongoDB credentials
- JWT secret
- Razorpay secret
