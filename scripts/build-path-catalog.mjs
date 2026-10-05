import { writeFileSync } from 'node:fs';
import { libraryData } from '../functions/academy-progress/src/library.js';
import { specializations } from '../journey.js';
import { courses, learningPath } from '../learning-content.js';
import { labs } from '../labs.js';
import { challenges } from '../content.js';
import { englishChallenges } from '../content-en.js';

// Export a strict metadata allowlist, never lesson bodies, questions or answers.
const libraries = { ar: libraryData('ar'), en: libraryData('en') };
const local = (select) => ({ ar: select(libraries.ar), en: select(libraries.en) });
const related = {
  path_pentest: { quizzes: [1, 2, 8, 9], labs: [0, 2, 5], challenges: [0, 2, 3, 5, 7] },
  path_soc: { quizzes: [1, 3, 6], labs: [1, 7], challenges: [1, 4, 6] },
  path_dfir: { quizzes: [6, 10], labs: [6, 7], challenges: [6, 9] },
  path_cloud: { quizzes: [11, 1], labs: [1, 7], challenges: [10] },
  path_grc: { quizzes: [0, 7], labs: [7], challenges: [], coreChallenges: ['f-permissions', 'f-sender'] },
  path_appsec: { quizzes: [8, 9], labs: [2, 5], challenges: [2, 3] },
  path_mobile: { quizzes: [9], labs: [2], challenges: [12] },
  path_threat_intel: { quizzes: [6], labs: [6, 7], challenges: [8, 6] },
  path_malware: { quizzes: [8, 10], labs: [6], challenges: [9, 11] },
};
const operationMap = {foundations:[0],path_pentest:[2,1],path_soc:[0,3,4,5],path_dfir:[0,3],path_cloud:[1,5],path_grc:[4,1],path_appsec:[2,5],path_mobile:[1,2],path_threat_intel:[5,0],path_malware:[0,3,5]};
const operation = index => ({id: libraries.ar.operations[index].id,index,title:local(x=>x.operations[index].title),href:`operation.html?id=${index}`});
const course = (order) => {
  const item = libraries.en.categories.find(c => c.order === order);
  return { id: item.id, title: local(x => x.categories.find(c => c.order === order).title),
    summary: local(x => x.categories.find(c => c.order === order).description),
    lessonIds: item.lessons.map(l => l.id), order, href: `library-course.html?id=${item.id}` };
};
const resource = (kind, index) => ({ id: `${kind}-${index}`, index,
  title: local(x => x[{ quiz: 'quizzes', lab: 'labs', challenge: 'challenges' }[kind]][index].name),
  href: `practice-${kind}.html?id=${index}` });
const coreChallenge = (id) => ({ id, title: { ar: challenges.find(c => c.id === id).title, en: englishChallenges[id].title }, href: `challenges.html?challenge=${id}`, core: true });
const paths = [{ id: 'foundations', title: learningPath.title, summary: learningPath.summary, free: true, icon: 'shield',
  outcomes: { ar: ['تحليل الروابط والتحويلات', 'حماية الهوية والصلاحيات', 'حفظ الأدلة واتخاذ قرار أمني'], en: ['Analyze URLs and redirects', 'Protect identity and permissions', 'Preserve evidence and make security decisions'] },
  courses: courses.map(c => ({ id: c.id, title: c.title, summary: c.summary, lessonIds: c.lessonIds, href: `course.html?id=${c.id}` })),
  quizzes: [resource('quiz', 0)], labs: labs.map(l => ({ id: l.id, title: l.title, href: `lab.html?id=${l.id}`, core: true })),
  challenges: challenges.filter(c => c.track === 'foundations').map(c => coreChallenge(c.id)),
  operations: operationMap.foundations.map(operation), practical: 'practical.html?id=foundations', exam: 'exam.html', certificate: 'certificate.html',
}];
for (const item of libraries.ar.roadmapPaths) {
  const id = item[2], overview = specializations.find(p => p.pathId === id), mapping = related[id];
  if (!overview || !mapping) throw new Error(`Path metadata missing for ${id}`);
  paths.push({ id, title: overview.title, summary: overview.summary, free: false,
    icon: { path_pentest: 'pentest', path_soc: 'soc', path_dfir: 'dfir', path_cloud: 'cloud', path_grc: 'grc', path_appsec: 'appsec', path_mobile: 'mobile', path_threat_intel: 'intel', path_malware: 'malware' }[id],
    outcomes: { ar: overview.topics.map(x => x.ar), en: overview.topics.map(x => x.en) },
    courses: item[6].map(course), optionalCourses: id === 'path_soc' ? [course(17)] : [], quizzes: mapping.quizzes.map(i => resource('quiz', i)),
    labs: mapping.labs.map(i => resource('lab', i)),
    challenges: [...mapping.challenges.map(i => resource('challenge', i)), ...(mapping.coreChallenges || []).map(coreChallenge)],
    operations: operationMap[id].map(operation), practical: `practical.html?id=${id}`, exam: `path-exam.html?id=${id}`, certificate: `path-exam.html?id=${id}`,
  });
}
writeFileSync(new URL('../path-catalog-data.js', import.meta.url), `// Generated public path metadata; no assessment questions or answers.\nexport const academyPaths = ${JSON.stringify(paths, null, 2)};\n`);
console.log(`Published metadata for ${paths.length} unified paths.`);
