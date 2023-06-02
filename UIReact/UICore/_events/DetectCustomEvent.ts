import { detection } from 'Env/Env';

// ie только частично поддерживает CustomEvent, поэтому проверка instanceof CustomEvent не работает
// будем определять по наличию поля detail с control
export function isCustomEvent(event): boolean {
    if (detection.isIE && !!event?.detail?.control) {
        return true;
    }
    return event instanceof CustomEvent;
}
