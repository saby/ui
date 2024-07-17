/**
 * @kaizen_zone ab3bb41a-875b-4344-9c09-6bc14c5a22f0
 */
import { GeneratorText } from './_Markup/Text/Generator';
import { GeneratorVdom } from './_Markup/Vdom/Generator';
import { IGeneratorConfig, IGenerator } from 'UICommon/Executor';

let _text: IGenerator;
let _vdom: IGenerator;

function Text(config: IGeneratorConfig): IGenerator {
    if (!_text) {
        _text = new GeneratorText(config);
    }
    return _text;
}
function Vdom(config?: IGeneratorConfig): IGenerator {
    if (!_vdom) {
        _vdom = new GeneratorVdom(config);
    }
    return _vdom;
}

export { Text, Vdom };