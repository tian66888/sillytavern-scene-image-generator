import test from 'node:test';
import assert from 'node:assert/strict';

import {
    cleanSceneMessageText,
    collectSceneContextFromChat,
    normalizeMaxSceneChars,
} from '../src/context-utils.js';

test('cleans generated images and hidden thinking from scene text', () => {
    const input = [
        '<!-- begin_of_Subtext_think -->不要进提示词<!-- end_of_Subtext_think -->',
        '<thinking>隐藏思考</thinking>',
        '<content>正文开始，角色推门入殿。</content>',
        '<aftertalk status="out_of_story">想问用户：下一步怎么办？</aftertalk>',
        '![剧情生图](data:image/png;base64,AAAA)',
    ].join('\n');

    const cleaned = cleanSceneMessageText(input);

    assert.match(cleaned, /正文开始，角色推门入殿/);
    assert.doesNotMatch(cleaned, /不要进提示词|隐藏思考|想问用户|data:image|剧情生图/);
});

test('collects at least several recent messages even when turns is set too low', () => {
    const chat = [
        { mes: '系统', is_system: true },
        { name: '用户', is_user: true, mes: '第一句' },
        { name: '助手', mes: '第二句' },
        { name: '用户', is_user: true, mes: '第三句' },
        { name: '助手', mes: '第四句' },
    ];

    const context = collectSceneContextFromChat(chat, { turns: 1, maxChars: 12000 });

    assert.match(context, /第一句/);
    assert.match(context, /第二句/);
    assert.match(context, /第三句/);
    assert.match(context, /第四句/);
});

test('caps very large scene context by character budget', () => {
    const longText = `开头${'很长'.repeat(10000)}最新剧情结尾`;
    const context = collectSceneContextFromChat(
        [{ name: '助手', mes: longText }],
        { turns: 4, maxChars: 3000 },
    );

    assert.ok(context.length <= normalizeMaxSceneChars(3000));
    assert.match(context, /最新剧情结尾/);
});
