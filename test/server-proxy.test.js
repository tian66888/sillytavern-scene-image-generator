import test from 'node:test';
import assert from 'node:assert/strict';

import {
    SCENE_IMAGE_PROXY_ENDPOINT,
    fetchWithSceneImageProxy,
} from '../src/server-proxy.js';

test('forwards upstream requests through the SillyTavern scene image proxy', async () => {
    const calls = [];
    const response = { ok: true, status: 200 };
    const fetchFn = async (url, options) => {
        calls.push({ url, options });
        return response;
    };

    const result = await fetchWithSceneImageProxy('https://sub2api.aiwanai.cc/v1/models', {
        method: 'GET',
        headers: {
            Authorization: 'Bearer test-key',
        },
    }, fetchFn, async () => 'csrf-test');

    assert.equal(result, response);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, SCENE_IMAGE_PROXY_ENDPOINT);
    assert.equal(calls[0].options.method, 'POST');
    assert.deepEqual(calls[0].options.headers, {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'csrf-test',
    });
    assert.deepEqual(JSON.parse(calls[0].options.body), {
        url: 'https://sub2api.aiwanai.cc/v1/models',
        method: 'GET',
        headers: {
            Authorization: 'Bearer test-key',
        },
        body: null,
    });
});

test('falls back to direct fetch when the local proxy plugin is unavailable', async () => {
    const calls = [];
    const missingProxyResponse = {
        status: 404,
        headers: {
            get(name) {
                return name.toLowerCase() === 'content-type' ? 'text/html; charset=utf-8' : null;
            },
        },
    };
    const directResponse = { ok: true, status: 200 };
    const fetchFn = async (url, options) => {
        calls.push({ url, options });
        return calls.length === 1 ? missingProxyResponse : directResponse;
    };

    const result = await fetchWithSceneImageProxy('https://api.example.com/v1/models', {
        method: 'GET',
        headers: {
            Authorization: 'Bearer direct-key',
        },
    }, fetchFn, async () => 'csrf-test');

    assert.equal(result, directResponse);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, SCENE_IMAGE_PROXY_ENDPOINT);
    assert.equal(calls[1].url, 'https://api.example.com/v1/models');
    assert.equal(calls[1].options.method, 'GET');
});
