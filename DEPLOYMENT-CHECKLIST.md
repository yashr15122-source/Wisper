# Production deployment checklist

## MongoDB Atlas
- [ ] Cluster created
- [ ] Database user created
- [ ] `MONGO_URI` copied to Render
- [ ] Network access configured

## Razorpay
- [ ] Test Mode enabled for first deployment
- [ ] `RAZORPAY_KEY_ID` set on Render
- [ ] `RAZORPAY_KEY_SECRET` set on Render
- [ ] Hint and boost prices configured

## Render
- [ ] Root directory: `server`
- [ ] Build: `npm install && npm run build`
- [ ] Start: `npm start`
- [ ] `CLIENT_URL` is the GitHub Pages origin only
- [ ] `/api/health` reports database connected

## GitHub Pages
- [ ] Pages source is GitHub Actions
- [ ] `VITE_API_URL` points to Render `/api`
- [ ] `VITE_SOCKET_URL` points to Render root
- [ ] `VITE_PUBLIC_APP_URL` includes the GitHub repository path
- [ ] Workflow ran successfully

## Smoke test
- [ ] Register
- [ ] Login
- [ ] Copy public link
- [ ] Anonymous send
- [ ] Optional Instagram username
- [ ] Live inbox update
- [ ] Premium hint test payment
- [ ] Premium hint retrieval
- [ ] Boost test payment
- [ ] Boosted message sorting
- [ ] Favorite/delete
- [ ] Share to story
- [ ] Logout/login
