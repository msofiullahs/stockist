<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'photo' => $request->user()->photo ? Storage::disk('public')->url($request->user()->photo) : null,
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'flash' => Inertia::always([
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ]),
            'settings' => Inertia::always(fn () => Setting::getAll()),
            'translations' => Inertia::always(fn () => $this->getTranslations()),
        ]);
    }

    protected function getTranslations(): array
    {
        $locale = Setting::get('locale', 'en');
        $langPath = base_path('lang');

        // Always load English as base
        $enPath = $langPath . '/en.json';
        $translations = [];
        if (file_exists($enPath)) {
            $translations = json_decode(file_get_contents($enPath), true) ?: [];
        }

        // If locale is not English, overlay the locale's translations
        if ($locale !== 'en') {
            $localePath = $langPath . '/' . $locale . '.json';
            if (file_exists($localePath)) {
                $localeTranslations = json_decode(file_get_contents($localePath), true) ?: [];
                // Only overlay non-empty values
                foreach ($localeTranslations as $key => $value) {
                    if ($value !== '') {
                        $translations[$key] = $value;
                    }
                }
            }
        }

        return $translations;
    }
}
