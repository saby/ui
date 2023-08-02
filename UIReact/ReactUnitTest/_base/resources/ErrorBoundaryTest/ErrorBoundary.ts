import { Control, TemplateFunction } from 'UI/Base';
import * as template from 'wml!ReactUnitTest/_base/resources/ErrorBoundaryTest/ErrorBoundary';

export default class ErrorBoundary extends Control {
    _template: TemplateFunction = template;
}
