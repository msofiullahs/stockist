<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function general()
    {
        return Inertia::render('Settings/General', [
            'settings' => Setting::getAll(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'app_name' => ['required', 'string', 'max:50'],
            'currency' => ['required', 'string', 'max:10'],
            'currency_symbol' => ['required', 'string', 'max:5'],
            'theme' => ['required', 'in:light,dark'],
            'languages' => ['nullable', 'string'],
            'locale' => ['nullable', 'string', 'max:10'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value ?? '');
        }

        Setting::clearCache();

        return redirect()->route('settings.general')
            ->with('success', 'flash_settings_updated');
    }
}
