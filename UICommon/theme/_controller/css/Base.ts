import { ICssEntity } from './interface';
import { DEFAULT_THEME, THEME_TYPE } from './const';

export abstract class Base implements Partial<ICssEntity> {
    isMounted: boolean = false;

    /**
     * Скольким контролам требуется данная css
     * Если 0 - удаляем
     */
    protected requirement: number = 0;

    constructor(
        public href: string,
        public cssName: string,
        public themeName: string = DEFAULT_THEME,
        public themeType: THEME_TYPE = THEME_TYPE.MULTI
    ) {
        if (!href || !cssName) {
            throw new Error(
                `Invalid arguments href - ${href} or cssName - ${cssName}`
            );
        }
        this.remove = this.remove.bind(this);
    }

    require(): void {
        this.requirement++;
    }

    remove(): Promise<boolean> {
        if (this.requirement === 0) {
            this.isMounted = false;
            return Promise.resolve(true);
        }
        this.requirement--;
        return Promise.resolve(false);
    }

    abstract load(): Promise<void> | void;
}
