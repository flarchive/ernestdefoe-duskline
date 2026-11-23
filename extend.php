<?php

/*
 * This file is part of ernestdefoe/duskline.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

use ErnestDefoe\Duskline\Api;
use ErnestDefoe\Duskline\Content;
use ErnestDefoe\Duskline\Integration;
use ErnestDefoe\Duskline\Look;
use Flarum\Api\Resource\ForumResource;
use Flarum\Api\Resource\UserResource;
use Flarum\Extend;
use Illuminate\Contracts\Filesystem\Factory as Filesystem;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less')
        // html[data-duskline] + the sky from the visitor's clock, before first paint.
        ->content(Content\Stamp::class),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),

    new Extend\Locales(__DIR__.'/locale'),

    // 🚨 An absolute URL: Wardrobe serves each theme's CSS from its own path,
    // so a relative url() would 404 the fonts.
    (new Extend\Theme())
        ->addCustomLessVariable('duskline-fonts', fn () => '"'.resolve(Filesystem::class)->disk('flarum-assets')->url('extensions/ernestdefoe-duskline/fonts/').'"'),

    // The sky a member picks for their profile cover.
    (new Extend\User())
        ->registerPreference('duskSky', fn ($value) => Look::pick($value, Look::SCENES, null), null),

    (new Extend\ApiResource(ForumResource::class))
        ->fields(Api\ForumFields::class),

    (new Extend\ApiResource(UserResource::class))
        ->fields(Api\UserFields::class),

    // Only the theme switchers need server wiring; Renown, Ladder and badges
    // are read from attributes they already send.
    (new Extend\Conditional())
        ->whenExtensionEnabled('ernestdefoe-wardrobe', fn () => [
            (new Extend\ServiceProvider())->register(Integration\WardrobeProvider::class),
        ])
        ->whenExtensionEnabled('ernestdefoe-bespoke', fn () => [
            (new Extend\ServiceProvider())->register(Integration\BespokeProvider::class),
        ]),

    // 🚨 Keys written out, never read from class constants while this file loads.
    (new Extend\Settings())
        ->default('ernestdefoe-duskline.hero_mode', 'clock')
        ->default('ernestdefoe-duskline.hero_scene', 'golden')
        ->default('ernestdefoe-duskline.hero_image', '')
        ->default('ernestdefoe-duskline.hero_video', '')
        ->default('ernestdefoe-duskline.accent', 'coral')
        ->default('ernestdefoe-duskline.tag_strip', 'top')
        ->default('ernestdefoe-duskline.paint_shop', true)
        ->default('ernestdefoe-duskline.profile_sky', true)
        ->default('ernestdefoe-duskline.player_cards', true)
        ->default('ernestdefoe-duskline.radar', true)
        ->default('ernestdefoe-duskline.hud', true),
];
