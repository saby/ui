/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { ThemeWrapper } from 'UI/Theme';
import { IActiveTheme, getThemeController } from 'UI/theme/controller';
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
            expect(applyStylesSpy).toBeCalledWith(activeTheme);
            expect(getActiveThemeSpy).not.toBeCalled();
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
    });
});
