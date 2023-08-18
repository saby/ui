import { default as ReactComponent } from 'UICore/_executor/_Markup/Creator/ReactComponent';
import { reactAttrNames } from 'UICore/_executor/_Markup/wasabyToReactAttrNames';
import { wasabyContextPropNames } from 'UICore/Contexts';

class TestReactComponent extends ReactComponent {
    static copyAtributesToProps(props: any): any {
        return ReactComponent.copyAtributesToProps(props);
    }
}

describe('ReactComponent.copyAtributesToProps', () => {
    test('копируются атрибуты из списка, кроме пропсов васаби контекста', async () => {
        const reactAttrs = {};
        const resultProps = {};
        for (const attrName of reactAttrNames) {
            reactAttrs[attrName] = attrName;
            if (!wasabyContextPropNames.has(attrName)) {
                resultProps[attrName] = attrName;
            }
        }
        let props = {
            someProp: 'someProp',
            attrs: { ...reactAttrs },
        };
        props = TestReactComponent.copyAtributesToProps(props);

        expect(props).toStrictEqual({
            someProp: 'someProp',
            attrs: { ...reactAttrs },
            ...resultProps,
        });
    });

    test('НЕ копируются атрибуты НЕ из списка', async () => {
        let props = {
            someProp: 'someProp',
            attrs: {
                'ws-no-focus': 'ws-no-focus',
                'ws-creates-context': 'ws-creates-context',
                className: 'className',
            },
        };
        props = TestReactComponent.copyAtributesToProps(props);

        expect(props).not.toHaveProperty('ws-no-focus');
        expect(props).not.toHaveProperty('ws-creates-context');
    });

    test('не копируется style', async () => {
        let props = {
            someProp: 'someProp',
            attrs: {
                className: 'className',
                style: { color: 'red' },
            },
        };
        props = TestReactComponent.copyAtributesToProps(props);

        expect(props).not.toHaveProperty('style');
    });

    test('копируются data-', async () => {
        const attrs = {
            'data-qa': 'data-qa',
            'data-qa-valuechanged': 'data-qa-valuechanged',
            'data-item': 'data-item',
        };
        let props = {
            someProp: 'someProp',
            attrs,
        };
        props = TestReactComponent.copyAtributesToProps(props);

        expect(props).toStrictEqual({
            someProp: 'someProp',
            attrs,
            'data-qa': 'data-qa',
            'data-qa-valuechanged': 'data-qa-valuechanged',
            'data-item': 'data-item',
        });
    });

    test('Не копируются атрибуты, которые совпадают по имени с пропсами wasaby контекста', () => {
        const attrs = {
            className: 'className',
            readOnly: 'false',
        };
        let props = {
            someProp: 'someProp',
            attrs,
        };
        props = TestReactComponent.copyAtributesToProps(props);

        expect(props).toStrictEqual({
            className: 'className',
            someProp: 'someProp',
            attrs,
        });
    });

    test('Копируются атрибуты, даже если есть пропсы с таким же именем', () => {
        const attrs = {
            className: 'classNameFromAttributes',
        };
        let props = {
            className: 'classNameFromProps',
            attrs,
        };
        props = TestReactComponent.copyAtributesToProps(props);

        expect(props).toStrictEqual({
            className: 'classNameFromAttributes',
            attrs,
        });
    });
});
