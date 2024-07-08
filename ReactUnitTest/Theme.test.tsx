/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import createThemeScope from 'UI/theme/context';
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

    describe('ThemeScope', () => {
        it('При первом рендере применяется активная тема из пропсов', () => {
            const applyStylesSpy = jest.spyOn(getThemeController(), 'applyStyles');
            const getActiveThemeSpy = jest.spyOn(getThemeController(), 'getActiveTheme');
            const className = 'activeThemeClass';
            const activeTheme: IActiveTheme = {
                selector: 'activeThemeSelector',
                version: 1,
                classList: [className],
            };
            const ThemeScope = createThemeScope();

            act(() => {
                render(
                    <ThemeScope activeTheme={activeTheme}>
                        <div>test</div>
                    </ThemeScope>,
                    container
                );
            });

            expect(document.body.classList).toContain(className);
            expect(applyStylesSpy).toBeCalledWith(activeTheme);
            expect(getActiveThemeSpy).not.toBeCalled();
        });
        it('Если ThemeScope не верхний, список классов он навешивает на children', () => {
            const topActiveTheme: IActiveTheme = {
                classList: ['activeThemeClass'],
            };
            const ThemeScope = createThemeScope();

            const bottomActiveTheme: IActiveTheme = {
                classList: ['bottomActiveThemeClass'],
            };
            const BottomThemeScope = createThemeScope();

            act(() => {
                render(
                    <ThemeScope activeTheme={topActiveTheme}>
                        <div className="themeScopeChildren">
                            <BottomThemeScope activeTheme={bottomActiveTheme}>
                                <div className="bottomThemeScopeChildren">test</div>
                            </BottomThemeScope>
                        </div>
                    </ThemeScope>,
                    container
                );
            });

            expect(container).toMatchSnapshot();
        });
    });
});
