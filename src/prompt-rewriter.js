import { generateRaw } from '../../../../../script.js';

export function buildRewritePrompt(sceneText, presetPrompt) {
    return `${presetPrompt.trim()}

当前剧情：
${sceneText.trim()}

生图提示词：`;
}

export function buildRewriteMessages(sceneText, presetPrompt) {
    return [
        {
            role: 'system',
            content: `${presetPrompt.trim()}

重要规则：
你现在不是角色扮演助手，不要续写剧情，不要向用户提问，不要输出开场白或旁白。
你的唯一任务是把用户提供的【当前剧情】转换成可以直接用于图像生成的提示词。
只输出最终生图提示词。`,
        },
        {
            role: 'user',
            content: `当前剧情：
${sceneText.trim()}

请输出生图提示词：`,
        },
    ];
}

function normalizeTextResponse(data) {
    const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? data?.output_text ?? '';
    return String(content).trim();
}

export async function rewritePrompt(sceneText, settings) {
    if (!sceneText.trim()) {
        throw new Error('当前还没有可用的聊天剧情。');
    }

    if (settings.rewrite.mode !== 'custom') {
        const result = await generateRaw({
            prompt: buildRewriteMessages(sceneText, settings.presetPrompt),
            responseLength: 600,
            trimToSentence: false,
            trimNames: false,
        });
        return String(result || '').trim();
    }

    if (!settings.rewrite.apiUrl || !settings.rewrite.model) {
        throw new Error('使用自定义改写模型时，必须填写 API 地址和模型名。');
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
            messages: buildRewriteMessages(sceneText, settings.presetPrompt),
        }),
    });

    if (!response.ok) {
        throw new Error(`提示词改写请求失败：HTTP ${response.status}`);
    }

    const data = await response.json();
    const prompt = normalizeTextResponse(data);
    if (!prompt) {
        throw new Error('提示词改写 API 返回了空内容。');
    }

    return prompt;
}
