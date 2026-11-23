<?php

/*
 * This file is part of ernestdefoe/duskline.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Duskline\Api;

use ErnestDefoe\Duskline\ActiveTheme;
use ErnestDefoe\Duskline\Look;
use ErnestDefoe\Duskline\Radar;
use Flarum\Api\Context;
use Flarum\Api\Schema;

/**
 * What the forum JS needs: the admin's choices and the radar. Nothing is
 * computed for visitors on another theme.
 */
class ForumFields
{
    public function __construct(protected ActiveTheme $theme, protected Look $look, protected Radar $radar)
    {
    }

    public function __invoke(): array
    {
        return [
            Schema\Arr::make('duskline')
                ->get(fn ($forum, Context $context) => $this->theme->for($context->request) ? [
                    'hero' => $this->look->heroMode(),
                    'scene' => $this->look->fixedScene(),
                    'image' => $this->look->url('hero_image'),
                    'video' => $this->look->url('hero_video'),
                    'tiles' => Look::pick($this->look->get('tag_strip'), ['top', 'off'], 'top'),
                    'paint' => $this->look->on('paint_shop'),
                    'profileSky' => $this->look->on('profile_sky'),
                    'cards' => $this->look->on('player_cards'),
                    'hud' => $this->look->on('hud'),
                    'radar' => $this->look->on('radar') ? $this->radar->for($context->getActor()) : null,
                ] : null),
        ];
    }
}
