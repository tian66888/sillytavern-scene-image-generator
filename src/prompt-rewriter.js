import { generateQuietPrompt } from '../../../../../script.js';

function buildRewritePrompt(sceneText, presetPrompt) {
    return `${presetPrompt.trim()}

Current scene:
${sceneText.trim()}

Image prompt:`;
}

function normalizeTextResponse(data) {
    const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? data?.output_text ?? '';
    return String(content).trim();
}

export async function rewritePrompt(sceneText, settings) {
    if (!sceneText.trim()) {
        throw new Error('No chat scene is available yet.');
    }

    const quietPrompt = buildRewritePrompt(sceneText, settings.presetPrompt);

    if (settings.rewrite.mode !== 'custom') {
        const result = await generateQuietPrompt({
            quietPrompt,
            responseLength: 300,
            trimToSentence: false,
        });
        return String(result || '').trim();
    }

    if (!settings.rewrite.apiUrl || !settings.rewrite.model) {
        throw new Error('Custom rewrite API URL and model are required.');
    }

    const response = await fetch(settings.rewrite.apiUrl.replace(/\/$/, '') + '/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(settings.rewrite.apiKey ? { Authorization: `Bearer ${settings.rewrite.apiKey}` } : {}),
        },
        body: JSON.stringify({
            model: settings.rewrite.model,
            temperature: Number(settings.rewrite.temperature) || 0.4,
            messages: [
                { role: 'system', content: settings.presetPrompt },
                { role: 'user', content: sceneText },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`Rewrite request failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    const prompt = normalizeTextResponse(data);
    if (!prompt) {
        throw new Error('Rewrite API returned an empty prompt.');
    }

    return prompt;
}
