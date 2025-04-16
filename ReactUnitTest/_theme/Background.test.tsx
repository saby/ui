/**
 * @jest-environment jsdom
 */
jest.mock('UI/_theme/Background', () => ({
    __esModule: true,
    default: jest.fn(({ children, ...props }) => (
        <div data-testid="background" {...props}>
            {children}
        </div>
    )),
}));

import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { ThemeDesigner, Background } from 'UI/Theme';
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
        it('Background получает правильные опциии, useChildrenContainer=false', () => {
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

            expect(Background).toHaveBeenCalledWith(
                expect.objectContaining(mockProps),
                expect.anything()
            );
        });
        it('Background получает правильные опциии, useChildrenContainer=true', () => {
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

            expect(Background).toHaveBeenCalledWith(
                expect.objectContaining(mockProps),
                expect.anything()
            );
        });
    });
});
