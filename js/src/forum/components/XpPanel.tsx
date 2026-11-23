import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import type User from 'flarum/common/models/User';
import { rankName, standing } from '../renown';
import { t } from '../util';

/** Progress to the next Renown level (only with Renown). */
export default class XpPanel extends Component<{ user: User }> {
  view() {
    const s = standing(this.attrs.user);
    if (!s) return null;
    const fmt = (n: number) => n.toLocaleString(app.translator.getLocale() || undefined);

    return (
      <div className="DuskXp">
        <div className="DuskXp-row">
          <span className="DuskXp-label">{s.step ? t('xp.next', { level: s.level + 1 }) : t('xp.max')}</span>
          <span className="DuskXp-value">{s.step ? t('xp.progress', { into: fmt(s.into), step: fmt(s.step) }) : rankName(s.rank)}</span>
        </div>
        <div className="DuskXp-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.pct} aria-label={String(t('xp.label'))}>
          <span style={{ width: s.pct + '%' }} />
        </div>
      </div>
    );
  }
}
