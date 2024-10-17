/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Model } from 'Types/entity';
import { ThemeWrapper } from 'UI/Theme';
import { IActiveTheme, getThemeController, THEME_APPLICATIONS } from 'UI/theme/controller';
describe('Темизация', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
    });

    afterEach(() => {
        jest.restoreAllMocks();
        unmountComponentAtNode(container);
        container.remove();
    });

    describe('ThemeWrapper', () => {
        it('При первом рендере применяется активная тема из пропсов', () => {
            const applyStylesSpy = jest.spyOn(getThemeController(), 'applyStyles');
            const getActiveThemeSpy = jest.spyOn(getThemeController(), 'getActiveTheme');
            const className = 'activeThemeClass';
            const activeTheme: IActiveTheme = {
                selector: 'activeThemeSelector',
                version: 1,
                classList: [className],
            };

            act(() => {
                render(
                    <ThemeWrapper activeTheme={activeTheme}>
                        <div>test</div>
                    </ThemeWrapper>,
                    container
                );
            });

            expect(document.body.classList).toContain(className);
            expect(applyStylesSpy).toHaveBeenCalledWith(activeTheme);
            expect(getActiveThemeSpy).not.toHaveBeenCalled();
        });
        it('Если ThemeWrapper не верхний, список классов он навешивает на children', () => {
            const topActiveTheme: IActiveTheme = {
                classList: ['activeThemeClass'],
            };

            const bottomActiveTheme: IActiveTheme = {
                classList: ['bottomActiveThemeClass'],
                selector: 'default',
            };

            act(() => {
                render(
                    <ThemeWrapper activeTheme={topActiveTheme}>
                        <div className="themeWrapperChildren">
                            <ThemeWrapper activeTheme={bottomActiveTheme}>
                                <div className="bottomThemeWrapperChildren">test</div>
                            </ThemeWrapper>
                        </div>
                    </ThemeWrapper>,
                    container
                );
            });

            expect(container).toMatchSnapshot();
        });

        it('Применяется статическая тема, указанная в активной', () => {
            const staticTheme = 'default__test_min';
            const activeTheme: IActiveTheme = {
                selector: 'default__test',
                version: 1,
                classList: ['t-default__test'],
                themeApply: THEME_APPLICATIONS.palette,
                properties: Model.fromObject<IActiveTheme>({
                    staticTheme,
                }),
            };
            const arrActiveTheme = [activeTheme];

            act(() => {
                render(
                    <ThemeWrapper activeTheme={activeTheme}>
                        <div className="themeWrapperChildren">
                            <ThemeWrapper activeTheme={arrActiveTheme}>
                                <div className="bottomThemeWrapperChildren">test</div>
                            </ThemeWrapper>
                        </div>
                    </ThemeWrapper>,
                    container
                );
            });

            expect(document.body.className).toContain(staticTheme);
            expect(container).toMatchSnapshot();
        });

        it('ThemeWrapperSelector умеет грузить на клиенте и применять тему', async () => {
            const themeController = getThemeController();
            let resolveActiveTheme: (activeTheme: IActiveTheme) => void;
            jest.spyOn(themeController, 'getActiveTheme').mockImplementation(
                async function getActiveThemeMock() {
                    return new Promise((resolve) => {
                        resolveActiveTheme = resolve;
                    });
                }
            );

            const selector = 'default__test';
            const className = `t-${selector}`;
            const activeTheme = {
                isFromDistribution: true,
                error: 'client load',
                selector,
            };

            const activeThemeToResolove: IActiveTheme = {
                selector,
                version: 1,
                classList: [className],
                themeApply: THEME_APPLICATIONS.palette,
            };

            act(() => {
                render(
                    <ThemeWrapper activeTheme={activeTheme}>
                        <div>test</div>
                    </ThemeWrapper>,
                    container
                );
            });

            expect(document.body.classList).not.toContain(className);

            await act(async () => {
                resolveActiveTheme(activeThemeToResolove);
            });

            expect(document.body.classList).toContain(className);
        });
    });
});
