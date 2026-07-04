function parseExtraParams(profile) {
    if (!profile.extraParams?.trim()) {
        return {};
    }

    try {
        const parsed = JSON.parse(profile.extraParams);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('Extra params must be a JSON object.');
        }
        return parsed;
    } catch (error) {
        throw new Error(`Invalid extra params JSON: ${error.message}`);
    }
}

function extractImageUrl(data) {
    const first = data?.data?.[0];
    if (!first) {
        return '';
    }

    if (first.b64_json) {
        return `data:image/png;base64,${first.b64_json}`;
    }

    if (first.url) {
        return first.url;
    }

    return '';
}

export async function generateOpenAICompatibleImage(prompt, profile) {
    if (!profile.apiUrl) {
        throw new Error('Image API URL is required.');
    }
    if (!profile.model) {
        throw new Error('Image model is required.');
    }

    const response = await fetch(profile.apiUrl.replace(/\/$/, '') + '/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(profile.apiKey ? { Authorization: `Bearer ${profile.apiKey}` } : {}),
        },
        body: JSON.stringify({
            model: profile.model,
            prompt,
            size: profile.size || '1024x1024',
            response_format: profile.responseFormat || 'b64_json',
            ...parseExtraParams(profile),
        }),
    });

    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(`Image request failed: HTTP ${response.status}${message ? ` - ${message}` : ''}`);
    }

    const data = await response.json();
    const imageUrl = extractImageUrl(data);
    if (!imageUrl) {
        throw new Error('Image API returned no image URL or base64 payload.');
    }

    return imageUrl;
}
