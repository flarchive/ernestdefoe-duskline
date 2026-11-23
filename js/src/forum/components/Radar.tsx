import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Link from 'flarum/common/components/Link';
import stringToColor from 'flarum/common/utils/stringToColor';
import { cfg, t } from '../util';

// Where the dots sit (percent of the scope), spread over both rings. One spot per dot (Radar::DOTS).
const SPOTS = [
  [62, 14],
  [24, 28],
  [74, 56],
  [36, 70],
  [14, 54],
  [50, 40],
  [82, 32],
  [58, 80],
  [28, 84],
  [44, 22],
  [86, 70],
  [70, 90],
];

/** Who is online: a count for everyone, faces for visitors allowed to list members. */
export default class Radar extends Component {
  view() {
    const radar = cfg()?.radar;
    if (!radar) return null;
    const shown = radar.users.slice(0, SPOTS.length);
    const more = radar.count - shown.length;

    // No faces to place (nobody here, or a visitor who may not see who): a calm one-line version.
    if (!shown.length) {
      return (
        <div className="DuskRadar DuskRadar--quiet">
          <span className="DuskRadar-mini" aria-hidden="true" />
          <div>
            <span className="DuskRadar-title">{t('radar.title')}</span>
            <span className="DuskRadar-note">{radar.count ? t('radar.label', { count: radar.count }) : t('radar.empty')}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="DuskRadar">
        <div className="DuskRadar-head">
          <span className="DuskRadar-title">{t('radar.title')}</span>
          <span className="DuskRadar-count">{t('radar.count', { count: radar.count })}</span>
        </div>
        <div className="DuskRadar-scope" role="img" aria-label={String(t('radar.label', { count: radar.count }))}>
          <span className="DuskRadar-sweep" />
          {shown.map((u, i) => (
            <Link
              className="DuskRadar-dot"
              href={app.route('user', { username: u.slug })}
              title={u.displayName}
              style={{ left: SPOTS[i][0] + '%', top: SPOTS[i][1] + '%', '--dot': '#' + stringToColor(u.username) }}
            >
              {u.avatarUrl ? (
                <img src={u.avatarUrl} alt={u.displayName} loading="lazy" />
              ) : (
                <span aria-hidden="true">{u.displayName.charAt(0).toUpperCase()}</span>
              )}
            </Link>
          ))}
          {more > 0 && shown.length ? <span className="DuskRadar-more">+{more}</span> : null}
        </div>
      </div>
    );
  }
}
