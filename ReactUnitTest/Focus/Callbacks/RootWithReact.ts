import { Control } from 'UICore/Base';
import { TemplateFunction } from 'UICommon/Base';
import * as template from 'wml!ReactUnitTest/Focus/Callbacks/RootWithReact';

export default class RootWithReact extends Control {
    onRootActivatedCount: number = 0;
    onRootDeactivatedCount: number = 0;
    onWasabyActivatedCount: number = 0;
    onReactDeactivatedCount: number = 0;

    _template: TemplateFunction = template;

    constructor(props: unknown, context: unknown) {
        super(props, context);
        this.onRootActivated = this.onRootActivated.bind(this);
        this.onRootDeactivated = this.onRootDeactivated.bind(this);
        this.onWasabyActivated = this.onWasabyActivated.bind(this);
        this.onReactDeactivated = this.onReactDeactivated.bind(this);
    }
    onRootActivated(): void {
        this.onRootActivatedCount++;
    }
    onRootDeactivated(): void {
        this.onRootDeactivatedCount++;
    }
    onWasabyActivated(): void {
        this.onWasabyActivatedCount++;
    }
    onReactDeactivated(): void {
        this.onReactDeactivatedCount++;
    }
    _afterMount(): void {
        this.activate();
    }
}
