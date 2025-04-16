import { Control, TemplateFunction } from 'UI/Base';
import { withAdaptiveMode } from 'UICore/Adaptive';
import * as template from 'wml!ReactUnitTest/_adaptive/withAdaptive/Wasaby';

class Wasaby extends Control {
    _template: TemplateFunction = template;
}

export default withAdaptiveMode(Wasaby);
