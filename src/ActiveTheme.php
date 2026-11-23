<?php

/*
 * This file is part of ernestdefoe/duskline.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Duskline;

use ErnestDefoe\Duskline\Integration\BespokeProvider;
use ErnestDefoe\Duskline\Integration\WardrobeProvider;
use Flarum\Http\RequestUtil;
use Illuminate\Contracts\Container\Container;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;

/**
 * Whether Duskline styles this visitor's page. Every rule hangs off
 * html[data-duskline], which Content\Stamp writes only when this says yes, so
 * under Wardrobe (another theme chosen) or beside Bespoke the stylesheet and
 * the forum JS stay inert.
 */
final class ActiveTheme
{
    public const ID = 'ernestdefoe-duskline';

    public function __construct(protected Container $container, protected LoggerInterface $logger)
    {
    }

    public function for(?ServerRequestInterface $request): bool
    {
        $wardrobe = $this->container->bound(WardrobeProvider::BINDING);

        if (! $wardrobe) {
            return ! $this->container->bound(BespokeProvider::BINDING);
        }

        return ! $request || $this->ask($request);
    }

    private function ask(ServerRequestInterface $request): bool
    {
        try {
            $cookie = $request->getCookieParams()['wardrobe_theme'] ?? null;
            $chosen = ($this->container->make(WardrobeProvider::BINDING))(RequestUtil::getActor($request), is_string($cookie) ? $cookie : null);
        } catch (\Throwable $e) {
            // Wardrobe could not say: stay off rather than style a page the visitor chose another theme for.
            $this->logger->warning('Duskline: Wardrobe could not resolve the visitor\'s theme: '.$e->getMessage(), ['exception' => $e]);

            return false;
        }

        return $chosen === self::ID || ($chosen === null && ! $this->container->bound(BespokeProvider::BINDING));
    }
}
