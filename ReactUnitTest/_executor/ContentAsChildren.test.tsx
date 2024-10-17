/**
 * @jest-environment jsdom
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

import ControlContent from './resources/ContentAsChildren/ControlContent';
import DivContent from './resources/ContentAsChildren/DivContent';
import WmlContent from './resources/ContentAsChildren/WmlContent';
import TemplateContent from './resources/ContentAsChildren/TemplateContent';
import WrapContentWithAnotherControls from './resources/ContentAsChildren/WrapContentWithAnotherControls';

// Именно шаблон без контрола, чтобы scope="{{ _options }}" работал как старый scope="{{ ... }}"
import ScopeContent = require('wml!ReactUnitTest/_executor/resources/ContentAsChildren/ScopeContent');
import CloneContentAsChildrenParent from './resources/ContentAsChildren/CloneContentAsChildrenParent';

describe('ContentAsChildren', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div', {});
        document.body.appendChild(container);
    });
    afterEach(() => {
        unmountComponentAtNode(container);
        container.remove();
    });

    describe.each([
        ['Реакт компонент рисует полученный children неизменным', false],
        ['Реакт компонент мутирует полученный children', true],
    ])('%s', (_describeName, allowPatchContent) => {
        it.each([
            ['Контент - wasaby контрол', ControlContent],
            ['Контент - div элемент', DivContent],
            ['Контент - wml шаблон', WmlContent],
            ['Контент - inline шаблон', TemplateContent],
            ['Контент - объект из скоупа, не нужно превращать в Children', ScopeContent],
        ])('%s', (_name, RootComponent) => {
            act(() => {
                render(<RootComponent allowPatchContent={allowPatchContent} />, container);
            });
            expect(container).toMatchSnapshot();
        });
    });

    it('Пропсы чистого реакта, заданные через cloneElement ContentAsChildren, не летят ниже корня контента', () => {
        act(() => {
            render(<CloneContentAsChildrenParent />, container);
        });

        expect(container).toMatchSnapshot('реф, класс и data-атрибут не пролетели дальше корня');
    });

    it('Children не летит через скоуп, позволяя вычислить актуальный ContentAsChildren', () => {
        act(() => {
            render(
                <WrapContentWithAnotherControls somePropFromScope="classNameFromScope">
                    <div className="content">Content</div>
                </WrapContentWithAnotherControls>,
                container
            );
        });
        expect(container).toMatchSnapshot('Отрисовались все обёртки контента');
    });
});
