export const SCENE_IMAGE_PROXY_ENDPOINT = '/api/plugins/scene-image-generator-proxy/fetch';

function normalizeHeaders(headers = {}) {
    if (headers instanceof Headers) {
        return Object.fromEntries(headers.entries());
    }

    return Object.fromEntries(Object.entries(headers).filter(([, value]) => value !== undefined));
}

function shouldFallbackToDirectFetch(response) {
    const contentType = response.headers?.get?.('content-type') || '';
    return response.status === 404 && contentType.includes('text/html');
}

async function fetchCsrfToken(fetchFn) {
    const response = await fetchFn('/csrf-token');
    if (!response.ok) {
        throw new Error('无法获取酒馆 CSRF token。');
    }

    const data = await response.json();
    return data?.token || '';
}

export async function fetchWithSceneImageProxy(
    url,
    options = {},
    fetchFn = fetch,
    csrfTokenFn = () => fetchCsrfToken(fetchFn),
) {
    const normalizedOptions = {
        method: options.method || 'GET',
        headers: normalizeHeaders(options.headers),
        body: options.body ?? null,
    };
    const csrfToken = await csrfTokenFn();

    const response = await fetchFn(SCENE_IMAGE_PROXY_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify({
            url,
            ...normalizedOptions,
        }),
    });

    if (shouldFallbackToDirectFetch(response)) {
        return fetchFn(url, options);
    }

    return response;
}
