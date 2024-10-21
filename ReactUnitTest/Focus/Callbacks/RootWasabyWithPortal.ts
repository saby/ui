//RootWasabyWithPortal
import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import { IRootReactWithPortalProps } from './RootReactWithPortal';
import * as template from 'wml!ReactUnitTest/Focus/Callbacks/RootWasabyWithPortal';

export default class RootWasabyWithPortal extends Control<
    IControlOptions & IRootReactWithPortalProps
> {
    _template: TemplateFunction = template;
}
