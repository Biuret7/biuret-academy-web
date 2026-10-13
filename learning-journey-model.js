const openAccess = new Set(['free', 'owned', 'existing', 'admin']);

// UI milestones describe verified state; they never grant access or completion.
export function pathJourney({ path, access, pending = false, failed = false, signedIn = false, admin = false, completed = null, status = null, foundationNext = null }) {
  const total = path.courses.reduce((sum, course) => sum + course.lessonIds.length, 0);
  const bypass = admin && !path.free;
  const known = Number.isInteger(completed) && completed >= 0 && !bypass;
  const lessons = known ? Math.min(total, completed) : null;
  const coursesDone = path.free || !admin && status?.completedCourses === path.courses.length;
  const passed = status?.passed === true;
  const practical = status?.practicalPassed === true;
  const learned = !bypass && (passed || lessons === total && coursesDone);
  const current = passed ? 'certificate' : practical ? 'exam' : learned ? 'practical' : 'learn';
  const steps = ['learn', 'practical', 'exam', 'certificate'].map(id => ({ id,
    state: id === 'learn' && learned || id === 'practical' && practical || id === 'exam' && passed ? 'complete'
      : id === current ? 'current' : 'upcoming' }));
  let action = null, reason = null;
  if (pending) reason = 'loading';
  else if (failed) reason = 'error';
  else if (!signedIn) reason = 'signin';
  else if (!openAccess.has(access)) reason = access === 'foundations' ? 'foundations' : 'access';
  else if (!path.free && !status) reason = 'loading';
  else {
    const href = current === 'certificate' ? path.certificate : current === 'exam' ? path.exam : current === 'practical' ? path.practical
      : path.free ? foundationNext?.href : '#path-course';
    if (href) action = { kind: current, href };
  }
  return { total, lessons, current, steps, action, reason, admin: bypass, coursesDone };
}

export function lessonContinuation({ complete, ready, nextHref, courseHref, checkpointId }) {
  if (complete === true) return { kind: 'next', href: nextHref || courseHref };
  if (ready === false) return { kind: 'previous', href: courseHref };
  return { kind: 'checkpoint', href: `#${checkpointId}`, verified: false };
}
