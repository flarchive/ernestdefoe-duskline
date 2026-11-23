<?php

/*
 * This file is part of ernestdefoe/duskline.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Duskline\Tests\unit;

use ErnestDefoe\Duskline\Content\Stamp;
use ErnestDefoe\Duskline\Look;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class StampScriptTest extends TestCase
{
    #[Test]
    public function the_clock_boundaries_match_the_forum_js(): void
    {
        // js/src/common/sky.ts: night < 5, dawn < 8, day < 16, golden < 18.5, sunset < 20.
        $this->assertStringContainsString('t<5||t>=20?"night":t<8?"dawn":t<16?"day":t<18.5?"golden":"sunset"', Stamp::script('', true));
    }

    #[Test]
    public function a_fixed_scene_is_written_as_a_json_string(): void
    {
        $this->assertStringContainsString('f="sunset"', Stamp::script('sunset', false));
        $this->assertStringNotContainsString('localStorage', Stamp::script('sunset', false));
    }

    #[Test]
    public function pick_keeps_only_listed_values(): void
    {
        $this->assertSame('night', Look::pick('night', Look::SCENES, null));
        $this->assertNull(Look::pick('noon', Look::SCENES, null));
        $this->assertNull(Look::pick(['night'], Look::SCENES, null));
        $this->assertSame('coral', Look::pick(null, Look::ACCENTS, 'coral'));
    }
}
