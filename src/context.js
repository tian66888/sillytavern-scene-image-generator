import { chat, name1, name2 } from '../../../../../script.js';
import {
    DEFAULT_MAX_SCENE_CHARS,
    collectSceneContextFromChat,
    messageToSceneText,
} from './context-utils.js';

export function collectSceneContext(turns, maxChars = DEFAULT_MAX_SCENE_CHARS) {
    return collectSceneContextFromChat(chat, {
        turns,
        maxChars,
        names: {
            user: name1,
            assistant: name2,
        },
    });
}

export function getLastSceneText() {
    const message = [...chat].reverse().find(item => item && !item.is_system && typeof item.mes === 'string' && item.mes.trim());
    return messageToSceneText(message, {
        user: name1,
        assistant: name2,
    });
}
