<?php

/*
 * This file is part of ernestdefoe/duskline.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Duskline\Integration;

use Ernestdefoe\Wardrobe\ThemeRegistry;
use Flarum\Foundation\AbstractServiceProvider;
use Flarum\User\User;

/**
 * Registered only while Wardrobe is enabled (Extend\Conditional): binds a
 * resolver that answers which theme a visitor is on.
 */
class WardrobeProvider extends AbstractServiceProvider
{
    public const BINDING = 'duskline.wardrobe';

    public function register(): void
    {
        $this->container->bind(self::BINDING, fn ($container) => fn (User $actor, ?string $cookie): ?string => $container->make(ThemeRegistry::class)->resolve($actor, $cookie));
    }
}
