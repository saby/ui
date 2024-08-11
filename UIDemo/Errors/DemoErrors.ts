// @ts-ignore
import { Control, TemplateFunction } from 'UI/Base';

// @ts-ignore
import template = require('wml!UIDemo/Errors/DemoErrors');

// для упрощения, чтобы не мешать демо с темизацией используем обычную css
import 'css!UIDemo/Errors/DemoErrors';

class DemoErrors extends Control {
    _template: TemplateFunction = template;

    _caption: String = 'create error';
    _hookError: Boolean = false;

    // шаблоны
    _foundTemplate: String = '';
    _notFoundTemplate: String = '';
    _badTemplateName: String = '';

    /**
     * несуществующая переменная для генерации ошибки в _systemError
     */
    _test: any;

    /**
     * Пустой обработчик
     */
    _notFoundHandler1: any;

    _beforeUpdate(): void {
        if (this._hookError) {
            // после ошибки внутри хука - страница теряет реактивность, нужно перезагрузить
            alert(
                'Ошибка _beforeUpdate() ломает демо - перезагрузите страницу'
            );
            throw new Error('Ошибка на хуке _beforeUpdate() в процессе работы');
        }
    }

    /**
     * Генерация ошибки хука
     */
    _lifeError(): void {
        this._hookError = true;

        // @ts-ignore
        this._forceUpdate();
    }

    /**
     * Генерация ошибки по throw
     */
    _notFoundHandler2(): void {
        const message =
            'Ошибка по клику внутри обработчика. Произвольный текст';
        throw new Error(message);
    }

    /**
     * Генерация системной ошибки в js
     */
    _systemError(): any {
        // _test === undefined
        return this._test.error;
    }

    /**
     * Загрузка шаблонов через partial
     * @param {EventObject} e
     * @param {String} typeError - признак типа ошибки
     */
    _loadPartial(e, typeError): void {
        const badTemplateName = 'wml!UIDemo/Errors/resources/badTemplate';
        const foundTemplateName = 'wml!UIDemo/Errors/resources/found';
        switch (typeError) {
            case 'found':
                // первый клик не грузит контрол
                if (this._foundTemplate) {
                    this._requireModule(foundTemplateName, '_foundTemplate');
                }

                this._foundTemplate = foundTemplateName;
                break;

            case 'notFound':
                this._notFoundTemplate =
                    'wml!UIDemo/Errors/resources/errorsNotFound';
                break;

            case 'errorTemplate':
                this._requireModule(badTemplateName, '_badTemplateName');
                break;

            default:
                break;
        }
    }

    /**
     * Загрузка модулей через require([...])
     * @param {String} link
     * @param {String} fieldState
     */
    _requireModule(link, fieldState): void {
        const self = this;

        // @ts-ignore
        require([link], () => {
            self[fieldState] = link;

            // @ts-ignore
            self._forceUpdate();
        });
    }
}

export default DemoErrors;
