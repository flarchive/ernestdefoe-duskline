<?php

/*
 * This file is part of ernestdefoe/duskline.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Duskline;

use Flarum\Settings\SettingsRepositoryInterface;

/**
 * The theme's choices, read from settings and cleaned against fixed lists, so
 * nothing a setting or a member preference holds reaches the page unchecked.
 */
final class Look
{
    public const SCENES = ['dawn', 'day', 'golden', 'sunset', 'night'];

    public const ACCENTS = ['coral', 'magenta', 'teal', 'amber', 'ice'];

    public const HERO_MODES = ['clock', 'fixed', 'image', 'video', 'off'];

    public function __construct(protected SettingsRepositoryInterface $settings)
    {
    }

    public function get(string $key): string
    {
        return (string) $this->settings->get('ernestdefoe-duskline.'.$key);
    }

    public function on(string $key): bool
    {
        return (bool) $this->settings->get('ernestdefoe-duskline.'.$key);
    }

    public function heroMode(): string
    {
        return self::pick($this->get('hero_mode'), self::HERO_MODES, 'clock');
    }

    public function fixedScene(): string
    {
        return self::pick($this->get('hero_scene'), self::SCENES, 'golden');
    }

    public function accent(): string
    {
        return self::pick($this->get('accent'), self::ACCENTS, 'coral');
    }

    /** An http(s) URL or nothing. */
    public function url(string $key): string
    {
        $url = trim($this->get($key));

        return preg_match('#^https?://#i', $url) && filter_var($url, FILTER_VALIDATE_URL) ? $url : '';
    }

    /**
     * The value if it is on the list, else the fallback. The fallbacks used above
     * only stand in for a stored value that is not on the list.
     *
     * @param list<string> $allowed
     */
    public static function pick(mixed $value, array $allowed, ?string $fallback): ?string
    {
        return is_string($value) && in_array($value, $allowed, true) ? $value : $fallback;
    }
}
