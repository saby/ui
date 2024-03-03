/**
 * @jest-environment jsdom
 */
import { unmountComponentAtNode, render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import BeforeMountDecorator from 'UICore/_base/Control/BeforeMountDecorator';
import RootReact from './UniqueRskey/UniqueRskeyRootReact';

describe('Уникальные ключи для нескольких васаби контролов внутри реакта', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
        container = null;
        jest.restoreAllMocks();
    });

    test('В реакт вставляется несколько Wasaby контролов, rs ключи не пересекаются', () => {
        const rsKeyArr: string[] = [];
        jest.spyOn(BeforeMountDecorator.prototype, 'initStateReceiver').mockImplementation(
            (_, rsKey) => {
                rsKeyArr.push(rsKey);
            }
        );
        act(() => {
            render(<RootReact />, container);
        });

        // В RootReact 3 сына васаби, в каждом из которых 3 внука-васаби. Всего 3 сына и 9 внуков.
        const expectedRsKeyArrLength = 12;
        // Для каждого васаби в этом дереве позвался initStateReceiver.
        expect(rsKeyArr.length).toBe(expectedRsKeyArrLength);

        const expectedIndexOfArr = [];
        const actualIndexOfArr = [];
        for (let i = 0; i < expectedRsKeyArrLength; i++) {
            // Если indexOf не равен i, есть одинаковые ключи.
            // Можно было бы через Set, но так в случае падения нагляднее, сколько и какие повторяются.
            expectedIndexOfArr.push(i);
            actualIndexOfArr.push(rsKeyArr.indexOf(rsKeyArr[i]));
        }
        expect(actualIndexOfArr).toEqual(expectedIndexOfArr);
    });
});
