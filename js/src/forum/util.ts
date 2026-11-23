import app from 'flarum/forum/app';
import extractText from 'flarum/common/utils/extractText';
import { isScene, sceneAt, type Scene } from '../common/sky';

export type RadarUser = { id: number; username: string; slug: string; displayName: string; avatarUrl: string | null };

export type Config = {
  hero: 'clock' | 'fixed' | 'image' | 'video' | 'off';
  scene: Scene;
  image: string;
  video: string;
  tiles: 'top' | 'off';
  paint: boolean;
  profileSky: boolean;
  cards: boolean;
  hud: boolean;
  radar: { count: number; users: RadarUser[] } | null;
};

export type DevicePrefs = { accent?: string; sky?: string; density?: string; motion?: string };

export const html = document.documentElement;

type Attrs = Record<string, unknown>;

/** Add a class to a vnode's attrs (hooks that decorate another component's element). */
export const addClass = (attrs: Attrs, name: string) => {
  attrs.className = ((attrs.className as string) || '') + ' ' + name;
};

/** Merge inline style values into a vnode's attrs. */
export const mergeStyle = (attrs: Attrs, style: Record<string, string | number>) => {
  attrs.style = { ...((attrs.style as object) || {}), ...style };
};

/** The admin's choices; null when this visitor is on another theme (Wardrobe/Bespoke). */
export const cfg = (): Config | null => (html.hasAttribute('data-duskline') && app.forum?.attribute<Config>('duskline')) || null;

/** A translated string as plain text (also safe in attributes: no array joined with commas). */
export const t = (key: string, params: Record<string, unknown> = {}): string =>
  extractText(app.translator.trans(`ernestdefoe-duskline.forum.${key}`, params));

export const motionOk = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !html.hasAttribute('data-dusk-motion');

export const saveData = () => !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

export const device = {
  get(): DevicePrefs {
    try {
      return JSON.parse(localStorage.getItem('duskline') || '{}') || {};
    } catch {
      return {};
    }
  },
  set(prefs: DevicePrefs) {
    try {
      localStorage.setItem('duskline', JSON.stringify(prefs));
    } catch {
      // Private mode: the choice lasts for this page only.
    }
  },
};

/** The sky on screen now (the head script set it before paint). */
export const currentScene = (): Scene => {
  const value = html.getAttribute('data-dusk-sky');
  return isScene(value) ? value : sceneAt();
};

let clock: number | undefined;

/** Follow the visitor's clock: re-check every 5 minutes and when the tab comes back. */
export function followClock() {
  if (clock) return;
  const tick = () => {
    const c = cfg();
    if (!c || c.hero === 'fixed' || isScene(device.get().sky)) return;
    const scene = sceneAt();
    if (scene !== currentScene()) {
      html.setAttribute('data-dusk-sky', scene);
      m.redraw();
    }
  };
  clock = window.setInterval(tick, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', () => document.hidden || tick());
}

/** Start a discussion the way the index sidebar does (so other extensions' hooks still run). */
export function startDiscussion() {
  if (app.session.user) {
    app.composer.load(() => import('flarum/forum/components/DiscussionComposer'), { user: app.session.user }).then(() => app.composer.show());
  } else {
    app.modal.show(() => import('flarum/forum/components/LogInModal'));
  }
}
