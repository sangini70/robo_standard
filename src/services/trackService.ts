
import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const TRACK_DELAY = 12 * 60 * 60 * 1000; // 12 hours

function shouldTrack(slug: string, type: 'view' | 'click' | 'impression'): boolean {
  const key = `track_${type}_${slug}`;
  const lastTracked = localStorage.getItem(key);
  if (!lastTracked) return true;
  
  return Date.now() - Number(lastTracked) > TRACK_DELAY;
}

function markTracked(slug: string, type: 'view' | 'click' | 'impression') {
  const key = `track_${type}_${slug}`;
  localStorage.setItem(key, Date.now().toString());
}

async function updateStats(slug: string, field: 'views' | 'clicks' | 'impressions') {
  const statRef = doc(db, 'stats', slug);
  await setDoc(statRef, {
    slug,
    [field]: increment(1),
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function trackView(slug: string) {
  if (!shouldTrack(slug, 'view')) return;
  try {
    await updateStats(slug, 'views');
    markTracked(slug, 'view');
  } catch (err) {
    console.error('Track view failed', err);
  }
}

export async function trackClick(slug: string) {
  if (!shouldTrack(slug, 'click')) return;
  try {
    await updateStats(slug, 'clicks');
    markTracked(slug, 'click');
  } catch (err) {
    console.error('Track click failed', err);
  }
}

export async function trackImpression(slug: string) {
  if (!shouldTrack(slug, 'impression')) return;
  try {
    await updateStats(slug, 'impressions');
    markTracked(slug, 'impression');
  } catch (err) {
    console.error('Track impression failed', err);
  }
}
