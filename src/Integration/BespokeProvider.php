<?php

/*
 * This file is part of ernestdefoe/duskline.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Duskline\Integration;

use Flarum\Foundation\AbstractServiceProvider;

/** Registered only while Bespoke is enabled: Duskline then stays inert unless Wardrobe picks it. */
class BespokeProvider extends AbstractServiceProvider
{
    public const BINDING = 'duskline.bespoke';

    public function register(): void
    {
        $this->container->instance(self::BINDING, true);
    }
}
