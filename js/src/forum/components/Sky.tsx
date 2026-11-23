import Component from 'flarum/common/Component';
import { skySvg, type Scene } from '../../common/sky';
import { currentScene } from '../util';

// One SVG string per scene and place. Places are fixed names (hero, card), so this holds at most 5 × places.
const memo = new Map<string, string>();

/** The illustrated sky. One SVG string per scene and place, built once. */
export default class Sky extends Component<{ uid: string; scene?: Scene | null; className?: string }> {
  view() {
    const scene = this.attrs.scene || currentScene();
    const key = scene + this.attrs.uid;
    if (!memo.has(key)) memo.set(key, skySvg(scene, this.attrs.uid));

    return (
      <div className={'DuskSky ' + (this.attrs.className || '')} data-scene={scene}>
        <div key={scene} className="DuskSky-frame">
          {m.trust(memo.get(key)!)}
        </div>
      </div>
    );
  }
}
