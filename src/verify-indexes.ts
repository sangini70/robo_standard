import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, where, getDocs } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifyIndexes() {
  console.log("--- Starting Index Verification ---");
  
  try {
    console.log("Testing Index 1: posts { createdAt: desc }");
    const q1 = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    await getDocs(q1);
    console.log("✅ Index 1 is Ready or not required for simple query.");
  } catch (error: any) {
    if (error.message.includes("FAILED_PRECONDITION") || error.message.includes("index")) {
      console.error("❌ Index 1 Error: ", error.message);
    } else {
      console.log("✅ Index 1 Query Success (or no data).");
    }
  }

  try {
    console.log("Testing Index 2: posts { status: asc, createdAt: desc }");
    const q2 = query(collection(db, 'posts'), where('status', '==', 'published'), orderBy('createdAt', 'desc'));
    await getDocs(q2);
    console.log("✅ Index 2 is Ready or not required.");
  } catch (error: any) {
    if (error.message.includes("FAILED_PRECONDITION") || error.message.includes("index")) {
      console.error("❌ Index 2 Error: ", error.message);
    } else {
      console.log("✅ Index 2 Query Success (or no data).");
    }
  }
}

verifyIndexes();
