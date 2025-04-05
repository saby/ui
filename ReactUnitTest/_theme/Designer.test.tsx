/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { ThemeDesigner } from 'UI/Theme';
import { classNameMock, propertiesMock, backgroundMock } from './BackgroundMock';

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

    describe('Designer', () => {
        it('Все свойства прокидываются на детей, useChildrenContainer=false', () => {
            const mockProps = {
                className: classNameMock,
                properties: propertiesMock,
                background: backgroundMock,
                useChildrenContainer: false,
            };
            act(() => {
                render(
                    <ThemeDesigner {...mockProps}>
                        <div data-testid="child">Child Content</div>
                    </ThemeDesigner>,
                    container
                );
            });

            expect(container).toMatchSnapshot();

            const element = container.querySelector('[data-testid="child"]')
                ?.parentElement as HTMLElement;
            expect(element.className).toContain(classNameMock);
        });

        it('Все свойства прокидываются на детей, useChildrenContainer=true', () => {
            const mockProps = {
                className: classNameMock,
                properties: propertiesMock,
                background: backgroundMock,
                useChildrenContainer: true,
            };
            act(() => {
                render(
                    <ThemeDesigner {...mockProps}>
                        <div data-testid="child">Child Content</div>
                    </ThemeDesigner>,
                    container
                );
            });

            expect(container).toMatchSnapshot();

            const element = container.querySelector('[data-testid="child"]') as HTMLElement;
            expect(element.className).toContain(classNameMock);
        });
    });
});
