// Public navigation only. Learning access and awards remain server controlled.
import { academyPaths } from './path-catalog-data.js?v=20261011-ctf1';
export const workspaces = Object.freeze(Object.assign(Object.create(null), {
  learn: { title: ['التعلّم', 'Learning'], tabs: [['paths', 'المسارات', 'Paths'], ['courses', 'الدورات', 'Courses'], ['free-studio', 'تعمّق في الأساسيات', 'Foundations practice'], ['search', 'البحث في الدروس', 'Find lessons']] },
  practice: { title: ['التدريب', 'Practice'], tabs: [['labs', 'المختبرات', 'Labs'], ['quizzes', 'الكويزات', 'Quizzes'], ['challenges', 'التحديات', 'Challenges'], ['operations', 'غرف العمليات', 'Operations rooms']] },
  resources: { title: ['الموارد', 'Resources'], tabs: [['tools', 'الأدوات', 'Tools'], ['certifications', 'الشهادات المهنية', 'Professional certifications'], ['professional', 'الاستعداد المهني', 'Career preparation']] },
  notebook: { title: ['دفتر التعلّم', 'Learning notebook'], tabs: [['notes', 'ملاحظاتي', 'My notes'], ['favorites', 'المفضلة', 'Saved lessons'], ['review', 'المراجعة', 'Review']] },
  account: { title: ['حسابك', 'Your account'], tabs: [['profile', 'الملف الشخصي', 'Profile'], ['progress', 'تقدّمك', 'Progress'], ['certificate', 'شهادة الأساسيات', 'Foundations credential'], ['membership', 'الوصول', 'Access'], ['settings', 'الإعدادات', 'Settings']] },
}));
export const destinations = Object.freeze(Object.assign(Object.create(null), {
  paths: 'learn', path: 'learn', courses: 'learn', course: 'learn', lesson: 'learn', 'library-course': 'learn', 'library-lesson': 'learn', 'free-studio': 'learn', search: 'learn', exam: 'learn', 'path-exam': 'learn', 'course-exam': 'learn', practical: 'learn',
  labs: 'practice', lab: 'practice', 'practice-lab': 'practice', quizzes: 'practice', 'practice-quiz': 'practice', challenges: 'practice', 'practice-challenge': 'practice', operations: 'practice', operation: 'practice', 'soc-investigation': 'practice',
  tools: 'resources', certifications: 'resources', professional: 'resources', notes: 'notebook', favorites: 'notebook', review: 'notebook', profile: 'account', progress: 'account', certificate: 'account', membership: 'account', settings: 'account',
}));
const idPattern = /^[a-z0-9_-]{1,120}$/i;
const queryKeys = ['id', 'challenge', 'track', 'category', 'q', 'auth_error'];
const nameOf = url => url.pathname.split('/').pop().replace(/\.html$/, '');
export function isPublicCredential(url) { return nameOf(url) === 'certificate' && /^c_[a-f0-9]{32}$/.test(url.searchParams.get('id') || ''); }
export function destinationWorkspace(screen) { return destinations[screen] || null; }
export function parseWorkspace(input, base = 'https://academy.biuret.dev/') {
  const url = new URL(input, base), workspace = nameOf(url);
  if (!workspaces[workspace]) return null;
  let screen = url.searchParams.get('screen');
  const path = idPattern.test(url.searchParams.get('path') || '') ? url.searchParams.get('path') : '';
  if (!destinations[screen]) screen = workspace === 'learn' && path ? 'path' : workspaces[workspace].tabs[0][0];
  // Learning may contain related practice and assessments while retaining its path.
  if (destinations[screen] !== workspace && !(workspace === 'learn' && path && ['learn', 'practice', 'resources', 'account'].includes(destinations[screen]))) screen = workspaces[workspace].tabs[0][0];
  const params = new URLSearchParams();
  for (const key of queryKeys) { const value = url.searchParams.get(key); if (value && value.length <= 300) params.set(key, value); }
  if (screen === 'path' && path) params.set('id', path);
  const hash = url.hash.length <= 180 ? url.hash : '';
  return { workspace, screen, path, child: `${screen}.html${params.size ? '?' + params : ''}${hash}` };
}
export function workspaceHref(input, context = {}, base = 'https://academy.biuret.dev/') {
  let url, origin;
  try { url = new URL(input, base); origin = new URL(base).origin; } catch { return null; }
  if (url.origin !== origin || !['http:', 'https:'].includes(url.protocol) || !/^\/[a-z-]+\.html$/.test(url.pathname) || isPublicCredential(url)) return null;
  const screen = nameOf(url);
  if (workspaces[screen]) return `${url.pathname.slice(1)}${url.search}${url.hash}`;
  let workspace = destinations[screen];
  if (!workspace) return null;
  let path = idPattern.test(context.path || '') ? context.path : '';
  if (!path && workspace === 'learn') {
    const id = url.searchParams.get('id');
    const matches = academyPaths.filter(p => p.courses.some(course => ['course', 'library-course', 'course-exam'].includes(screen) ? course.id === id : ['lesson', 'library-lesson'].includes(screen) && course.lessonIds.includes(id)));
    if (matches.length === 1) path = matches[0].id;
    if (screen === 'free-studio') path = 'foundations';
  }
  if (screen === 'path' || screen === 'path-exam' || screen === 'practical') path = idPattern.test(url.searchParams.get('id') || '') ? url.searchParams.get('id') : '';
  if (screen === 'exam') path = 'foundations';
  if (screen === 'paths') path = '';
  if (context.workspace === 'learn' && path) workspace = 'learn';
  const params = new URLSearchParams({ screen });
  if (workspace === 'learn' && path) params.set('path', path);
  for (const key of queryKeys) { const value = url.searchParams.get(key); if (value && value.length <= 300) params.set(key, value); }
  return `${workspace}.html?${params}${url.hash.length <= 180 ? url.hash : ''}`;
}
export function primarySection(page) { return workspaces[page] ? page : destinations[page] || (page === 'home' ? 'index' : page === 'ctf' ? 'ctf' : null); }
export function activeTab(screen) {
  return ({ path: 'paths', course: 'courses', lesson: 'courses', 'library-course': 'courses', 'library-lesson': 'courses', lab: 'labs', 'practice-lab': 'labs', 'soc-investigation': 'labs', 'practice-quiz': 'quizzes', 'practice-challenge': 'challenges', operation: 'operations' })[screen] || screen;
}
