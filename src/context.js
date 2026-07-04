import { chat, name1, name2 } from '../../../../../script.js';

function messageToText(message) {
    if (!message || typeof message.mes !== 'string') {
        return '';
    }

    const speaker = message.name || (message.is_user ? name1 : name2) || 'Narrator';
    return `${speaker}: ${message.mes.trim()}`;
}

export function collectSceneContext(turns) {
    const limit = Math.max(1, Number(turns) || 1);
    const visibleMessages = chat
        .filter(message => message && !message.is_system && typeof message.mes === 'string' && message.mes.trim())
        .slice(-limit);

    return visibleMessages.map(messageToText).join('\n\n');
}

export function getLastSceneText() {
    const message = [...chat].reverse().find(item => item && !item.is_system && typeof item.mes === 'string' && item.mes.trim());
    return messageToText(message);
}
