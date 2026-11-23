import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Link from 'flarum/common/components/Link';
import type User from 'flarum/common/models/User';
import { RANKS, rankName, rankStart, standing } from '../renown';
import { t } from '../util';

/** Stops shown on the road: the current rank with up to three either side. */
const STOPS = 7;

/** Renown's ranks as a road, above a member's posts. */
export default class RankRoad extends Component<{ user: User }> {
  view() {
    const user = this.attrs.user;
    const s = standing(user);
    if (!s) return null;
    const first = Math.max(1, Math.min(s.rank - 3, RANKS - STOPS + 1));
    const ranks = Array.from({ length: STOPS }, (_, i) => first + i);
    const done = ranks.indexOf(s.rank);
    let renownHref: string | null = null;
    try {
      renownHref = app.route('user.renown', { username: user.slug() });
    } catch {
      renownHref = null; // A Renown without its profile tab.
    }

    return (
      <section className="DuskRoad">
        <div className="DuskRoad-head">
          <h3 className="DuskRoad-title">{t('road.title')}</h3>
          <span className="DuskRoad-note">
            {s.rank < RANKS ? t('road.to_next', { count: rankStart(s.rank + 1) - s.level, rank: rankName(s.rank + 1) }) : t('road.top')}
          </span>
          {renownHref ? (
            <Link className="DuskRoad-all" href={renownHref}>
              {t('road.all')}
            </Link>
          ) : null}
        </div>
        <ol className="DuskRoad-track" style={{ '--done': done / (STOPS - 1) }}>
          {ranks.map((rank) => (
            <li
              className={'DuskRoad-stop' + (rank < s.rank ? ' is-done' : rank === s.rank ? ' is-current' : '')}
              aria-current={rank === s.rank ? 'step' : undefined}
            >
              <i aria-hidden="true" />
              <span>{rankName(rank)}</span>
            </li>
          ))}
        </ol>
      </section>
    );
  }
}
