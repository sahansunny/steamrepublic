import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import twilio from 'twilio';

admin.initializeApp();

const twilioClient = twilio(
  functions.config().twilio.account_sid,
  functions.config().twilio.auth_token
);

const TWILIO_WHATSAPP_NUMBER = functions.config().twilio.whatsapp_number;

// Send WhatsApp message helper
async function sendWhatsAppMessage(mobile: string, message: string) {
  try {
    await twilioClient.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:+91${mobile}`,
      body: message
    });
    console.log(`WhatsApp sent to ${mobile}`);
    return true;
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return false;
  }
}

// Trigger: Send promo code when generated
export const sendPromoCodeOnGeneration = functions.firestore
  .document('purchaseCodes/{codeId}')
  .onCreate(async (snap, context) => {
    const codeData = snap.data();
    const code = codeData.code;
    const coins = codeData.coins;

    // If code has a mobile number assigned, send immediately
    if (codeData.mobile) {
      const message = `🥟 *Steam Republic*\n\nYour MomoCoins Code: *${code}*\nValue: ${coins} coins\n\nOpen your MomoWallet app and claim now!\n\nThank you for your purchase! 🎉`;
      
      await sendWhatsAppMessage(codeData.mobile, message);
    }
  });

// Trigger: Send welcome message on signup
export const sendWelcomeMessage = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const mobile = userData.mobile;
    const name = userData.name;

    const message = `🥟 Welcome to Steam Republic, ${name}!\n\nYour MomoWallet is ready!\n\n✨ Earn coins with every purchase\n🎁 Redeem for free momos\n🔓 Unlock secret menu items\n👑 Compete for President title\n\nStart collecting coins today!`;

    await sendWhatsAppMessage(mobile, message);
  });

// Trigger: Send notification when coins are claimed
export const notifyCoinsAdded = functions.firestore
  .document('users/{userId}/history/{historyId}')
  .onCreate(async (snap, context) => {
    const historyData = snap.data();
    const userId = context.params.userId;

    // Skip init document
    if (!historyData.coins) return;

    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    const userData = userDoc.data();

    if (!userData) return;

    const mobile = userData.mobile;
    const name = userData.name;
    const totalCoins = userData.coins;
    const addedCoins = historyData.coins;
    const reason = historyData.reason;

    const message = `🥟 *MomoWallet Update*\n\nHi ${name}!\n\n+${addedCoins} coins added\nReason: ${reason}\n\nTotal Balance: ${totalCoins} coins\n\nKeep collecting! 🎉`;

    await sendWhatsAppMessage(mobile, message);
  });

// Manual function: Send bulk promotional messages
export const sendBulkPromotion = functions.https.onCall(async (data, context) => {
  // Check if admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { message, targetUsers } = data;

  const usersSnapshot = await admin.firestore().collection('users').get();
  const results = [];

  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    
    // Filter by target if specified
    if (targetUsers && !targetUsers.includes(doc.id)) continue;

    const sent = await sendWhatsAppMessage(userData.mobile, message);
    results.push({ userId: doc.id, sent });
  }

  return { success: true, results };
});

// HTTP endpoint: Generate code with mobile number
export const generateCodeWithMobile = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    const { mobile, coins } = req.body;

    if (!mobile || !coins) {
      res.status(400).json({ error: 'Mobile and coins required' });
      return;
    }

    // Generate code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Save to Firestore with mobile
    await admin.firestore().collection('purchaseCodes').doc(code).set({
      code,
      coins: parseInt(coins),
      mobile,
      used: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // WhatsApp will be sent by onCreate trigger

    res.json({ success: true, code });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate code' });
  }
});
