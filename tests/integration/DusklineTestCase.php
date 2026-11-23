<?php

/*
 * This file is part of ernestdefoe/duskline.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Duskline\Tests\integration;

use Carbon\Carbon;
use Flarum\Testing\integration\RetrievesAuthorizedUsers;
use Flarum\Testing\integration\TestCase;
use Flarum\User\User;

/**
 * Users: 1 admin; 2 a member online who shows it; 3 a member online who hides
 * it; 4 a member last seen an hour ago.
 */
abstract class DusklineTestCase extends TestCase
{
    use RetrievesAuthorizedUsers;

    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('ernestdefoe-duskline');

        $member = fn (int $id, ?Carbon $seen, bool $disclose) => [
            'id' => $id, 'username' => "member$id", 'email' => "member$id@machine.local", 'is_email_confirmed' => 1,
            'last_seen_at' => $seen, 'preferences' => json_encode(['discloseOnline' => $disclose]),
        ];

        $this->prepareDatabase([
            User::class => [
                $member(2, Carbon::now(), true),
                $member(3, Carbon::now(), false),
                $member(4, Carbon::now()->subHour(), true),
            ],
            'group_user' => [
                ['user_id' => 2, 'group_id' => 3],
                ['user_id' => 3, 'group_id' => 3],
                ['user_id' => 4, 'group_id' => 3],
            ],
        ]);
    }

    protected function page(?int $actor = null): string
    {
        return (string) $this->send($this->request('GET', '/', $actor ? ['authenticatedAs' => $actor] : []))->getBody();
    }

    /** @return array<string, mixed>|null */
    protected function forumConfig(?int $actor = null): ?array
    {
        $response = $this->send($this->request('GET', '/api', $actor ? ['authenticatedAs' => $actor] : []));
        $this->assertSame(200, $response->getStatusCode(), (string) $response->getBody());

        return json_decode((string) $response->getBody(), true)['data']['attributes']['duskline'] ?? null;
    }
}
