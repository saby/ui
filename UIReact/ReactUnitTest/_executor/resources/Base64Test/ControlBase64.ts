import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_executor/resources/Base64Test/ControlBase64';

const base64String =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const backgroundImage = `url(${base64String})`;

export default class ControlBase64 extends Control {
    _value: string = base64String;
    _template: TemplateFunction = template;
    _children: {
        onlyBase64: HTMLElement;
        otherPropBeforeBase64: HTMLElement;
        otherAfterBeforeBase64: HTMLElement;
        otherPropsAroundBase64: HTMLElement;
    };
}

const styles = {
    color: 'red',
    backgroundImage,
    margin: '8px',
};

export { styles };
