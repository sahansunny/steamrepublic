# Steam Republic - MomoWallet

A gamified loyalty program for your momo stall with digital rewards, built with React + TypeScript + Firebase.

## 🚀 Features

- **User Authentication**: Signup/Login with mobile number and email
- **Firebase Integration**: Real-time data sync across devices
- **MomoWallet**: Digital wallet for customers to track coins
- **Purchase Code System**: Secure coin redemption with unique codes
- **Loyalty Levels**: Citizen → Minister of Momos → President of Steam Republic
- **Rewards System**: Redeem coins for free food and exclusive items
- **Secret Menu**: Unlock special items with coins
- **Leaderboard**: Weekly competition among customers
- **Admin Panel**: Easy coin management and code generation for staff

## 🛠️ Tech Stack

- React 18
- TypeScript
- Vite
- Firebase (Firestore + Auth)
- CSS Modules

## 📋 Prerequisites

- Node.js 16+ installed
- Firebase account (free tier is sufficient)

## 🔧 Installation

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Setup Firebase

Follow the detailed guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

Quick steps:
1. Create Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Copy your Firebase config
4. Update `src/firebase.ts` with your config
5. Set Firestore security rules

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173

### 4. Build for Production

```bash
npm run build
```

## 📱 How to Use

### For Customers:

1. **First Time**: Sign up with name, mobile, and email
2. **Returning**: Login with mobile number
3. **After Purchase**: Click "Claim MomoCoins" and enter the code from staff
4. **View Rewards**: Check balance, history, and leaderboard

### For Staff:

1. **Generate Codes**: Click ⚙️ → Code Generator → Generate 20 codes
2. **After Sale**: Give customer one code
3. **Manual Add**: Use Admin Panel to add coins directly (for special cases)

## 🎟️ Coin Structure

| Purchase | Coins | Code Value |
|----------|-------|------------|
| 1 plate  | 5     | 5          |
| 2 plates | 10    | 10         |
| 3 plates | 15    | 15         |
| 5 plates | 25    | 25         |

## 🏆 Rewards

- 50 coins = Free plate of momos
- 100 coins = Secret menu unlock
- 200 coins = Premium combo (Minister level)
- 500 coins = Golden Momo Box
- 1000 coins = President of Steam Republic

## 🔒 Security Features

✅ Each code works only once
✅ Maximum 3 claims per customer per day
✅ Firebase authentication
✅ Secure data storage
✅ Real-time validation

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy!

### Deploy to Netlify

1. Run `npm run build`
2. Drag `dist` folder to [netlify.com/drop](https://app.netlify.com/drop)

### Update Firebase Authorized Domains

After deployment:
1. Go to Firebase Console → Authentication → Settings
2. Add your deployed domain to authorized domains

## 📊 Database Structure

```
Firestore:
  users/
    └── USER{mobile}/
        ├── name, mobile, email
        ├── coins, visits, streak
        └── history/
            └── transactions

  purchaseCodes/
    └── {code}/
        ├── coins, used
        └── usedBy, usedAt
```

## 🖨️ QR Code Setup

1. Deploy your app
2. Get your URL: `https://your-app.vercel.app`
3. Generate QR at [qr-code-generator.com](https://www.qr-code-generator.com/)
4. Print and display at stall

## 💰 Cost Breakdown

- Firebase: FREE (50k reads/day, 20k writes/day)
- Hosting: FREE (Vercel/Netlify)
- Domain (optional): ₹500-1000/year
- **Total: ₹0 to start!**

## 🆘 Troubleshooting

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed troubleshooting.

Common issues:
- **Firebase not configured**: Update `src/firebase.ts`
- **Permission denied**: Check Firestore security rules
- **User not found**: Verify user was created in Firestore

## 📈 Growth Ideas

1. **Weekend Bonus**: Generate higher value codes on weekends
2. **Referral Program**: Give bonus coins for bringing friends
3. **Golden Momo Event**: Random high-value codes for lucky customers
4. **Social Media**: Bonus coins for Instagram stories

## 🎉 Launch Checklist

- [ ] Setup Firebase project
- [ ] Update firebase config
- [ ] Deploy to Vercel/Netlify
- [ ] Generate QR code
- [ ] Print QR poster
- [ ] Generate 50 purchase codes
- [ ] Train staff
- [ ] Test with first customer
- [ ] Promote on social media

## 📞 Support

For issues or questions, check:
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase configuration
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Purchase code system guide

## 📄 License

MIT License - Feel free to use for your business!

---

Built with ❤️ for Steam Republic
