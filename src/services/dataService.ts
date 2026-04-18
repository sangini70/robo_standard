import { collection, getDocs, doc, getDoc, query, where, orderBy, QueryConstraint } from 'firebase/firestore';
import { db } from '../firebase';
import { PostSummary, MarketSignal } from '../types';

// Simple In-Memory Cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Record<string, CacheEntry<any>> = {};
const CACHE_DURATION = 60 * 1000; // 60 seconds

async function fetchWithCache<T>(key: string, fetcher: () => Promise<T>, forceRefresh = false): Promise<T> {
  const now = Date.now();
  if (!forceRefresh && cache[key] && (now - cache[key].timestamp < CACHE_DURATION)) {
    console.log(`[Cache Hit] ${key}`);
    return cache[key].data;
  }

  try {
    const data = await fetcher();
    cache[key] = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error(`[Fetch Error] ${key}:`, error);
    throw error;
  }
}

export async function getPosts(filters?: { hub?: string; step?: number }): Promise<PostSummary[]> {
  const key = `posts-${filters?.hub || 'all'}-${filters?.step || 'all'}`;
  
  return fetchWithCache(key, async () => {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    
    if (filters?.hub) {
      constraints.push(where('hub', '==', filters.hub));
    }
    if (filters?.step) {
      constraints.push(where('flowStep', '==', filters.step));
    }

    const q = query(collection(db, 'posts'), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ slug: d.id, ...d.data() } as PostSummary));
  });
}

export async function getPostDetail(slug: string): Promise<any> {
  const key = `post-detail-${slug}`;
  return fetchWithCache(key, async () => {
    const ref = doc(db, 'posts', slug);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Post not found');
    return { slug: snap.id, ...snap.data() };
  });
}

export async function getSignals(): Promise<MarketSignal[]> {
  const key = 'signals';
  return fetchWithCache(key, async () => {
    const q = query(collection(db, 'signals'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as MarketSignal);
  });
}

export function clearCache(key?: string) {
  if (key) {
    delete cache[key];
  } else {
    Object.keys(cache).forEach(k => delete cache[k]);
  }
}
