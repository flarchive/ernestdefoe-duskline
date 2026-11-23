import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import Avatar from 'flarum/common/components/Avatar';
import Link from 'flarum/common/components/Link';
import type ItemList from 'flarum/common/utils/ItemList';
import type Mithril from 'mithril';
import type Discussion from 'flarum/common/models/Discussion';
import type DiscussionHero from 'flarum/forum/components/DiscussionHero';
import type Tag from 'ext:flarum/tags/common/models/Tag';
import type TagHero from 'ext:flarum/tags/forum/components/TagHero';
import type TagsPage from 'ext:flarum/tags/forum/components/TagsPage';
import Sky from './components/Sky';
import DuskHero from './components/DuskHero';
import { addClass, cfg, mergeStyle, t } from './util';

type Children = Mithril.Children;
type Vnode = Mithril.Vnode<Record<string, unknown>>;
type DiscussionHeroLike = DiscussionHero & { attrs: { discussion: Discussion } };
type TagHeroLike = TagHero & { attrs: { model: Tag } };

/** A discussion's first tag that has a color: its glow. */
const tagColor = (discussion: Discussion): string | null => {
  const tags = (discussion.tags?.() || []) as Tag[];
  return tags.find((tag) => tag?.color?.())?.color() || null;
};

/** Sky + glow behind a core hero; the glow takes the tag's color, else the accent. */
function skyBehind(vdom: Vnode, glow: string | null) {
  if (!vdom?.attrs) return;
  addClass(vdom.attrs, 'DuskSkyHero');
  mergeStyle(vdom.attrs, { '--dusk-glow': glow || 'var(--dusk-accent)' });
}

const skyItems = (items: ItemList<Children>) => {
  items.add('duskSky', <Sky uid="hero" className="DuskSky--hero" />, 200);
  items.add('duskGlow', <div className="DuskSkyHero-glow" aria-hidden="true" />, 190);
};

/** Author, replies and, for members, how far they have read. */
function discussionMeta(discussion: Discussion): Children {
  const author = discussion.user();
  const posts = (discussion.lastPostNumber() ?? discussion.commentCount()) || 1;
  const read = app.session.user ? Math.min(discussion.lastReadPostNumber() || 0, posts) : 0;
  const pct = Math.round((read / posts) * 100);

  return (
    <div className="DuskSkyHero-meta">
      {author ? (
        <Link className="DuskSkyHero-author" href={app.route.user(author)}>
          <Avatar user={author} />
          <span>{t('hero.by', { name: author.displayName() })}</span>
        </Link>
      ) : null}
      <span className="DuskSkyHero-stat">{t('hero.replies', { count: discussion.replyCount() || 0 })}</span>
      {app.session.user ? (
        <span className="DuskSkyHero-progress" title={String(t('hero.read', { read, total: posts }))}>
          <span className="DuskSkyHero-progressBar" style={{ width: pct + '%' }} />
          <span className="DuskSkyHero-progressText">{t('hero.read', { read, total: posts })}</span>
        </span>
      ) : null}
    </div>
  );
}

export default function heroes() {
  // The discussion hero.
  extend('flarum/forum/components/DiscussionHero', 'view', function (this: DiscussionHeroLike, vdom: JSX.Element | null) {
    if (cfg()?.hero !== 'off') skyBehind(vdom as Vnode, tagColor(this.attrs.discussion));
  });
  extend('flarum/forum/components/DiscussionHero', 'viewItems', function (items: ItemList<Children>) {
    if (cfg()?.hero !== 'off') skyItems(items);
  });
  extend('flarum/forum/components/DiscussionHero', 'items', function (this: DiscussionHeroLike, items: ItemList<Children>) {
    if (cfg()?.hero !== 'off') items.add('duskMeta', discussionMeta(this.attrs.discussion), -20);
  });

  // A tag's page.
  extend('ext:flarum/tags/forum/components/TagHero', 'view', function (this: TagHeroLike, vdom: JSX.Element | null) {
    if (cfg()?.hero !== 'off') skyBehind(vdom as Vnode, this.attrs.model?.color?.() || null);
  });
  extend('ext:flarum/tags/forum/components/TagHero', 'viewItems', function (items: ItemList<Children>) {
    if (cfg()?.hero !== 'off') skyItems(items);
  });

  // The Tags page: a compact sky header instead of the welcome banner.
  override('ext:flarum/tags/forum/components/TagsPage', 'hero', function (this: TagsPage, original: () => Children) {
    if (!cfg() || cfg()!.hero === 'off') return original();
    const count = app.store.all<Tag>('tags').filter((tag) => !tag.isHidden()).length;
    return <DuskHero compact title={String(t('hero.tags_title'))} message={String(t('hero.tags_count', { count }))} />;
  });
}
