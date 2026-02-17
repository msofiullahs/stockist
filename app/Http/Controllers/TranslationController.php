<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TranslationController extends Controller
{
    protected function langPath(string $filename = ''): string
    {
        return base_path('lang' . ($filename ? '/' . $filename : ''));
    }

    protected function readJsonFile(string $code): array
    {
        $path = $this->langPath("{$code}.json");

        if (!file_exists($path)) {
            return [];
        }

        $content = file_get_contents($path);
        return json_decode($content, true) ?: [];
    }

    protected function writeJsonFile(string $code, array $translations): void
    {
        $dir = $this->langPath();

        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $path = $this->langPath("{$code}.json");
        file_put_contents($path, json_encode($translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    public function index()
    {
        $languagesJson = Setting::get('languages', '[]');
        $languages = json_decode($languagesJson, true) ?: [];

        // Read English base translations
        $enTranslations = $this->readJsonFile('en');

        // Read translations for each configured language
        $allTranslations = [];
        foreach ($languages as $lang) {
            $allTranslations[$lang['code']] = $this->readJsonFile($lang['code']);
        }

        // Build translations data: key => { en: "...", id: "...", fr: "..." }
        $translationsData = [];
        $allKeys = array_keys($enTranslations);

        // Also collect keys from other languages in case they have keys not in English
        foreach ($allTranslations as $langTranslations) {
            $allKeys = array_merge($allKeys, array_keys($langTranslations));
        }
        $allKeys = array_unique($allKeys);
        sort($allKeys);

        foreach ($allKeys as $key) {
            $translationsData[$key] = [
                'en' => $enTranslations[$key] ?? '',
            ];
            foreach ($languages as $lang) {
                $translationsData[$key][$lang['code']] = $allTranslations[$lang['code']][$key] ?? '';
            }
        }

        return Inertia::render('Settings/Translations', [
            'languages' => $languages,
            'translationData' => $translationsData,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'translations' => ['required', 'array'],
        ]);

        $translations = $request->input('translations');
        $languagesJson = Setting::get('languages', '[]');
        $languages = json_decode($languagesJson, true) ?: [];

        // Separate translations by language
        $byLanguage = ['en' => []];
        foreach ($languages as $lang) {
            $byLanguage[$lang['code']] = [];
        }

        foreach ($translations as $key => $values) {
            if (isset($values['en']) && $values['en'] !== '') {
                $byLanguage['en'][$key] = $values['en'];
            }
            foreach ($languages as $lang) {
                $code = $lang['code'];
                if (isset($values[$code]) && $values[$code] !== '') {
                    $byLanguage[$code][$key] = $values[$code];
                }
            }
        }

        // Write each language file
        foreach ($byLanguage as $code => $langTranslations) {
            ksort($langTranslations);
            $this->writeJsonFile($code, $langTranslations);
        }

        return redirect()->route('settings.translations')
            ->with('success', 'flash_translations_saved');
    }
}
