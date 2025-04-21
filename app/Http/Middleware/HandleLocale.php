<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use function inertia;
use function view;

class HandleLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $default = config('app.locale');
        $available = config('x-dash.available_languages');

        $locale = $request->cookie('locale', $default);

        if (!array_key_exists($locale, $available)) {
            $locale = $default;
        }

        $dir = $available[$locale]['dir'];

        app()->setLocale($locale);

        view()->share('locale', $locale);
        view()->share('available_languages', $available);
        view()->share('dir', $dir);

        inertia()->share([
            'locale' => $locale,
            'dir' => $dir,
        ]);

        return $next($request);
    }
}
