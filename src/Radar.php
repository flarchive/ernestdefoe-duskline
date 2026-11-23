<?php

/*
 * This file is part of ernestdefoe/duskline.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Duskline;

use Carbon\Carbon;
use Flarum\Http\SlugManager;
use Flarum\User\User;
use Illuminate\Contracts\Cache\Repository as Cache;

/**
 * Who is online, for the radar widget. Only members who show their online
 * status are counted or shown. The shared part (the ids of those members,
 * newest first) is cached for CACHE_SECONDS; the viewer is added on top (they
 * are online by definition), and who they may see is decided per request.
 */
final class Radar
{
    /** Faces on the radar. */
    public const DOTS = 12;

    /** "Online" means seen within this many minutes. */
    public const WINDOW_MINUTES = 5;

    /** Recent members scanned for their online-status preference (the count tops out here). */
    public const SCAN = 200;

    public const CACHE_SECONDS = 60;

    public function __construct(protected Cache $cache, protected SlugManager $slugs)
    {
    }

    /** @return list<int> ids of members online who show it, newest first */
    public function shared(): array
    {
        return $this->cache->remember('duskline.radar', self::CACHE_SECONDS, function (): array {
            $ids = [];
            $recent = User::query()
                ->where('last_seen_at', '>', Carbon::now()->subMinutes(self::WINDOW_MINUTES))
                ->where('is_email_confirmed', true)
                ->orderByDesc('last_seen_at')
                ->limit(self::SCAN)
                ->get(['id', 'preferences']);

            foreach ($recent as $user) {
                if ($user->getPreference('discloseOnline')) {
                    $ids[] = (int) $user->id;
                }
            }

            return $ids;
        });
    }

    /**
     * The radar as this actor may see it: nothing without forum access, the
     * count for everyone else, faces only for members allowed to search users
     * and only of users visible to them (one query by primary key).
     *
     * @return array{count: int, users: list<array{id: int, username: string, slug: string, displayName: string, avatarUrl: ?string}>}|null
     */
    public function for(User $actor): ?array
    {
        if (! $actor->can('viewForum')) {
            return null;
        }

        $ids = $this->shared();

        // The viewer is here right now, whatever the cache says.
        if (! $actor->isGuest() && $actor->getPreference('discloseOnline') && ! in_array((int) $actor->id, $ids, true)) {
            array_unshift($ids, (int) $actor->id);
        }

        $users = [];
        $dots = array_slice($ids, 0, self::DOTS);

        if ($dots && $actor->can('searchUsers')) {
            $found = User::whereVisibleTo($actor)->whereIn('id', $dots)->get()->keyBy('id');
            $driver = $this->slugs->forResource(User::class);
            foreach ($dots as $id) {
                if ($user = $found->get($id)) {
                    $users[] = [
                        'id' => $id,
                        'username' => (string) $user->username,
                        'slug' => $driver->toSlug($user),
                        'displayName' => (string) $user->display_name,
                        'avatarUrl' => $user->avatar_url,
                    ];
                }
            }
        }

        return ['count' => count($ids), 'users' => $users];
    }
}
