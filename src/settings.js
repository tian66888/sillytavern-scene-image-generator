import { saveSettingsDebounced } from '../../../../../script.js';
import { extension_settings } from '../../../../extensions.js';

export const MODULE_NAME = 'sceneImageGenerator';

export const DEFAULT_REWRITE_PROMPT = `You are an art director for story-driven image generation.
Read the current roleplay scene and produce one image prompt.
Focus on visible subjects, location, lighting, mood, composition, clothing, expression, action, and cinematic detail.
Avoid dialogue, meta commentary, spoilers, UI text, and unsupported facts.
Return only the final image prompt.`;

export const DEFAULT_SETTINGS = Object.freeze({
    selectedProfileId: '',
    contextTurns: 4,
    presetPrompt: DEFAULT_REWRITE_PROMPT,
    rewrite: {
        mode: 'current',
        apiUrl: '',
        apiKey: '',
        model: 'gpt-4o-mini',
        temperature: 0.4,
    },
    profiles: [
        {
            id: 'default-openai-compatible',
            name: 'OpenAI Compatible',
            provider: 'openai-compatible',
            apiUrl: '',
            apiKey: '',
            model: 'gpt-image-1',
            size: '1024x1024',
            responseFormat: 'b64_json',
            extraParams: '{}',
        },
    ],
    lastPrompt: '',
    lastImageUrl: '',
});

export function getSettings() {
    if (!extension_settings[MODULE_NAME]) {
        extension_settings[MODULE_NAME] = structuredClone(DEFAULT_SETTINGS);
    }

    const settings = extension_settings[MODULE_NAME];
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        if (settings[key] === undefined) {
            settings[key] = structuredClone(value);
        }
    }

    if (!settings.rewrite) {
        settings.rewrite = structuredClone(DEFAULT_SETTINGS.rewrite);
    }

    for (const [key, value] of Object.entries(DEFAULT_SETTINGS.rewrite)) {
        if (settings.rewrite[key] === undefined) {
            settings.rewrite[key] = structuredClone(value);
        }
    }

    if (!Array.isArray(settings.profiles)) {
        settings.profiles = structuredClone(DEFAULT_SETTINGS.profiles);
    }

    if (!settings.selectedProfileId && settings.profiles.length > 0) {
        settings.selectedProfileId = settings.profiles[0].id;
    }

    return settings;
}

export function saveSettings() {
    saveSettingsDebounced();
}

export function createProfile() {
    return {
        id: crypto.randomUUID(),
        name: 'New Image API',
        provider: 'openai-compatible',
        apiUrl: '',
        apiKey: '',
        model: 'gpt-image-1',
        size: '1024x1024',
        responseFormat: 'b64_json',
        extraParams: '{}',
    };
}

export function getSelectedProfile() {
    const settings = getSettings();
    return settings.profiles.find(profile => profile.id === settings.selectedProfileId) || settings.profiles[0] || null;
}
