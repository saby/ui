/**
 * @jest-environment jsdom
 */
import BeforeMountDecorator from 'UICore/_base/Control/BeforeMountDecorator';
import { getStateReceiver } from 'Application/Env';
import { Head as HeadAPI } from 'Application/Page';

const attrThemeKey = 'css-entity-theme';
const stateReceiver = getStateReceiver();
const defaultTheme = 'default';

const getFakeCSS = (name) => {
    return 'UIDemo/BeforeMountDecorator/' + name;
};

const getThemeConfig = (moduleName, themes) => {
    return {
        moduleName,
        themeName: defaultTheme,
        notLoadThemes: false,
        themes: themes || [],
        styles: [],
        instThemes: [],
        instStyles: [],
    };
};

const getAsyncChild: () => Promise<void> = () => {
    return new Promise((resolve) => {
        setTimeout(resolve);
    });
};

const putDataIntoStateReceiver: (key: string, data: unknown) => void = (
    key,
    data
) => {
    const someData = {
        getState: () => {
            return data;
        },
        setState: () => {
            return;
        },
    };

    stateReceiver.register(key, someData);
};

/**
 * Вернет атрибуты элемента link, описывающего CSS зависимость с указанным именем
 * @param css
 */
const getCSS: (css: string) => unknown = (css) => {
    const data = HeadAPI.getInstance().getData();

    return data
        .filter((value) => {
            return value[1] && value[1]['css-entity-name'] === css;
        })
        .pop()[1];
};

const waitThemeController = () => {
    return new Promise((resolve) => {
        setTimeout(resolve);
    });
};

const prepareStateReceiver: () => void = () => {
    // @ts-ignore Несколько тестов в этом файле бегают по StateReceiver, а данное свойство мешает обновить данные.
    delete stateReceiver._serialized;
    stateReceiver.deserialize(stateReceiver.serialize().serialized);
};

describe('BeforeMountDecorator jest', () => {
    describe('Received State', () => {
        /** Тест изолированно проверяет функционал, связанный с помещением и извлечением серверного состояния */
        it('Get Received State', () => {
            const moduleName = 'UITest/BeforeMountDecorator/FakeControl_1';
            const rsKey = 'test_1_';
            const data = { itIsTrue: true };
            const beforeMountDecorator = new BeforeMountDecorator();

            putDataIntoStateReceiver(rsKey, data);
            prepareStateReceiver();

            beforeMountDecorator.initStateReceiver(moduleName, rsKey);
            const rsData = beforeMountDecorator.getReceivedState();

            expect(rsData).toStrictEqual(data);
        });
    });

    /** Тест изолированно проверяет функционал. связанный с загрузкой CSS ресурсов для контрола и смены темы. */
    it.skip('Themes', async () => {
        const moduleName = 'UITest/BeforeMountDecorator/FakeControl';
        const css = getFakeCSS('BeforeMountDecorator');
        const beforeMountDecorator = new BeforeMountDecorator();

        beforeMountDecorator.initThemeController(
            getThemeConfig(moduleName, [css])
        );
        beforeMountDecorator.processBeforeMount(null, () => {
            return void 0;
        });

        await waitThemeController();

        let realCSS = getCSS(css);
        expect(!!realCSS).toBeTruthy();
        expect(realCSS[attrThemeKey]).toBe(defaultTheme);

        const newTheme = 'new';
        beforeMountDecorator.updateTheme(newTheme);

        await waitThemeController();

        realCSS = getCSS(css);
        expect(realCSS[attrThemeKey]).toBe(newTheme);
    });

    /** Комплект тестов проверяет результат метода processBeforeMount у BeforeMountDecorator на клиенте */
    describe('Process BeforeMount client', () => {
        const beforeMountResults = {
            empty: null,
            immediately: { data: true },
            async: { dataIsAsync: true },
        };

        /** Результат _beforeMount контрола пустой */
        it('Empty beforeMount result', () => {
            let callBackFlag = false;
            const moduleName = 'UITest/BeforeMountDecorator/FakeControl_2';
            const rsKey = 'test_1_2_';
            const beforeMountDecorator = new BeforeMountDecorator();

            beforeMountDecorator.initStateReceiver(moduleName, rsKey);
            const isAsync = beforeMountDecorator.processBeforeMount(
                beforeMountResults.empty,
                () => {
                    callBackFlag = true;
                }
            );

            expect(!!isAsync).toBe(false);
            expect(callBackFlag).toBe(true);
        });
    });

    /** Блок тестов, направленных на проверку функционала регистрации и работы с зарегистрированными асинх. потомками */
    describe('Async child', () => {
        /** Регистрация асинхронного потомка */
        it('Register async child', async () => {
            const beforeMountDecorator = new BeforeMountDecorator();
            beforeMountDecorator.registerAsyncChild(getAsyncChild());

            expect(beforeMountDecorator.hasAsync()).toBe(true);

            await beforeMountDecorator.waitMyChildrenAsyncMount();

            expect(beforeMountDecorator.hasAsync()).toBe(false);

            beforeMountDecorator.registerAsyncChild(getAsyncChild());

            expect(beforeMountDecorator.hasAsync()).toBe(true);
        });
    });
});
