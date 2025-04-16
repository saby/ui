/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { BackgroundViewer, isLight, IBackgroundViewer } from 'UI/Theme';

function TestComponent({ className }: { className?: string }) {
    return (
        <div data-testid="child" className={className}>
            Child Component
        </div>
    );
}

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

    describe('BackgroundViewer', () => {
        describe('Базовый функционал определения цветности', () => {
            it('Вызов isLight для формата "255, 255, 255" ', () => {
                const result = isLight('255, 255, 255');

                expect(result).toBeTruthy();
            });

            it('Вызов isLight для формата "0, 0, 0" ', () => {
                const result = isLight('0, 0, 0');

                expect(result).toBeFalsy();
            });

            it('Вызов isLight для формата "255, 255, 255, 1" ', () => {
                const result = isLight('255, 255, 255, 1');

                expect(result).toBeTruthy();
            });

            it('Вызов isLight для формата "0, 0, 0, 1" ', () => {
                const result = isLight('0, 0, 0, 1');

                expect(result).toBeFalsy();
            });

            it('Вызов isLight для формата "rgb(255, 255, 255)" ', () => {
                const result = isLight('rgb(255, 255, 255)');

                expect(result).toBeTruthy();
            });

            it('Вызов isLight для формата "rgb(0, 0, 0)" ', () => {
                const result = isLight('rgb(0, 0, 0)');

                expect(result).toBeFalsy();
            });

            it('Вызов isLight для формата "rgb(255, 255, 255, 1)" ', () => {
                const result = isLight('rgb(255, 255, 255, 1)');

                expect(result).toBeTruthy();
            });

            it('Вызов isLight для формата "rgb(0, 0, 0, 1)" ', () => {
                const result = isLight('rgb(0, 0, 0, 1)');

                expect(result).toBeFalsy();
            });

            it('Вызов isLight для формата "#ffffff" ', () => {
                const result = isLight('#ffffff');

                expect(result).toBeTruthy();
            });

            it('Вызов isLight для формата "#000000" ', () => {
                const result = isLight('#000000');

                expect(result).toBeFalsy();
            });

            it('Вызов isLight для формата "#ffffffff" ', () => {
                const result = isLight('#ffffffff');

                expect(result).toBeTruthy();
            });

            it('Вызов isLight для формата "#000000ff" ', () => {
                const result = isLight('#000000ff');

                expect(result).toBeFalsy();
            });
        });

        describe('Проверяем если мы верхний вьювер (isUpperScope = true)', () => {
            it('Фон задают однотонным цветом', () => {
                const mockProps = {
                    background: {
                        background: '#ffffff',
                        dominantColorRGB: '255, 255, 255',
                        isLigthTheme: true,
                    },
                };

                act(() => {
                    render(
                        <BackgroundViewer {...mockProps}>
                            <div data-testid="child">Child Content</div>
                        </BackgroundViewer>,
                        container
                    );
                });

                expect(container).toMatchSnapshot();
            });

            it('Фон задали картинкой', () => {
                const mockProps: IBackgroundViewer = {
                    background: {
                        dominantColorRGB: '102, 79, 68',
                        image: {
                            cropDominantColor: '#664F44',
                            dominantColor: '#664F44',
                            name: 'photo.png',
                            resource: {
                                type: 'sbisDisk',
                                value: '000000000-0000-0000-0000-000000000000',
                            },
                            originalDominantColor: '#181008',
                            position: 'cover',
                            style: { type: 'original', value: '' },
                        },
                    },
                };

                act(() => {
                    render(
                        <BackgroundViewer {...mockProps}>
                            <div data-testid="child">Child Content</div>
                        </BackgroundViewer>,
                        container
                    );
                });

                expect(container).toMatchSnapshot();
            });

            it('Фон задали градиентным цветом ', () => {
                const mockProps = {
                    background: {
                        background: 'linear-gradient(270deg,#ffe5e3 0%,#ffe5e326 100%)',
                        dominantColorRGB: '255, 255, 255',
                    },
                };

                act(() => {
                    render(
                        <BackgroundViewer {...mockProps}>
                            <div data-testid="child">Child Content</div>
                        </BackgroundViewer>,
                        container
                    );
                });

                expect(container).toMatchSnapshot();
            });
        });
        describe('Проверяем если мы вложенный вьювер (isUpperScope = false)', () => {
            describe('Оборачиваем DOM-элемент', () => {
                it('Фон задают однотонным цветом', () => {
                    const mockProps = {
                        background: {
                            background: '#ffffff',
                            dominantColorRGB: '255, 255, 255',
                            isLigthTheme: true,
                        },
                        isUpperScope: false,
                    };

                    act(() => {
                        render(
                            <BackgroundViewer {...mockProps}>
                                <div data-testid="child">Child Content</div>
                            </BackgroundViewer>,
                            container
                        );
                    });

                    expect(container).toMatchSnapshot();
                });

                it('Фон задали картинкой', () => {
                    const mockProps: IBackgroundViewer = {
                        background: {
                            dominantColorRGB: '102, 79, 68',
                            image: {
                                cropDominantColor: '#664F44',
                                dominantColor: '#664F44',
                                name: 'photo.png',
                                resource: {
                                    type: 'sbisDisk',
                                    value: '000000000-0000-0000-0000-000000000000',
                                },
                                originalDominantColor: '#181008',
                                position: 'cover',
                                style: { type: 'original', value: '' },
                            },
                        },
                        isUpperScope: false,
                    };

                    act(() => {
                        render(
                            <BackgroundViewer {...mockProps}>
                                <div data-testid="child">Child Content</div>
                            </BackgroundViewer>,
                            container
                        );
                    });

                    expect(container).toMatchSnapshot();
                });

                it('Фон задали градиентным цветом ', () => {
                    const mockProps = {
                        background: {
                            background: 'linear-gradient(270deg,#ffe5e3 0%,#ffe5e326 100%)',
                            dominantColorRGB: '255, 255, 255',
                        },
                        isUpperScope: false,
                    };

                    act(() => {
                        render(
                            <BackgroundViewer {...mockProps}>
                                <div data-testid="child">Child Content</div>
                            </BackgroundViewer>,
                            container
                        );
                    });

                    expect(container).toMatchSnapshot();
                });
            });
            describe('Оборачиваем react-контрол', () => {
                it('Фон задают однотонным цветом', () => {
                    const mockProps = {
                        background: {
                            background: '#ffffff',
                            dominantColorRGB: '255, 255, 255',
                            isLigthTheme: true,
                        },
                        isUpperScope: false,
                        useChildrenContainer: true,
                    };

                    act(() => {
                        render(
                            <BackgroundViewer {...mockProps}>
                                <TestComponent />
                            </BackgroundViewer>,
                            container
                        );
                    });

                    expect(container).toMatchSnapshot();
                });

                it('Фон задали картинкой', () => {
                    const mockProps: IBackgroundViewer = {
                        background: {
                            dominantColorRGB: '102, 79, 68',
                            image: {
                                cropDominantColor: '#664F44',
                                dominantColor: '#664F44',
                                name: 'photo.png',
                                resource: {
                                    type: 'sbisDisk',
                                    value: '000000000-0000-0000-0000-000000000000',
                                },
                                originalDominantColor: '#181008',
                                position: 'cover',
                                style: { type: 'original', value: '' },
                            },
                        },
                        isUpperScope: false,
                        useChildrenContainer: true,
                    };

                    act(() => {
                        render(
                            <BackgroundViewer {...mockProps}>
                                <TestComponent />
                            </BackgroundViewer>,
                            container
                        );
                    });

                    expect(container).toMatchSnapshot();
                });

                it('Фон задали градиентным цветом ', () => {
                    const mockProps = {
                        background: {
                            background: 'linear-gradient(270deg,#ffe5e3 0%,#ffe5e326 100%)',
                            dominantColorRGB: '255, 255, 255',
                        },
                        isUpperScope: false,
                        useChildrenContainer: true,
                    };

                    act(() => {
                        render(
                            <BackgroundViewer {...mockProps}>
                                <TestComponent />
                            </BackgroundViewer>,
                            container
                        );
                    });

                    expect(container).toMatchSnapshot();
                });
            });
        });
    });
});
