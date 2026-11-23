import app from 'flarum/admin/app';
import Extend from 'flarum/common/extenders';
import { ACCENTS, SCENES } from '../common/look';

const t = (key: string) => app.translator.trans(`ernestdefoe-duskline.admin.${key}`);
const scenes = () => Object.fromEntries(SCENES.map((s) => [s, t(`scene.${s}`)]));

export default [
  new Extend.Admin()
    .setting(() => ({
      setting: 'ernestdefoe-duskline.hero_mode',
      type: 'select',
      label: t('hero_mode.label'),
      help: t('hero_mode.help'),
      options: {
        clock: t('hero_mode.clock'),
        fixed: t('hero_mode.fixed'),
        image: t('hero_mode.image'),
        video: t('hero_mode.video'),
        off: t('hero_mode.off'),
      },
    }))
    .setting(() => ({
      setting: 'ernestdefoe-duskline.hero_scene',
      type: 'select',
      label: t('hero_scene.label'),
      options: scenes(),
    }))
    .setting(() => ({
      setting: 'ernestdefoe-duskline.hero_image',
      type: 'url',
      label: t('hero_image.label'),
      help: t('hero_image.help'),
      placeholder: 'https://',
    }))
    .setting(() => ({
      setting: 'ernestdefoe-duskline.hero_video',
      type: 'url',
      label: t('hero_video.label'),
      help: t('hero_video.help'),
      placeholder: 'https://',
    }))
    .setting(() => ({
      setting: 'ernestdefoe-duskline.accent',
      type: 'select',
      label: t('accent.label'),
      help: t('accent.help'),
      options: Object.fromEntries(ACCENTS.map((a) => [a, t(`accent.${a}`)])),
    }))
    .setting(() => ({
      setting: 'ernestdefoe-duskline.tag_strip',
      type: 'select',
      label: t('tag_strip.label'),
      options: { top: t('tag_strip.top'), off: t('tag_strip.off') },
    }))
    .setting(() => ({ setting: 'ernestdefoe-duskline.radar', type: 'boolean', label: t('radar.label'), help: t('radar.help') }))
    .setting(() => ({ setting: 'ernestdefoe-duskline.player_cards', type: 'boolean', label: t('player_cards.label'), help: t('player_cards.help') }))
    .setting(() => ({ setting: 'ernestdefoe-duskline.paint_shop', type: 'boolean', label: t('paint_shop.label'), help: t('paint_shop.help') }))
    .setting(() => ({ setting: 'ernestdefoe-duskline.profile_sky', type: 'boolean', label: t('profile_sky.label'), help: t('profile_sky.help') }))
    .setting(() => ({ setting: 'ernestdefoe-duskline.hud', type: 'boolean', label: t('hud.label'), help: t('hud.help') })),
];
