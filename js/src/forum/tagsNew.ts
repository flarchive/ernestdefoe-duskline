import app from 'flarum/forum/app';
import type Tag from 'ext:flarum/tags/common/models/Tag';

/*
 * "New since your last visit", with no query: a visit ends after 30 quiet
 * minutes, and a tag is new when something was posted in it after the visit
 * before this one (and after the member last marked everything read).
 */
let since: number | null = null;

function lastVisit(): number {
  if (since !== null) return since;
  const now = Date.now();
  let seen = { prev: now, last: now };
  try {
    const stored = JSON.parse(localStorage.getItem('duskline-visit') || 'null');
    if (stored && typeof stored.last === 'number') seen = { prev: now - stored.last > 30 * 60 * 1000 ? stored.last : stored.prev, last: now };
    localStorage.setItem('duskline-visit', JSON.stringify(seen));
  } catch {
    // No storage: nothing is marked new.
  }
  return (since = seen.prev);
}

export function isNew(tag: Tag): boolean {
  const posted = tag.lastPostedAt();
  if (!posted) return false;
  const read = app.session.user?.markedAllAsReadAt?.();
  return posted.getTime() > Math.max(lastVisit(), read ? read.getTime() : 0);
}
