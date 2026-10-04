// Same private account preference used by the portfolio. Never load arbitrary URLs.
export const validProfilePhoto = value => typeof value === 'string' && value.length <= 24000 && /^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]+={0,2}$/.test(value);
export function renderAvatar(element, account) {
  if (!element) return;
  const initials = (account?.name || 'Biuret').trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  element.textContent = initials;
  const photo = account?.prefs?.biuretProfilePhoto;
  if (!validProfilePhoto(photo)) return;
  const image = document.createElement('img'); image.alt = ''; image.src = photo;
  image.addEventListener('error', () => { element.textContent = initials; }, { once: true });
  element.replaceChildren(image);
}
