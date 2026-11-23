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

class ForumFieldsTest extends DusklineTestCase
{
    #[Test]
    public function guests_see_how_many_are_online_but_not_who(): void
    {
        $radar = $this->forumConfig()['radar'];

        // Members 2 and 3 were seen in the last five minutes, 4 an hour ago; 3 hides it.
        $this->assertSame(1, $radar['count']);
        $this->assertSame([], $radar['users']);
    }

    #[Test]
    public function members_see_only_those_who_show_their_online_status(): void
    {
        $users = $this->forumConfig(2)['radar']['users'];

        $this->assertSame(['member2'], array_column($users, 'username'));
        $this->assertSame(['id', 'username', 'slug', 'displayName', 'avatarUrl'], array_keys($users[0]));
    }

    #[Test]
    public function the_viewer_counts_as_online_unless_they_hide_it(): void
    {
        // Member 3 is online but hides it: not counted, even when viewing.
        $this->assertSame(1, $this->forumConfig(3)['radar']['count']);

        // Member 4 was last seen an hour ago (not in the cached answer), but is here now.
        $radar = $this->forumConfig(4)['radar'];
        $this->assertSame(2, $radar['count']);
        $this->assertSame(['member4', 'member2'], array_column($radar['users'], 'username'));
    }

    #[Test]
    public function a_private_forum_tells_guests_nothing(): void
    {
        // A private forum: guests lose viewForum, members keep it.
        $this->database()->table('group_permission')->where('permission', 'viewForum')->where('group_id', 2)->delete();
        $this->database()->table('group_permission')->insert(['permission' => 'viewForum', 'group_id' => 3]);

        $this->assertNull($this->forumConfig()['radar']);
        $this->assertSame(1, $this->forumConfig(2)['radar']['count']);
    }

    #[Test]
    public function the_radar_can_be_switched_off(): void
    {
        $this->setting('ernestdefoe-duskline.radar', false);

        $this->assertNull($this->forumConfig(2)['radar']);
    }

    #[Test]
    public function only_web_addresses_reach_the_hero(): void
    {
        $this->setting('ernestdefoe-duskline.hero_image', 'javascript:alert(1)');
        $this->setting('ernestdefoe-duskline.hero_video', 'https://cdn.example.com/loop.mp4');

        $config = $this->forumConfig();

        $this->assertSame('', $config['image']);
        $this->assertSame('https://cdn.example.com/loop.mp4', $config['video']);
    }
}
