/**
 * @jest-environment jsdom
 */
import { act } from 'react-dom/test-utils';
import { render, unmountComponentAtNode } from 'react-dom';
import { AdaptiveInitializerInternal, _WindowSizeTracker } from 'UICore/Adaptive';

// to mock
import { SearchParams } from 'UICore/_adaptive/SearchParams';
import { Storage } from 'UICore/_adaptive/Aspects';
import { TouchDetect } from 'EnvTouch/EnvTouch';

import AdaptiveAspectsValue from './CommonComponents/AdaptiveAspectsValue';

const strangeSizeToTest = '31415';

describe('Forced aspects', () => {
    const searchParamsMockMap = new Map();
    let container: HTMLDivElement;

    beforeEach(() => {
        Storage.getInstance()._clear();
        container = document.createElement('div');
        document.body.appendChild(container);
        jest.spyOn(SearchParams.prototype, 'get').mockImplementation((key) =>
            searchParamsMockMap.get(key)
        );
        jest.spyOn(TouchDetect.prototype, 'isTouch').mockImplementation(() => false);
    });
    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
        document.body.removeAttribute('style');
        searchParamsMockMap.clear();
        Storage.getInstance()._clear();
        jest.restoreAllMocks();
    });

    test('width', () => {
        searchParamsMockMap.set('width', strangeSizeToTest);
        act(() => {
            render(
                <AdaptiveInitializerInternal>
                    <AdaptiveAspectsValue />
                </AdaptiveInitializerInternal>,
                container
            );
        });
        expect(document.body).toMatchSnapshot();
    });
    test('height', () => {
        searchParamsMockMap.set('height', strangeSizeToTest);
        act(() => {
            render(
                <AdaptiveInitializerInternal>
                    <AdaptiveAspectsValue />
                </AdaptiveInitializerInternal>,
                container
            );
        });
        expect(document.body).toMatchSnapshot();
    });
    test('isVertical', () => {
        searchParamsMockMap.set('isVertical', 'true');
        act(() => {
            render(
                <AdaptiveInitializerInternal>
                    <AdaptiveAspectsValue />
                </AdaptiveInitializerInternal>,
                container
            );
        });
        expect(document.body).toMatchSnapshot();
    });
    test('isPhone', () => {
        searchParamsMockMap.set('isPhone', 'true');
        act(() => {
            render(
                <AdaptiveInitializerInternal>
                    <AdaptiveAspectsValue />
                </AdaptiveInitializerInternal>,
                container
            );
        });
        expect(document.body).toMatchSnapshot();
    });
    test('isTablet', () => {
        searchParamsMockMap.set('isTablet', 'true');
        act(() => {
            render(
                <AdaptiveInitializerInternal>
                    <AdaptiveAspectsValue />
                </AdaptiveInitializerInternal>,
                container
            );
        });
        expect(document.body).toMatchSnapshot();
    });
    test('isTouch', () => {
        searchParamsMockMap.set('isTouch', 'true');
        act(() => {
            render(
                <AdaptiveInitializerInternal>
                    <AdaptiveAspectsValue />
                </AdaptiveInitializerInternal>,
                container
            );
        });
        expect(document.body).toMatchSnapshot();
    });
});
