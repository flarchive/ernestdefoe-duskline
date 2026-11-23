import app from 'flarum/forum/app';
import Modal from 'flarum/common/components/Modal';
import { sceneAt } from '../../common/sky';
import { ACCENTS, SCENES, type Scene } from '../../common/look';
import { cfg, device, html, t, type DevicePrefs } from '../util';

type Choice = { value: string; label: string; swatch?: string };

/**
 * The paint shop: this device's accent, sky, density and motion (saved in
 * the browser, applied before paint on the next load), and for members the
 * sky on their profile (saved to their account, seen by everyone).
 */
export default class PaintShopModal extends Modal {
  prefs: DevicePrefs = device.get();
  saving = false;

  className() {
    return 'DuskPaint Modal--small';
  }

  title() {
    return t('paint.title');
  }

  content() {
    const user = app.session.user;
    const profileSky = cfg()?.profileSky && user;

    return (
      <div className="Modal-body">
        {this.group(
          'accent',
          ACCENTS.map((a) => ({ value: a, label: String(t(`paint.accent.${a}`)), swatch: a })),
          this.prefs.accent || html.getAttribute('data-dusk-accent') || 'coral'
        )}
        {this.group(
          'sky',
          [{ value: 'clock', label: String(t('paint.sky.clock')) }, ...SCENES.map((s) => ({ value: s, label: String(t(`scene.${s}`)) }))],
          this.prefs.sky || 'clock'
        )}
        {profileSky
          ? this.group(
              'profile',
              [{ value: 'clock', label: String(t('paint.profile.visitor')) }, ...SCENES.map((s) => ({ value: s, label: String(t(`scene.${s}`)) }))],
              String(user!.preferences()?.duskSky || 'clock')
            )
          : null}
        {this.group(
          'density',
          ['comfortable', 'compact'].map((d) => ({ value: d, label: String(t(`paint.density.${d}`)) })),
          this.prefs.density || 'comfortable'
        )}
        {this.group(
          'motion',
          ['full', 'reduced', 'off'].map((d) => ({ value: d, label: String(t(`paint.motion.${d}`)) })),
          this.prefs.motion || 'full'
        )}
        <p className="DuskPaint-note">{t('paint.note')}</p>
      </div>
    );
  }

  group(name: string, choices: Choice[], current: string) {
    return (
      <fieldset className={`DuskPaint-group DuskPaint-group--${name}`}>
        <legend>{t(`paint.${name}.label`)}</legend>
        <div className="DuskPaint-choices">
          {choices.map((c) => (
            <button
              type="button"
              className={'DuskPaint-choice' + (c.value === current ? ' is-on' : '')}
              aria-pressed={c.value === current ? 'true' : 'false'}
              data-swatch={c.swatch}
              disabled={this.saving && name === 'profile'}
              onclick={() => this.pick(name, c.value)}
            >
              {c.swatch ? <span className="DuskPaint-swatch" aria-hidden="true" /> : null}
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>
    );
  }

  pick(name: string, value: string) {
    if (name === 'profile') {
      this.saving = true;
      app.session.user!.savePreferences({ duskSky: value === 'clock' ? null : value }).finally(() => {
        this.saving = false;
        m.redraw();
      });
      return;
    }

    const prefs = { ...this.prefs, [name]: value };
    if (name === 'sky' && value === 'clock') delete prefs.sky;
    this.prefs = prefs;
    device.set(prefs);

    // Apply now, the way the head script will on the next load.
    if (name === 'accent') html.setAttribute('data-dusk-accent', value);
    if (name === 'density') value === 'compact' ? html.setAttribute('data-dusk-density', 'compact') : html.removeAttribute('data-dusk-density');
    if (name === 'motion') value === 'full' ? html.removeAttribute('data-dusk-motion') : html.setAttribute('data-dusk-motion', value);
    if (name === 'sky') {
      const fixed = cfg()?.hero === 'fixed' ? cfg()!.scene : null;
      html.setAttribute('data-dusk-sky', value === 'clock' ? fixed || sceneAt() : (value as Scene));
    }
  }
}
