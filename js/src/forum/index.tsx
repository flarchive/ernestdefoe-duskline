import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import Button from 'flarum/common/components/Button';
import type ItemList from 'flarum/common/utils/ItemList';
import type Mithril from 'mithril';
import type User from 'flarum/common/models/User';
import type Post from 'flarum/common/models/Post';
import type Tag from 'ext:flarum/tags/common/models/Tag';
import type IndexPage from 'flarum/forum/components/IndexPage';
import type CommentPost from 'flarum/forum/components/CommentPost';
import type UserCard from 'flarum/forum/components/UserCard';
import type PostsUserPage from 'flarum/forum/components/PostsUserPage';
import type TagsPage from 'ext:flarum/tags/forum/components/TagsPage';
import DuskHero from './components/DuskHero';
import Radar from './components/Radar';
import TagStrip from './components/TagStrip';
import XpPanel from './components/XpPanel';
import RankRoad from './components/RankRoad';
import HudBar from './components/HudBar';
import Sky from './components/Sky';
import PaintShopModal from './components/PaintShopModal';
import { addClass, cfg, currentScene, followClock, mergeStyle, t } from './util';
import { standing } from './renown';
import { isNew } from './tagsNew';
import { isScene } from '../common/sky';
import heroes from './heroes';

type Vnode = Mithril.Vnode<Record<string, unknown>>;
type Children = Mithril.Children;
type IndexPageLike = IndexPage;
type Card = UserCard & { attrs: { user: User; className?: string } };
type CommentPostLike = CommentPost & { attrs: { post: Post } };

app.initializers.add('ernestdefoe-duskline', () => {
  // Inert unless the server stamped this page for Duskline (Wardrobe/Bespoke may pick another theme).
  // 🚨 app.forum is not loaded yet while initializers run: every hook reads cfg() when it renders.
  if (!document.documentElement.hasAttribute('data-duskline')) return;

  heroes();

  // The clock and the phone bar start with the first page, once the forum's data is in.
  extend('flarum/common/components/Page', 'oninit', () => {
    if (!cfg()) return;
    followClock();
    mountHud();
  });

  // The index hero (tag pages keep the Tags hero).
  override('flarum/forum/components/IndexPage', 'hero', function (this: IndexPageLike, original: () => Children) {
    const c = cfg();
    if (!c || c.hero === 'off' || app.currentTag?.()) return original();
    return <DuskHero />;
  });

  // Tag tiles above the discussion list, on the unfiltered index only.
  extend('flarum/forum/components/IndexPage', 'contentItems', function (this: IndexPageLike, items: ItemList<Children>) {
    if (cfg()?.tiles !== 'top' || app.currentTag?.() || !('flarum-tags' in flarum.extensions)) return;
    if (m.route.param('q')) return;
    items.add('duskTiles', <TagStrip />, 110);
  });

  // The radar under the index navigation.
  extend('flarum/forum/components/IndexSidebar', 'items', function (items: ItemList<Children>) {
    // Index and tag lists only: the Tags page lays these items out as a row.
    if (cfg()?.radar && ['index', 'tag'].includes(app.current.get('routeName'))) items.add('duskRadar', <Radar />, -50);
  });

  // The Tags page: the same unread glow on its tiles.
  extend('ext:flarum/tags/forum/components/TagsPage', 'tagTileView', function (this: TagsPage, vdom: Vnode, tag: Tag) {
    if (vdom?.attrs && isNew(tag)) addClass(vdom.attrs, 'DuskTile--new');
  });

  // Player cards: an XP ring and level pill around each post author's avatar (Renown).
  const ring = (vdom: Vnode, user: User | null | undefined | false) => {
    const s = cfg()?.cards && standing(user);
    if (!s || !vdom?.attrs) return;
    addClass(vdom.attrs, 'DuskAvatar');
    vdom.attrs['data-level'] = s.level;
    mergeStyle(vdom.attrs, { '--dusk-xp': s.pct + '%', '--dusk-level': s.level });
  };
  extend('flarum/forum/components/CommentPost', 'avatar', function (this: CommentPostLike, vdom: Vnode) {
    ring(vdom, this.attrs.post.user());
  });
  // The XP on the whole post too: on phones core shows a second avatar in the header.
  extend('flarum/forum/components/CommentPost', 'elementAttrs', function (this: CommentPostLike, attrs: Record<string, unknown>) {
    const s = cfg()?.cards && standing(this.attrs.post.user());
    if (!s) return;
    mergeStyle(attrs, { '--dusk-xp': s.pct + '%' });
    attrs['data-dusk-level'] = s.level;
  });
  // On a profile the avatar may be the avatar editor, so it is wrapped rather than tagged.
  override('flarum/forum/components/UserCard', 'avatar', function (this: Card, original: () => Children) {
    const vdom = original();
    if (!String(this.attrs.className || '').includes('UserHero')) return vdom;
    const wrap = (<span className="DuskAvatar-wrap">{vdom}</span>) as Vnode;
    ring(wrap, this.attrs.user);
    // Its pill sits on the avatar inside (CSS), not on the wrapper.
    wrap.attrs.className = 'DuskAvatar-wrap';
    return wrap;
  });

  // Profiles: the member's sky behind the card, and XP to the next level.
  extend('flarum/forum/components/UserCard', 'view', function (this: Card, vdom: Vnode) {
    if (!String(this.attrs.className || '').includes('UserHero') || !Array.isArray(vdom?.children)) return;
    const own = this.attrs.user.attribute<string | null>('duskSky');
    addClass(vdom.attrs, 'DuskCard');
    vdom.children.unshift(<Sky uid="card" scene={cfg()?.profileSky && isScene(own) ? own : currentScene()} className="DuskSky--card" />);
  });

  extend('flarum/forum/components/UserCard', 'contentItems', function (this: Card, items: ItemList<Children>) {
    if (cfg()?.cards && standing(this.attrs.user)) items.add('duskXp', <XpPanel user={this.attrs.user} />, -20);
  });

  // The rank road above a member's posts.
  override('flarum/forum/components/PostsUserPage', 'content', function (this: PostsUserPage, original: () => Children) {
    return [this.user && cfg()?.cards && standing(this.user) ? <RankRoad user={this.user} /> : null, original()];
  });

  // The paint shop button in the header. (The modal ships in forum.js: at ~1 KB gz a lazy chunk would cost more than it saves.)
  extend('flarum/forum/components/HeaderSecondary', 'items', function (items: ItemList<Children>) {
    if (!cfg()?.paint) return;
    items.add(
      'duskPaint',
      <Button
        className="Button Button--icon Button--link DuskPaintButton"
        icon="fas fa-spray-can-sparkles"
        aria-label={String(t('paint.open'))}
        title={String(t('paint.open'))}
        onclick={() => app.modal.show(PaintShopModal)}
      />,
      15
    );
  });
});

let hud = false;

/** Mobile Tab extensions that already give the forum a bottom bar. */
const TABS = ['ernestdefoe-mobile-tab', 'acpl-mobile-tab', 'resofire-mobile-tab'];

/** The phone bar, once, unless a Mobile Tab extension already gives the forum one. */
function mountHud() {
  if (hud || !cfg()?.hud || TABS.some((id) => id in flarum.extensions)) return;
  hud = true;
  const root = document.createElement('div');
  root.className = 'DuskHud-root';
  document.body.appendChild(root);
  document.documentElement.setAttribute('data-dusk-hud', 'on');
  m.mount(root, HudBar);
}

export { default as extend } from './extend';
