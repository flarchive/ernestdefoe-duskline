<?php

/*
 * This file is part of ernestdefoe/duskline.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Duskline\Api;

use ErnestDefoe\Duskline\Look;
use Flarum\Api\Schema;
use Flarum\User\User;

/** The sky a member picked for their profile cover (from their preferences: no query). */
class UserFields
{
    public function __invoke(): array
    {
        return [
            Schema\Str::make('duskSky')
                ->nullable()
                ->get(fn (User $user) => Look::pick($user->getPreference('duskSky'), Look::SCENES, null)),
        ];
    }
}
