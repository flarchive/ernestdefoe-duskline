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

class StampTest extends DusklineTestCase
{
    #[Test]
    public function the_page_is_stamped_before_paint(): void
    {
        $html = $this->page();

        $this->assertMatchesRegularExpression('/<html[^>]*data-duskline="on"/', $html);
        $this->assertMatchesRegularExpression('/<html[^>]*data-dusk-accent="coral"/', $html);
        $this->assertMatchesRegularExpression('/<html[^>]*data-dusk-hero="clock"/', $html);
        // The head script picks the sky from the visitor's clock and reads the paint shop.
        $this->assertStringContainsString('h.setAttribute("data-dusk-sky"', $html);
        $this->assertStringContainsString('localStorage.getItem("duskline")', $html);
    }

    #[Test]
    public function settings_reach_the_page_only_from_fixed_lists(): void
    {
        $this->setting('ernestdefoe-duskline.accent', 'teal"><script>alert(1)</script>');
        $this->setting('ernestdefoe-duskline.hero_mode', 'fixed');
        $this->setting('ernestdefoe-duskline.hero_scene', 'night');

        $html = $this->page();

        $this->assertMatchesRegularExpression('/<html[^>]*data-dusk-accent="coral"/', $html);
        $this->assertStringNotContainsString('alert(1)', $html);
        $this->assertStringContainsString('f="night"', $html);
    }

    #[Test]
    public function without_the_paint_shop_the_device_choices_are_ignored(): void
    {
        $this->setting('ernestdefoe-duskline.paint_shop', false);

        $this->assertStringNotContainsString('localStorage.getItem("duskline")', $this->page());
    }
}
