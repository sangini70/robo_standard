
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { MarketSignal } from '../types';
import { clearCache } from './dataService';

// 관리자 허용 목록 (UID 또는 이메일)
const ADMIN_UIDS = [
  "O8T7pyXh5Mfd5wx7fqJdkfqTzw1"
];

const ADMIN_EMAILS = [
  "luganopizza@gmail.com"
];

// 간단한 세션 관리 (브라우저 메모리에 저장)
let isPasswordVerified = false;

export async function checkAuth(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    console.log("🔐 Auth Check: No current user");
    return false;
  }
  
  const userEmail = user.email ? user.email.toLowerCase().trim() : null;
  const userUid = user.uid;
  
  const isAllowedEmail = userEmail && ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(userEmail);
  const isAllowedUid = ADMIN_UIDS.includes(userUid);
  
  console.log("🔐 ADMIN ALLOWLIST CHECK:", {
    compareEmail: userEmail,
    compareUid: userUid,
    isAllowedEmail,
    isAllowedUid,
    allowedEmailsList: ADMIN_EMAILS,
    allowedUidsList: ADMIN_UIDS,
    isPasswordVerified
  });
  
  const isAllowed = !!(isAllowedEmail || isAllowedUid);
  
  // 구글 로그인 성공 + 비밀번호 검증 성공 시에만 true
  return isAllowed && isPasswordVerified;
}

const SECURITY_DOC_PATH = 'settings/security';

export async function loginWithPassword(password: string): Promise<boolean> {
  try {
    const secRef = doc(db, 'settings', 'security');
    const snap = await getDoc(secRef);
    
    let adminPassword = '';
    
    if (!snap.exists()) {
      // 초기화: 데이터가 없으면 admin123으로 생성
      adminPassword = 'admin123';
      await setDoc(secRef, { adminPassword });
    } else {
      adminPassword = snap.data().adminPassword;
    }
    
    if (password === adminPassword) {
      isPasswordVerified = true;
      return true;
    }
    return false;
  } catch (error) {
    console.error("Login verification failed:", error);
    throw new Error("Security verification failed. Please check your credentials or network.");
  }
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const secRef = doc(db, 'settings', 'security');
    const snap = await getDoc(secRef);
    
    if (!snap.exists()) {
      return { success: false, message: "Security configuration not found." };
    }
    
    const actualPassword = snap.data().adminPassword;
    if (currentPassword !== actualPassword) {
      return { success: false, message: "Current password does not match." };
    }
    
    await setDoc(secRef, { adminPassword: newPassword }, { merge: true });
    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    console.error("Password update failed:", error);
    return { success: false, message: "Failed to update security document. Insufficient permissions or network error." };
  }
}

export async function logout(): Promise<void> {
  await auth.signOut();
  isPasswordVerified = false;
}

// Stats & Indexing
export async function getDashboardStats() {
  const statsSnap = await getDocs(collection(db, 'stats'));
  const indexingSnap = await getDocs(collection(db, 'indexing_status'));
  
  return {
    stats: statsSnap.docs.map(d => ({ slug: d.id, ...d.data() } as any)),
    indexing: indexingSnap.docs.map(d => ({ slug: d.id, ...d.data() } as any))
  };
}

export async function updateIndexingStatus(slug: string, platform: 'google' | 'naver', status: string): Promise<boolean> {
  const field = platform === 'google' ? 'google_status' : 'naver_status';
  const ref = doc(db, 'indexing_status', slug);
  await setDoc(ref, {
    slug,
    [field]: status,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  return true;
}

// Signals
export async function fetchSignals(): Promise<MarketSignal[]> {
  const q = query(collection(db, 'signals'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as MarketSignal);
}

export async function saveSignals(signals: MarketSignal[]): Promise<boolean> {
  for (const signal of signals) {
    await setDoc(doc(db, 'signals', signal.id), signal);
  }
  clearCache('signals');
  return true;
}

// Posts
export async function fetchAdminPosts(): Promise<any[]> {
  const snap = await getDocs(collection(db, 'posts'));
  return snap.docs.map(d => d.data());
}

export async function saveAdminPost(post: any): Promise<boolean> {
  await setDoc(doc(db, 'posts', post.slug), {
    ...post,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  
  // Invalidate cache: 목록 전체 및 해당 상세 페이지
  clearCache(); 
  return true;
}

export async function deleteAdminPost(slug: string): Promise<boolean> {
  await deleteDoc(doc(db, 'posts', slug));
  clearCache();
  return true;
}

// Publish (Client-side, usually refers to refreshing cache)
export async function publishStaticContent(): Promise<{ success: boolean; message: string }> {
  return { success: true, message: "Content updated in database." };
}

export async function backupDatabase(): Promise<boolean> {
  console.log("Backup logic would go here if needed as download.");
  return true;
}
