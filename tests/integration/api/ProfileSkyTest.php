<?php

/*
 * This file is part of ernestdefoe/duskline.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Duskline\Tests\integration\api;

use ErnestDefoe\Duskline\Tests\integration\DusklineTestCase;
use PHPUnit\Framework\Attributes\Test;

class ProfileSkyTest extends DusklineTestCase
{
    private function save(mixed $sky): ?string
    {
        $response = $this->send($this->request('PATCH', '/api/users/2', [
            'authenticatedAs' => 2,
            'json' => ['data' => ['type' => 'users', 'id' => '2', 'attributes' => ['preferences' => ['duskSky' => $sky]]]],
        ]));
        $this->assertSame(200, $response->getStatusCode(), (string) $response->getBody());

        // What other visitors see.
        $shown = $this->send($this->request('GET', '/api/users/2', ['authenticatedAs' => 3]));

        return json_decode((string) $shown->getBody(), true)['data']['attributes']['duskSky'];
    }

    #[Test]
    public function a_member_picks_the_sky_everyone_sees_on_their_profile(): void
    {
        $this->assertSame('night', $this->save('night'));
        $this->assertNull($this->save(null));
    }

    #[Test]
    public function only_known_skies_are_kept(): void
    {
        $this->assertNull($this->save('<b>noon</b>'));
    }
}
