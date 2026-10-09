import { cleanProgress, mergeProgress } from './engine.js?v=20261009-ux2';
import { fullName } from './full-name.js?v=20261009-ux2';

const ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = '6aa55a88003959a536e9';
const PREF_KEY = 'biuretAcademyV1';
const sdk = window.Appwrite;
const client = sdk ? new sdk.Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID) : null;
const account = client ? new sdk.Account(client) : null;
const functions = client ? new sdk.Functions(client) : null;
const PROGRESS_FUNCTION_ID = '6ab8ae03001025f97f37';
let currentUser = null;

export function user() { return currentUser; }
export function available() { return Boolean(account); }

export async function loadUser() {
  if (!account) return null;
  try { currentUser = await account.get(); }
  catch (error) {
    if (error?.code !== 401) throw error;
    currentUser = null;
  }
  return currentUser;
}

export async function signIn(email, password) {
  if (!account) throw new Error('خدمة الحساب غير متاحة الآن. حدّث الصفحة وحاول مجدداً.');
  await account.createEmailPasswordSession({ email, password });
  return loadUser();
}

export async function signUp(name, email, password) {
  if (!account) throw new Error('خدمة الحساب غير متاحة الآن. حدّث الصفحة وحاول مجدداً.');
  name = fullName(name);
  if (!name) throw new Error('اكتب اسمك الحقيقي الثنائي أو الثلاثي لتظهر الشهادة باسمك.');
  await account.create({ userId: sdk.ID.unique(), email, password, name });
  await account.createEmailPasswordSession({ email, password });
  currentUser = await account.get();
  try { await account.createVerification({ url: 'https://biuret.dev/verify.html' }); }
  catch (error) { console.warn('Could not send verification email:', error); }
  return currentUser;
}

export async function updateAccountName(name) {
  if (!account || !currentUser) throw new Error('Sign in first.');
  name = fullName(name);
  if (!name) throw new Error('Enter your real first and last name, or three name parts.');
  currentUser = await account.updateName({ name });
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

async function learningExecution(input, learningState = true) {
  if (!functions || !currentUser) throw new Error('Sign in to save verified learning progress.');
  const result = await functions.createExecution({ functionId: PROGRESS_FUNCTION_ID, body: JSON.stringify(input), async: false });
  let data;
  try { data = JSON.parse(result.responseBody || '{}'); } catch { data = {}; }
  if (result.responseStatusCode < 200 || result.responseStatusCode >= 300) {
    const errorText = ['Exam changed; reload before submitting', 'Exam content changed; refresh the page before submitting'].includes(data.error)
      ? document.documentElement.lang === 'ar' ? 'تغير نموذج الامتحان. حدّث الصفحة وراجع إجاباتك قبل التسليم.' : 'The exam form changed. Reload and review your answers before submitting.'
      : data.error || 'Learning progress is temporarily unavailable.';
    const failure = new Error(errorText);
    failure.code = result.responseStatusCode;
    failure.details = data;
    throw failure;
  }
  if (learningState && (!Array.isArray(data.awards) || !Number.isSafeInteger(data.xp) || !Number.isSafeInteger(data.coins) || !Number.isSafeInteger(data.level))) {
    throw new Error('Learning progress returned an invalid response.');
  }
  return data;
}

export function loadLearningRewards() { return learningExecution({ action: 'state' }); }
export function loadMembership() { return learningExecution({ action: 'membershipState' }, false); }
export function loadBilling() { return learningExecution({ action: 'billingState' }, false); }
export function startBillingCheckout(plan) { return learningExecution({ action: 'billingCheckout', plan }, false); }
export function openBillingPortal() { return learningExecution({ action: 'billingPortal' }, false); }
export function loadProgramLibrary(language) { return learningExecution({ action: 'libraryData', language }, false); }
export function markProgramLesson(lessonId, answerIndex) { return learningExecution({ action: 'libraryMarkLesson', lessonId, answerIndex }, false); }
export function loadProgramLessonState(lessonId) { return learningExecution({ action: 'libraryLessonState', lessonId }, false); }
export function checkProgramPractice(kind, index, answers, language) { return learningExecution({ action: 'libraryPractice', kind, index, answers, language }, false); }
export function loadCourseExam(courseOrder, language) { return learningExecution({ action: 'courseExamState', courseOrder, language }, false); }
export function submitCourseExam(courseOrder, answers, formId) { return learningExecution({ action: 'courseSubmitExam', courseOrder, answers, formId }, false); }
export function loadPractical(pathId, language) { return learningExecution({ action: 'practicalState', pathId, language }, false); }
export function loadSocInvestigation(language) { return learningExecution({ action: 'socCase', language }, false); }
export function checkSocFindings(caseId, version, findings, language) { return learningExecution({ action: 'socCheck', caseId, version, findings, language }, false); }
export function submitPractical(pathId, answers) { return learningExecution({ action: 'submitPractical', pathId, answers }, false); }
export function loadReportReview(pathId) { return learningExecution({ action: 'reportState', pathId }, false); }
export function submitReportReview(pathId, fields, language, baseRevision, consent) { return learningExecution({ action: 'reportSubmit', pathId, fields, language, baseRevision, consent }, false); }
export function adminReportQueue(cursor) { return learningExecution({ action: 'adminReportQueue', cursor }, false); }
export function adminReportDetail(reportId) { return learningExecution({ action: 'adminReportDetail', reportId }, false); }
export function adminReviewReport(reportId, decision, scores, feedback) { return learningExecution({ action: 'adminReportReview', reportId, decision, scores, feedback }, false); }
export function loadPathExam(pathId, language) { return learningExecution({ action: 'pathExamState', pathId, language }, false); }
export function submitPathExam(pathId, answers, formId) { return learningExecution({ action: 'pathSubmitExam', pathId, answers, formId }, false); }
export function loadPathCredential(pathId) { return learningExecution({ action: 'pathCredential', pathId }, false); }
export function sharePathCredential(pathId, enabled) { return learningExecution({ action: 'pathShareCredential', pathId, enabled }, false); }
export function awardLesson(lessonId, answerIndex) { return learningExecution({ action: 'completeLesson', lessonId, answerIndex }); }
export function loadExam() { return learningExecution({ action: 'examState' }, false); }
export function submitExam(answers, formId) { return learningExecution({ action: 'submitExam', answers, formId }, false); }
export function loadCredential() { return learningExecution({ action: 'credential' }, false); }
export function shareCredential(enabled) { return learningExecution({ action: 'shareCredential', enabled }, false); }
export function correctCredentialName() { return learningExecution({ action: 'correctCredentialName' }, false); }
export function correctPathCredentialName(pathId) { return learningExecution({ action: 'pathCorrectCredentialName', pathId }, false); }
export function academyAdminStatus() { return learningExecution({ action: 'adminStatus' }, false); }
export function academyAdminCredential(credentialId) { return learningExecution({ action: 'adminCredential', credentialId }, false); }
export function academyAdminRevoke(credentialId, reason) { return learningExecution({ action: 'adminRevokeCredential', credentialId, reason }, false); }

export function cloudProgress() {
  return cleanProgress(currentUser?.prefs?.[PREF_KEY]);
}

export async function saveCloudProgress(localProgress) {
  if (!account || !currentUser) return localProgress;
  const fresh = await account.get();
  if (fresh.$id !== currentUser.$id) throw new Error('تغيّر الحساب النشط. أعد تحميل الصفحة قبل مزامنة التقدّم.');
  const merged = mergeProgress(localProgress, fresh.prefs?.[PREF_KEY]);
  const prefs = { ...fresh.prefs, [PREF_KEY]: merged };
  if (new TextEncoder().encode(JSON.stringify(prefs)).length > 64000) {
    throw new Error('مساحة تفضيلات الحساب ممتلئة. تقدّمك محفوظ على هذا الجهاز.');
  }
  currentUser = await account.updatePrefs({ prefs });
  return merged;
}
