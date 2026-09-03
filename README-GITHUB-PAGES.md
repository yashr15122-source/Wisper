# Whisper — GitHub Pages + Render + MongoDB Atlas + Razorpay

## Architecture

- **Frontend:** React/Vite/TypeScript on GitHub Pages
- **Backend:** Node/Express/TypeScript + Socket.io on Render Free
- **Database:** MongoDB Atlas
- **Payments:** Razorpay Checkout + server-side HMAC verification
- **Authentication:** JWT in HTTP-only cookie

> GitHub Pages only hosts the frontend. The Node API, Socket.io server, and payment verification run on Render.

## 1. MongoDB Atlas

Create a MongoDB Atlas cluster and database user.

Use the Atlas connection string as `MONGO_URI`.

For a simple Render deployment, configure Atlas Network Access so the Render service can connect. Use the narrowest network access policy available for your setup.

## 2. Razorpay

Create a Razorpay account and use **Test Mode** first.

From Razorpay Dashboard, obtain:
- Key ID
- Key Secret

Set these only on the Render backend:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
HINT_PRICE_INR=49
BOOST_PRICE_INR=29
```

Never put `RAZORPAY_KEY_SECRET` in a `VITE_*` variable or commit it to GitHub.

### Premium products

**Premium Sender Hint — ₹49**
- Device type
- Browser
- Timestamp
- Location/carrier fields are deliberately not collected unless you add a compliant location provider later
- Optional Instagram username, only when the sender voluntarily enters it
- The Instagram username is self-reported and does not prove identity

**Boost Message — ₹29**
- Marks the message as boosted
- Boosted messages are sorted above normal messages in the inbox

Both are one-time payments.

## 3. Push to GitHub

Create a GitHub repository and push this project:

```bash
git init
git add .
git commit -m "Whisper premium Razorpay app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Do not commit `.env` files.

## 4. Deploy backend on Render Free

Create a **Web Service** connected to the GitHub repository.

Use:

```text
Root Directory: server
Build Command: npm install && npm run build
Start Command: npm start
```

Add environment variables:

```env
NODE_ENV=production
MONGO_URI=YOUR_MONGODB_ATLAS_URI
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
CLIENT_URL=https://YOUR-USERNAME.github.io
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
HINT_PRICE_INR=49
BOOST_PRICE_INR=29
```

Important: for a GitHub Pages project site such as:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

`CLIENT_URL` must be the **origin only**:

```text
https://YOUR-USERNAME.github.io
```

The repository path is not part of the browser Origin.

After deployment, verify:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/health
```

It should return JSON showing `ok: true` and `database: "connected"`.

## 5. Configure GitHub Pages frontend

In the GitHub repository:

**Settings → Pages → Build and deployment → Source: GitHub Actions**

Then:

**Settings → Secrets and variables → Actions → Variables**

Create these repository variables:

```text
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
VITE_SOCKET_URL=https://YOUR-RENDER-SERVICE.onrender.com
VITE_PUBLIC_APP_URL=https://YOUR-USERNAME.github.io/YOUR-REPOSITORY
```

Do not put the Razorpay secret, JWT secret, or MongoDB URI in GitHub frontend variables.

Push to `main`. The included workflow installs dependencies, builds the Vite app, creates the SPA `404.html` fallback, and deploys `client/dist` to GitHub Pages.

## 6. First production test

After both services deploy:

1. Open the GitHub Pages URL.
2. Register a test account.
3. Copy the generated anonymous link.
4. Open the link in a private/incognito window.
5. Send a message.
6. Enter an optional Instagram username if you want to test that feature.
7. Return to the dashboard.
8. Open the message.
9. Click **Unlock sender hint**.
10. Complete the Razorpay **test payment**.
11. Confirm the payment returns to the app.
12. Confirm the premium hint appears.
13. Test **Boost message** and confirm it moves above normal messages.
14. Test logout/login and confirm the session works.

## 7. Local development

Backend:

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cd client
npm install
npm run dev
```

For local frontend `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_PUBLIC_APP_URL=http://localhost:5173
VITE_BASE_PATH=/
```

## 8. Important security/privacy notes

- Razorpay payment signatures are verified on the backend using the Razorpay secret.
- Razorpay secret is never sent to the browser.
- Raw sender IP is never shown to recipients.
- The app stores a salted sender hash for abuse correlation.
- The optional Instagram username is voluntary and self-reported.
- Do not present a self-reported Instagram username as verified identity.
- The app does not automatically discover an Instagram account from a website visitor.
- Use HTTPS in production.
- For a public launch, add reporting/blocking, account recovery, stronger abuse controls, monitoring, and a production-grade distributed rate limiter.
