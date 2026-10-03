const paths = {
  foundations: { ar: 'أساسيات الأمن السيبراني', en: 'Cybersecurity Foundations', courses: 3, lessons: 9,
    topics: { ar: 'سلامة الروابط · الهوية والصلاحيات · الأدلة والاستجابة', en: 'URL safety · Identity and access · Evidence and response' } },
  path_pentest: { ar: 'اختبار الاختراق', en: 'Penetration testing', topics: { ar: 'منهجية الاختبار · أمن الويب · إعداد التقارير', en: 'Testing methodology · Web security · Reporting' } },
  path_soc: { ar: 'تحليل SOC', en: 'SOC analysis', topics: { ar: 'السجلات · الكشف · الاستجابة للحوادث', en: 'Logs · Detection · Incident response' } },
  path_dfir: { ar: 'التحقيق الجنائي الرقمي', en: 'Digital forensics', topics: { ar: 'جمع الأدلة · تحليل الآثار · التحقيق', en: 'Evidence collection · Artifact analysis · Investigation' } },
  path_cloud: { ar: 'أمن السحابة', en: 'Cloud security', topics: { ar: 'الهوية · الإعداد الآمن · المراقبة', en: 'Identity · Secure configuration · Monitoring' } },
  path_grc: { ar: 'الحوكمة والمخاطر والامتثال', en: 'Governance, risk and compliance', topics: { ar: 'الحوكمة · تقييم المخاطر · الامتثال', en: 'Governance · Risk assessment · Compliance' } },
};
const labels = {
  ar: { title: 'شهادة إنجاز', awarded: 'مُنحت إلى', course: 'مسار التعلم', topics: 'المحاور', courses: 'الكورسات', lessons: 'الدروس', score: 'نتيجة الامتحان', issued: 'تاريخ الإصدار', issuer: 'الجهة المصدرة', verify: 'تحقق من الحالة عبر الرابط', status: 'اجتاز المتعلم امتحان المسار بعد إكمال متطلباته الموثقة.' },
  en: { title: 'Certificate of Achievement', awarded: 'Awarded to', course: 'Learning path', topics: 'Topics', courses: 'Courses', lessons: 'Lessons', score: 'Exam score', issued: 'Issued', issuer: 'Issued by', verify: 'Verify current status at', status: 'The learner passed the path exam after completing its verified requirements.' },
};
export function validCredentialRecord(data) {
  if (!data || typeof data !== 'object') return false;
  if (data.pathId === 'foundations') return ['foundations-v1', 'foundations-v2'].includes(data.version);
  return ['program-path-v1', 'program-path-v2'].includes(data.version) &&
    ['path_pentest', 'path_soc', 'path_dfir', 'path_cloud', 'path_grc'].includes(data.pathId);
}
export function credentialFacts(data, language = 'en') {
  const lang = language === 'ar' ? 'ar' : 'en';
  const path = paths[data.pathId] || paths.foundations;
  const details = data.practicalScore === 3 ? { ...labels[lang], status: data.pathId === 'foundations'
    ? (lang === 'ar' ? 'أكمل المتعلم الدروس الموثقة، واجتاز 3 مهام عملية وامتحان المسار.' : 'The learner completed verified lessons, passed 3 practical tasks and the path exam.')
    : (lang === 'ar' ? 'أكمل المتعلم الدروس وامتحانات الدورات المطلوبة، واجتاز 3 مهام عملية وامتحان المسار.' : 'The learner completed coursework and course exams, passed 3 practical tasks and the path exam.') } : labels[lang];
  return { lang, labels: details, title: path[lang], topics: path.topics[lang], courses: data.courseCount ?? path.courses ?? null,
    lessons: data.lessonCount ?? path.lessons ?? null, score: Number.isInteger(data.score) ? `${data.score} / ${data.total || 10}` : null,
    issued: new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(data.issuedAt)),
    verifyUrl: `https://academy.biuret.dev/certificate.html?id=${encodeURIComponent(data.id)}` };
}

function line(ctx, text, x, y, maxWidth, lineHeight, align = 'left') {
  ctx.textAlign = align;
  const words = String(text).split(/\s+/);
  let current = '', offset = 0;
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) { ctx.fillText(current, x, y + offset); offset += lineHeight; current = word; }
    else current = next;
  }
  if (current) ctx.fillText(current, x, y + offset);
  return offset + lineHeight;
}

function makeCanvas(data, language) {
  const f = credentialFacts(data, language);
  const canvas = document.createElement('canvas'); canvas.width = 1800; canvas.height = 1260;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0c1212'; ctx.fillRect(0, 0, 1800, 1260);
  const glow = ctx.createRadialGradient(1500, 80, 50, 1450, 80, 720);
  glow.addColorStop(0, '#243a1a'); glow.addColorStop(1, '#0c1212'); ctx.fillStyle = glow; ctx.fillRect(0, 0, 1800, 900);
  ctx.strokeStyle = '#b9ed38'; ctx.lineWidth = 4; ctx.strokeRect(38, 38, 1724, 1184);
  ctx.strokeStyle = '#526d35'; ctx.lineWidth = 1; ctx.strokeRect(58, 58, 1684, 1144);
  const rtl = f.lang === 'ar'; const x = rtl ? 1640 : 160; const align = rtl ? 'right' : 'left';
  ctx.direction = rtl ? 'rtl' : 'ltr';
  ctx.fillStyle = '#c9ff39'; ctx.font = 'bold 28px Arial, sans-serif'; ctx.textAlign = align; ctx.fillText('BIURET / ACADEMY', x, 150);
  ctx.fillStyle = '#f4f7f2'; ctx.font = 'bold 72px Arial, sans-serif'; line(ctx, f.labels.title, x, 270, 1480, 85, align);
  ctx.fillStyle = '#a7b6a9'; ctx.font = '27px Arial, sans-serif'; ctx.fillText(f.labels.awarded, x, 355);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 68px Arial, sans-serif'; line(ctx, data.holderName, x, 440, 1450, 80, align);
  ctx.strokeStyle = '#b9ed38'; ctx.beginPath(); ctx.moveTo(160, 500); ctx.lineTo(1640, 500); ctx.stroke();
  const detail = (label, value, y) => { ctx.fillStyle = '#9cad9d'; ctx.font = '25px Arial, sans-serif'; ctx.fillText(label, x, y); ctx.fillStyle = '#f2f6ed'; ctx.font = 'bold 31px Arial, sans-serif'; line(ctx, value, x, y + 44, 1450, 40, align); };
  detail(f.labels.course, f.title, 575);
  detail(f.labels.topics, f.topics, 700);
  const metrics = [`${f.labels.courses}: ${f.courses ?? '—'}`, `${f.labels.lessons}: ${f.lessons ?? '—'}`, `${f.labels.score}: ${f.score ?? '—'}`];
  ctx.fillStyle = '#c9ff39'; ctx.font = 'bold 30px Arial, sans-serif'; ctx.fillText(metrics.join('     ·     '), x, 855);
  ctx.fillStyle = '#b8c5b6'; ctx.font = '25px Arial, sans-serif'; line(ctx, f.labels.status, x, 925, 1450, 36, align);
  ctx.strokeStyle = '#526d35'; ctx.beginPath(); ctx.moveTo(160, 1000); ctx.lineTo(1640, 1000); ctx.stroke();
  ctx.fillStyle = '#eff5ea'; ctx.font = '24px Arial, sans-serif'; ctx.fillText(`${f.labels.issued}: ${f.issued}   ·   ${f.labels.issuer}: Biuret Academy`, x, 1060);
  ctx.direction = 'ltr'; ctx.textAlign = 'left'; ctx.fillStyle = '#abc38f'; ctx.font = '20px Arial, sans-serif'; ctx.fillText(`${f.labels.verify}: ${f.verifyUrl}`, 160, 1130);
  ctx.fillText(data.id, 160, 1170);
  return canvas;
}

function pdfFromJpeg(dataUrl, width, height) {
  const jpeg = Uint8Array.from(atob(dataUrl.split(',')[1]), (char) => char.charCodeAt(0));
  const encoder = new TextEncoder(); const chunks = []; const offsets = [0]; let length = 0;
  const add = (bytes) => { chunks.push(bytes); length += bytes.length; };
  const str = (value) => add(encoder.encode(value));
  const obj = (id, body) => { offsets[id] = length; str(`${id} 0 obj\n${body}\nendobj\n`); };
  str('%PDF-1.4\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 900 630] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4] = length; str(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`); add(jpeg); str('\nendstream\nendobj\n');
  const drawing = 'q 900 0 0 630 0 0 cm /Im0 Do Q';
  obj(5, `<< /Length ${drawing.length} >>\nstream\n${drawing}\nendstream`);
  const start = length; str('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) str(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  str(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`);
  return new Blob(chunks, { type: 'application/pdf' });
}

export async function downloadCredential(data, language, format) {
  if (data.status !== 'active' || !['png', 'jpeg', 'pdf'].includes(format)) throw new Error('Credential unavailable');
  await document.fonts?.ready;
  const canvas = makeCanvas(data, language);
  const blob = format === 'pdf' ? pdfFromJpeg(canvas.toDataURL('image/jpeg', .94), canvas.width, canvas.height)
    : await new Promise((resolve) => canvas.toBlob(resolve, `image/${format}`, .96));
  if (!blob) throw new Error('Download could not be created');
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = `Biuret-Academy-${data.id}.${format === 'jpeg' ? 'jpg' : format}`;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
}
