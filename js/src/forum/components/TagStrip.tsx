import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Link from 'flarum/common/components/Link';
import Icon from 'flarum/common/components/Icon';
import type Tag from 'ext:flarum/tags/common/models/Tag';
import { isNew } from '../tagsNew';
import { t } from '../util';

/** Tiles in the strip: one row on desktop (the grid has four columns). */
const TILES = 4;

/** The first primary tags above the discussion list, glowing when something new was posted. */
export default class TagStrip extends Component {
  view() {
    const tags = app.store
      .all<Tag>('tags')
      .filter((tag) => tag.position() !== null && !tag.isChild() && !tag.isHidden())
      .sort((a, b) => (a.position() ?? 0) - (b.position() ?? 0))
      .slice(0, TILES);
    if (!tags.length) return null;

    return (
      <nav className="DuskStrip" aria-label={String(t('tiles.label'))}>
        {tags.map((tag) => {
          const fresh = isNew(tag);
          return (
            <Link
              className={'DuskTile' + (fresh ? ' DuskTile--new' : '')}
              href={app.route('tag', { tags: tag.slug() })}
              style={{ '--tag-color': tag.color() || 'var(--primary-color)' }}
            >
              <span className="DuskTile-icon">{tag.icon() ? <Icon name={tag.icon()} /> : <Icon name="fas fa-hashtag" />}</span>
              <span className="DuskTile-name">{tag.name()}</span>
              {fresh ? <span className="DuskTile-new">{t('tiles.new')}</span> : null}
              <span className="DuskTile-count">{t('tiles.discussions', { count: tag.discussionCount() || 0 })}</span>
            </Link>
          );
        })}
      </nav>
    );
  }
}
