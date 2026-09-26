import { cleanProgress, mergeProgress } from './engine.js';

const ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = '6aa55a88003959a536e9';
const PREF_KEY = 'biuretAcademyV1';
const sdk = window.Appwrite;
const account = sdk ? new sdk.Account(new sdk.Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID)) : null;
let currentUser = null;

export function user() { return currentUser; }
export function available() { return Boolean(account); }

export async function loadUser() {
  if (!account) return null;
  try { currentUser = await account.get(); }
  catch { currentUser = null; }
  return currentUser;
}

export async function signIn(email, password) {
  if (!account) throw new Error('خدمة الحساب غير متاحة الآن. حدّث الصفحة وحاول مجدداً.');
  await account.createEmailPasswordSession({ email, password });
  return loadUser();
}

export async function signUp(name, email, password) {
  if (!account) throw new Error('خدمة الحساب غير متاحة الآن. حدّث الصفحة وحاول مجدداً.');
  await account.create({ userId: sdk.ID.unique(), email, password, name });
  await account.createEmailPasswordSession({ email, password });
  currentUser = await account.get();
  try { await account.createVerification({ url: 'https://biuret.dev/verify.html' }); }
  catch (error) { console.warn('Could not send verification email:', error); }
  return currentUser;
}

export function signInWithProvider(provider) {
  if (!account) throw new Error('خدمة الحساب غير متاحة الآن. حدّث الصفحة وحاول مجدداً.');
  if (!['google', 'github'].includes(provider)) throw new Error('مزود تسجيل غير معروف.');
  const success = new URL(window.location.href);
  success.searchParams.delete('auth_error');
  const failure = new URL(window.location.href);
  failure.searchParams.set('auth_error', '1');
  return account.createOAuth2Session({ provider, success: success.href, failure: failure.href });
}

export async function signOut() {
  if (!account) return;
  await account.deleteSession({ sessionId: 'current' });
  currentUser = null;
}

export function cloudProgress() {
  return cleanProgress(currentUser?.prefs?.[PREF_KEY]);
}

export async function saveCloudProgress(localProgress) {
  if (!account || !currentUser) return localProgress;
  const fresh = await account.get();
  const merged = mergeProgress(localProgress, fresh.prefs?.[PREF_KEY]);
  const prefs = { ...fresh.prefs, [PREF_KEY]: merged };
  if (new TextEncoder().encode(JSON.stringify(prefs)).length > 64000) {
    throw new Error('مساحة تفضيلات الحساب ممتلئة. تقدّمك محفوظ على هذا الجهاز.');
  }
  currentUser = await account.updatePrefs({ prefs });
  return merged;
}
