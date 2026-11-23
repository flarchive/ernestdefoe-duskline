import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Link from 'flarum/common/components/Link';
import Icon from 'flarum/common/components/Icon';
import Avatar from 'flarum/common/components/Avatar';
import type Mithril from 'mithril';
import { startDiscussion, t } from '../util';

const item = (href: string, active: boolean, glyph: Mithril.Children, label: Mithril.Children, extra: Mithril.Children = null) => (
  <Link href={href} className={'DuskHud-item' + (active ? ' is-active' : '')}>
    {glyph}
    <span>{label}</span>
    {extra}
  </Link>
);

/** The phone's bottom bar (CSS shows it under 768px). Mounted once, outside the page. */
export default class HudBar extends Component {
  view() {
    const user = app.session.user;
    const route = app.current.get('routeName') as string | undefined;
    const unread = user?.unreadNotificationCount() || 0;
    const hidden = app.composer.isVisible() && app.composer.position !== 'minimized';

    return (
      <nav className={'DuskHud' + (hidden ? ' is-hidden' : '')} aria-label={String(t('hud.label'))}>
        {item(app.route('index'), route === 'index', <Icon name="fas fa-house" />, t('hud.home'))}
        {'flarum-tags' in flarum.extensions ? item(app.route('tags'), route === 'tags', <Icon name="fas fa-tags" />, t('hud.tags')) : null}
        <button
          type="button"
          className="DuskHud-new"
          onclick={startDiscussion}
          aria-label={String(app.translator.trans('core.forum.index.start_discussion_button'))}
        >
          <Icon name="fas fa-plus" />
        </button>
        {user
          ? item(
              app.route('notifications'),
              route === 'notifications',
              <Icon name="fas fa-bell" />,
              t('hud.alerts'),
              unread ? <span className="DuskHud-dot" aria-label={String(t('hud.unread', { count: unread }))} /> : null
            )
          : null}
        {user ? (
          item(
            app.route.user(user),
            !!route?.startsWith('user') && app.current.get('user') === user,
            <Avatar user={user} className="DuskHud-avatar" />,
            t('hud.me')
          )
        ) : (
          <button type="button" className="DuskHud-item" onclick={() => app.modal.show(() => import('flarum/forum/components/LogInModal'))}>
            <Icon name="fas fa-right-to-bracket" />
            <span>{app.translator.trans('core.forum.header.log_in_link')}</span>
          </button>
        )}
      </nav>
    );
  }
}
