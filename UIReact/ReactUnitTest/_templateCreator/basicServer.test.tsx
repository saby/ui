import { renderToString } from 'react-dom/server';
import { act } from 'react-dom/test-utils';
import * as TemplateCreator from 'UICore/_executor/_Markup/Creator/TemplateCreator';
import Main from './Main';

describe('TemplateCreator server', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('TemplateCreator не должен вызываться для серверной вёрстки', () => {
        const templateCreatorSpy = jest.spyOn(
            TemplateCreator,
            'createElementForTemplate'
        );
        let result: string;
        act(() => {
            result = renderToString(<Main />);
        });
        expect(result).toBe('<div><div id="child"></div></div>');
        expect(templateCreatorSpy).not.toBeCalled();
    });
});
