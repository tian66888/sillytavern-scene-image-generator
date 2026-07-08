export const DEFAULT_CONTEXT_TURNS = 8;
export const MIN_EFFECTIVE_CONTEXT_TURNS = 4;
export const DEFAULT_MAX_SCENE_CHARS = 12000;

const GENERATED_SCENE_IMAGE_MARKDOWN = /!\[剧情生图\]\([^)]*\)/g;
const ANY_MARKDOWN_IMAGE = /!\[[^\]]*]\((?:data:image\/[^)]*|[^)]*)\)/g;
const SUBTEXT_THINK_BLOCK = /<!--\s*begin_of_Subtext_think\s*-->[\s\S]*?<!--\s*end_of_Subtext_think\s*-->/gi;
const THINKING_BLOCK = /<thinking[\s\S]*?<\/thinking>/gi;
const AFTERTALK_BLOCK = /<aftertalk\b[\s\S]*?<\/aftertalk>/gi;
const HIDDEN_SPAN = /<span\b[^>]*display\s*:\s*none[^>]*>[\s\S]*?<\/span>/gi;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;
const BASE64_IMAGE_DATA = /data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+/gi;
const HTML_TAG = /<\/?(?:thinking|content|time_format|details|summary|div|span|p|br|hr)\b[^>]*>/gi;

export function normalizeContextTurns(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return DEFAULT_CONTEXT_TURNS;
    }

    return Math.max(1, Math.min(50, Math.floor(parsed)));
}

export function normalizeMaxSceneChars(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return DEFAULT_MAX_SCENE_CHARS;
    }

    return Math.max(1000, Math.min(40000, Math.floor(parsed)));
}

export function cleanSceneMessageText(text) {
    return String(text || '')
        .replace(SUBTEXT_THINK_BLOCK, '\n')
        .replace(THINKING_BLOCK, '\n')
        .replace(AFTERTALK_BLOCK, '\n')
        .replace(HIDDEN_SPAN, '\n')
        .replace(GENERATED_SCENE_IMAGE_MARKDOWN, '\n')
        .replace(ANY_MARKDOWN_IMAGE, '\n')
        .replace(BASE64_IMAGE_DATA, '\n')
        .replace(HTML_COMMENT, '\n')
        .replace(HTML_TAG, '\n')
        .replace(/<\/thinking>/gi, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

export function messageToSceneText(message, names = {}) {
    if (!message || typeof message.mes !== 'string') {
        return '';
    }

    const content = cleanSceneMessageText(message.mes);
    if (!content) {
        return '';
    }

    const speaker = message.name || (message.is_user ? names.user : names.assistant) || 'Narrator';
    return `${speaker}: ${content}`;
}

function takeTailByChars(text, maxChars) {
    if (text.length <= maxChars) {
        return text;
    }

    return text.slice(-maxChars).replace(/^[^\n。！？.!?]*[\n。！？.!?]?/, '').trim() || text.slice(-maxChars);
}

export function collectSceneContextFromChat(chat, {
    turns = DEFAULT_CONTEXT_TURNS,
    maxChars = DEFAULT_MAX_SCENE_CHARS,
    names = {},
} = {}) {
    if (!Array.isArray(chat)) {
        return '';
    }

    const effectiveTurns = Math.max(MIN_EFFECTIVE_CONTEXT_TURNS, normalizeContextTurns(turns));
    const budget = normalizeMaxSceneChars(maxChars);
    const chunks = [];
    let usedChars = 0;
    let collectedMessages = 0;

    for (let index = chat.length - 1; index >= 0; index -= 1) {
        const message = chat[index];
        if (!message || message.is_system || typeof message.mes !== 'string' || !message.mes.trim()) {
            continue;
        }

        const chunk = messageToSceneText(message, names);
        if (!chunk) {
            continue;
        }

        const separatorChars = chunks.length > 0 ? 2 : 0;
        const remaining = budget - usedChars - separatorChars;
        if (remaining <= 0) {
            break;
        }

        chunks.unshift(takeTailByChars(chunk, remaining));
        usedChars += Math.min(chunk.length, remaining) + separatorChars;
        collectedMessages += 1;

        if (collectedMessages >= effectiveTurns) {
            break;
        }
    }

    return chunks.join('\n\n').trim();
}
