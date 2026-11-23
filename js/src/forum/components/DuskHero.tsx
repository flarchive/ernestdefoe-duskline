import app from 'flarum/forum/app';
import Component from 'flarum/common/Component';
import Button from 'flarum/common/components/Button';
import Icon from 'flarum/common/components/Icon';
import Sky from './Sky';
import { cfg, currentScene, motionOk, saveData, startDiscussion, t } from '../util';

/**
 * The index hero: the sky (or the admin's picture or video), the welcome text and
 * Start a discussion. With a title it is the compact header of another page.
 */
export default class DuskHero extends Component<{ compact?: boolean; title?: string; message?: string }> {
  view() {
    const own = typeof this.attrs.title === 'string';
    const c = cfg()!;
    const scene = currentScene();
    const video = c.hero === 'video' && c.video && motionOk() && !saveData();
    let media;
    if (c.hero === 'image' && c.image) media = <img className="DuskHero-media" src={c.image} alt="" />;
    else if (video)
      media = <video className="DuskHero-media" src={c.video} poster={c.image || undefined} autoplay muted loop playsinline aria-hidden="true" />;
    else if (c.hero === 'video' && c.image) media = <img className="DuskHero-media" src={c.image} alt="" />;
    else media = <Sky uid="hero" />;

    const canStart = !own && (!app.session.user || app.forum.attribute('canStartDiscussion'));

    return (
      <header className={'Hero DuskHero' + (this.attrs.compact ? ' DuskHero--compact' : '')}>
        {media}
        <div className="DuskHero-shade" />
        <div className="container DuskHero-content">
          {c.hero === 'clock' && !own ? (
            <span className="DuskHero-chip">
              <Icon name="far fa-clock" />
              {t(`scene.${scene}`)}
            </span>
          ) : null}
          <h1 className="DuskHero-title">{own ? this.attrs.title : app.forum.attribute('welcomeTitle')}</h1>
          <div className="DuskHero-message">{own ? this.attrs.message : m.trust(app.forum.attribute<string>('welcomeMessage') || '')}</div>
          {canStart ? (
            <div className="DuskHero-actions">
              <Button className="Button Button--primary DuskHero-start" icon="fas fa-plus" onclick={startDiscussion}>
                {app.translator.trans('core.forum.index.start_discussion_button')}
              </Button>
            </div>
          ) : null}
        </div>
      </header>
    );
  }
}
