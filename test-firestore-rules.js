// Simple test to check if Firestore rules allow operations
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAT7UdPXg6ACCoHGFEOTmzw7BEBI06Z2JI",
  authDomain: "momocoins-1c768.firebaseapp.com",
  projectId: "momocoins-1c768",
  storageBucket: "momocoins-1c768.firebasestorage.app",
  messagingSenderId: "951460304576",
  appId: "1:951460304576:web:007ecc916f8614f6b8ff25",
  measurementId: "G-TVD9WLW7PG"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Test if we can read from Firestore
async function testFirestoreAccess() {
  try {
    console.log('Testing Firestore access...')
    
    // Try to read a user document (this should work if rules are updated)
    const testDoc = await getDoc(doc(db, 'users', 'test'))
    console.log('✅ Firestore read access: SUCCESS')
    console.log('Rules appear to be updated correctly')
    
    return true
  } catch (error) {
    console.log('❌ Firestore access failed:', error.message)
    console.log('Rules may not be updated yet')
    return false
  }
}

testFirestoreAccess()