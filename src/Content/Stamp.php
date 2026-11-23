<?php

/*
 * This file is part of ernestdefoe/duskline.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace ErnestDefoe\Duskline\Content;

use ErnestDefoe\Duskline\ActiveTheme;
use ErnestDefoe\Duskline\Look;
use Flarum\Frontend\Document;
use Psr\Http\Message\ServerRequestInterface;

/**
 * Writes Duskline's attributes on <html> and a tiny head script that runs
 * before first paint: it picks the sky from the visitor's own clock (the
 * server cannot know it) and applies the paint-shop choices this device saved.
 */
final class Stamp
{
    public function __construct(protected ActiveTheme $theme, protected Look $look)
    {
    }

    public function __invoke(Document $document, ServerRequestInterface $request): void
    {
        if (! $this->theme->for($request)) {
            return;
        }

        $mode = $this->look->heroMode();

        $document->extraAttributes['data-duskline'] = 'on';
        $document->extraAttributes['data-dusk-accent'] = $this->look->accent();
        $document->extraAttributes['data-dusk-hero'] = $mode;

        $fixed = $mode === 'fixed' ? $this->look->fixedScene() : '';
        $document->preHead[] = '<script>'.self::script($fixed, $this->look->on('paint_shop')).'</script>';
    }

    /**
     * Scene boundaries match js/src/common/sky.ts.
     */
    public static function script(string $fixed, bool $paint): string
    {
        $js = '(function(h){var o={},f='.json_encode($fixed).',d=new Date(),t=d.getHours()+d.getMinutes()/60;';
        if ($paint) {
            $js .= 'try{o=JSON.parse(localStorage.getItem("duskline")||"{}")||{}}catch(e){o={}}'
                .'var A='.json_encode(Look::ACCENTS).',S='.json_encode(Look::SCENES).';'
                .'if(A.indexOf(o.accent)>-1)h.setAttribute("data-dusk-accent",o.accent);'
                .'if(o.density==="compact")h.setAttribute("data-dusk-density","compact");'
                .'if(o.motion==="reduced"||o.motion==="off")h.setAttribute("data-dusk-motion",o.motion);'
                .'if(S.indexOf(o.sky)>-1)f=o.sky;';
        }

        return $js.'h.setAttribute("data-dusk-sky",f||(t<5||t>=20?"night":t<8?"dawn":t<16?"day":t<18.5?"golden":"sunset"))})(document.documentElement)';
    }
}
