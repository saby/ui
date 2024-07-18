import { Compiler } from 'Compiler/Compiler';
import { assert } from 'chai';

describe('Compiler/Compiler', () => {
    let compiler;
    beforeEach(() => {
        compiler = new Compiler();
    });
    it('Stable', (done) => {
        const html = '<div></div>';
        const options = {
            fileName: 'Compiler/Compiler/Template.wml',
            ESVersion: 2021
        };
        compiler
            .compile(html, options)
            .then(function (artifact) {
                try {
                    assert.isTrue(artifact.stable);
                    assert.strictEqual(artifact.nodeName, 'wml!Compiler/Compiler/Template');
                    assert.strictEqual(typeof artifact.text, 'string');
                    done();
                } catch (error) {
                    done(error);
                }
            })
            .catch(function (artifact) {
                done(artifact.errors.pop());
            });
    });
    it('Broken', (done) => {
        const html = '<div>';
        const options = {
            fileName: 'Compiler/Compiler/Template.wml',
            fromBuilderTmpl: true,
        };
        compiler
            .compile(html, options)
            .then(function () {
                done(new Error('Must be broken'));
                done();
            })
            .catch(function (artifact) {
                try {
                    assert.isFalse(artifact.stable);
                    assert.strictEqual(artifact.nodeName, 'wml!Compiler/Compiler/Template');
                    assert.strictEqual(
                        artifact.errors[0].message,
                        'Template Compiler: Обнаружен незакрытый тег "div". Строка: 1, столбец: 5. Модуль: Compiler/Compiler/Template'
                    );
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });
    it('Wml plugin detection', (done) => {
        const html = '<div></div>';
        const options = {
            fileName: 'Compiler/Compiler/Template.wml',
        };
        compiler
            .compile(html, options)
            .then(function (artifact) {
                try {
                    assert.strictEqual(
                        artifact.text.indexOf("define('wml!Compiler/Compiler/Template'"),
                        0
                    );
                    assert.strictEqual(artifact.nodeName, 'wml!Compiler/Compiler/Template');
                    done();
                } catch (error) {
                    done(error);
                }
            })
            .catch(function (artifact) {
                done(artifact.errors.pop());
            });
    });
    it('Tmpl plugin detection', (done) => {
        const html = '<div></div>';
        const options = {
            fileName: 'Compiler/Compiler/Template.tmpl',
        };
        compiler
            .compile(html, options)
            .then(function (artifact) {
                try {
                    assert.strictEqual(
                        artifact.text.indexOf("define('tmpl!Compiler/Compiler/Template'"),
                        0
                    );
                    assert.strictEqual(artifact.nodeName, 'tmpl!Compiler/Compiler/Template');
                    done();
                } catch (error) {
                    done(error);
                }
            })
            .catch(function (artifact) {
                done(artifact.errors.pop());
            });
    });
    it('From builder (true)', (done) => {
        const html = '<Control.Test />';
        const options = {
            fileName: 'Compiler/Compiler/Template.wml',
            fromBuilderTmpl: true,
        };
        compiler
            .compile(html, options)
            .then(function (artifact) {
                try {
                    assert.isTrue(artifact.stable);
                    done();
                } catch (error) {
                    done(error);
                }
            })
            .catch(function (artifact) {
                done(artifact.errors.pop());
            });
    });
    it('Create dictionary', (done) => {
        const html = '<div>Hello</div><div>{[Goodbye]}</div>';
        const options = {
            fileName: 'Compiler/Compiler/Template.wml',
            createResultDictionary: true,
        };
        compiler
            .compile(html, options)
            .then(function (artifact) {
                try {
                    assert.isTrue(artifact.hasOwnProperty('localizedDictionary'));
                    assert.strictEqual(artifact.localizedDictionary[0].type, 'auto');
                    assert.strictEqual(artifact.localizedDictionary[0].key, 'Hello');
                    assert.strictEqual(artifact.localizedDictionary[0].context, '');
                    assert.strictEqual(
                        artifact.localizedDictionary[0].module,
                        'Compiler/Compiler/Template'
                    );

                    assert.strictEqual(artifact.localizedDictionary[1].type, 'manual');
                    assert.strictEqual(artifact.localizedDictionary[1].key, 'Goodbye');
                    assert.strictEqual(artifact.localizedDictionary[1].context, '');
                    assert.strictEqual(
                        artifact.localizedDictionary[1].module,
                        'Compiler/Compiler/Template'
                    );
                    done();
                } catch (error) {
                    done(error);
                }
            })
            .catch(function (artifact) {
                done(artifact.errors.pop());
            });
    });
    it('hasExternalInlineTemplates = false', (done) => {
        const html = '<ws:partial template="inlineTemplate" />';
        const options = {
            fileName: 'Compiler/Compiler/Template.wml',
            fromBuilderTmpl: true,
            hasExternalInlineTemplates: false,
        };
        compiler
            .compile(html, options)
            .then(function () {
                done(new Error('Must be broken'));
                done();
            })
            .catch(function (artifact) {
                try {
                    assert.isFalse(artifact.stable);
                    assert.strictEqual(artifact.nodeName, 'wml!Compiler/Compiler/Template');
                    assert.strictEqual(
                        artifact.errors[0].message,
                        'Template Compiler: Ошибка разбора директивы "ws:partial": шаблон с именем "inlineTemplate" не был определен. Строка: 1, столбец: 13. Модуль: Compiler/Compiler/Template'
                    );
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });
    it('hasExternalInlineTemplates = true', (done) => {
        const html = '<ws:partial template="inlineTemplate" />';
        const options = {
            fileName: 'Compiler/Compiler/Template.wml',
            fromBuilderTmpl: true,
            hasExternalInlineTemplates: true,
        };
        compiler
            .compile(html, options)
            .then(function (artifact) {
                try {
                    assert.isTrue(artifact.stable);
                    assert.strictEqual(artifact.nodeName, 'wml!Compiler/Compiler/Template');
                    assert.strictEqual(typeof artifact.text, 'string');
                    done();
                } catch (error) {
                    done(error);
                }
            })
            .catch(function (artifact) {
                done(artifact.errors.pop());
            });
    });
    it('should compile in default AMD module type', (done) => {
        const html = '<div></div>';
        const options = {
            fileName: 'Compiler/Compiler/Template.wml',
        };
        compiler
            .compile(html, options)
            .then(function (artifact) {
                try {
                    assert.isTrue(artifact.stable);
                    assert.strictEqual(artifact.nodeName, 'wml!Compiler/Compiler/Template');
                    assert.strictEqual(typeof artifact.text, 'string');
                    assert.isNull(artifact.umdText);
                    done();
                } catch (error) {
                    done(error);
                }
            })
            .catch(function (artifact) {
                done(artifact.errors.pop());
            });
    });
    it('should compile in provided UMD module type', (done) => {
        const html = '<div></div>';
        const options = {
            fileName: 'Compiler/Compiler/Template.wml',
            moduleType: 'Umd',
        };
        compiler
            .compile(html, options)
            .then(function (artifact) {
                try {
                    assert.isTrue(artifact.stable);
                    assert.strictEqual(artifact.nodeName, 'wml!Compiler/Compiler/Template');
                    assert.isNull(artifact.text);
                    assert.strictEqual(typeof artifact.umdText, 'string');
                    done();
                } catch (error) {
                    done(error);
                }
            })
            .catch(function (artifact) {
                done(artifact.errors.pop());
            });
    });
    it('should compile in provided AMD and UMD module types', (done) => {
        const html = '<div></div>';
        const options = {
            fileName: 'Compiler/Compiler/Template.wml',
            moduleType: ['AMD', 'UMD'],
        };
        compiler
            .compile(html, options)
            .then(function (artifact) {
                try {
                    assert.isTrue(artifact.stable);
                    assert.strictEqual(artifact.nodeName, 'wml!Compiler/Compiler/Template');
                    assert.strictEqual(typeof artifact.text, 'string');
                    assert.strictEqual(typeof artifact.umdText, 'string');
                    done();
                } catch (error) {
                    done(error);
                }
            })
            .catch(function (artifact) {
                done(artifact.errors.pop());
            });
    });
});
