/**
 * @deprecated
 * @description Prepares abstract syntax tree for generating code (bad patch!)
 *
 * FIXME: Данный посетитель выполняет плохой патч дерева Wasaby
 *   для поддержания совместимости между Wasaby-парсерами.
 *   Удалить после реализации остальных фаз анализа и синтеза.
 */

import Scope from './Scope';
import * as Ast from './Ast';
import { shallowClone } from '../utils/Helpers';

interface INavigationContext {
    scope: Scope;
    currentKey: string;
    isBind?: boolean;
    isEvent?: boolean;
    localized?: boolean;
    noEscape?: boolean;
}

function isTemplateType(fullPath: string): boolean {
    const hasTemplatePlugin =
        /^wml!/gi.test(fullPath) ||
        /^(optional!)?tmpl!/gi.test(fullPath) ||
        /^html!/gi.test(fullPath);
    const hasOptionalPlugin = /^optional!/gi.test(fullPath);
    const hasSlashes = fullPath.indexOf('/') > -1;
    return hasTemplatePlugin || (!hasTemplatePlugin && hasOptionalPlugin && !hasSlashes);
}

function createConditionAttributes(node: any): any {
    return {
        data: {
            data: [
                {
                    isBind: false,
                    isEvent: false,
                    localized: false,
                    name: node.wsTest,
                    noEscape: false,
                    type: 'var',
                    value: '',
                },
            ],
            key: undefined,
            type: 'text',
        },
    };
}

class PatchVisitor implements Ast.IAstVisitor<INavigationContext, any> {
    // done.
    visitDoctype(node: Ast.DoctypeNode, context: INavigationContext): any {
        // @ts-ignore
        node.type = 'directive';
        // @ts-ignore
        node.name = '!DOCTYPE';
        // @ts-ignore
        node.data = node.wsData;
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        return node;
    }

    // done.
    visitCData(node: Ast.CDataNode, context: INavigationContext): any {
        // @ts-ignore
        node.type = 'directive';
        // @ts-ignore
        node.name = '![CDATA[';
        // @ts-ignore
        node.data = node.wsData;
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        return node;
    }

    // done.
    visitInstruction(node: Ast.InstructionNode, context: INavigationContext): any {
        // @ts-ignore
        node.type = 'directive';
        // @ts-ignore
        node.name = '?';
        // @ts-ignore
        node.data = node.wsData;
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        return node;
    }

    // done.
    visitComment(node: Ast.CommentNode, context: INavigationContext): any {
        return null;
    }

    // done.
    visitFor(node: Ast.ForNode, context: INavigationContext): any {
        const innerContext: INavigationContext = {
            ...context,
            currentKey: '',
        };
        // @ts-ignore
        node.children = this.visitAll(node.wsContent, innerContext);
        // @ts-ignore
        node.name = 'ws:for';
        // @ts-ignore
        node.originName = 'ws:for';
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.attribs = {
            CUSTOM_CONDITION: {
                data: node.wsTest
                    ? [
                          {
                              isBind: false,
                              isEvent: false,
                              localized: false,
                              name: node.wsTest,
                              noEscape: false,
                              type: 'var',
                              value: '',
                          },
                      ]
                    : {
                          type: 'text',
                          value: '',
                      },
                key: undefined,
                type: 'text',
            },
            CUSTOM_ITERATOR: {
                data: node.wsUpdate
                    ? [
                          {
                              isBind: false,
                              isEvent: false,
                              localized: false,
                              name: node.wsUpdate,
                              noEscape: false,
                              type: 'var',
                              value: '',
                          },
                      ]
                    : {
                          type: 'text',
                          value: '',
                      },
                key: undefined,
                type: 'text',
            },
            START_FROM: {
                data: node.wsInit
                    ? [
                          {
                              isBind: false,
                              isEvent: false,
                              localized: false,
                              name: node.wsInit,
                              noEscape: false,
                              type: 'var',
                              value: '',
                          },
                      ]
                    : {
                          type: 'text',
                          value: '',
                      },
                key: undefined,
                type: 'text',
            },
        };
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        if (node.wsInternal) {
            // @ts-ignore
            node.internal = this.copyInternal(node.wsInternal, context);
        }
        return node;
    }

    // done.
    visitForeach(node: Ast.ForeachNode, context: INavigationContext): any {
        const innerContext: INavigationContext = {
            ...context,
            currentKey: '',
        };
        // @ts-ignore
        node.children = this.visitAll(node.wsContent, innerContext);
        // @ts-ignore
        node.name = 'ws:for';
        // @ts-ignore
        node.originName = 'ws:for';
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.key = context.currentKey;
        const forSource = node.wsIndex
            ? `${node.wsIndex.string}, ${node.wsIterator.string} in ${node.wsCollection.string}`
            : `${node.wsIterator.string} in ${node.wsCollection.string}`;
        // @ts-ignore
        node.attribs = {
            data: {
                data: {
                    type: 'text',
                    value: forSource,
                },
                key: undefined,
                type: 'text',
            },
        };
        // @ts-ignore
        node.forSource = {
            key: node.wsIndex ? node.wsIndex.string : undefined,
            value: node.wsIterator.string,
            main: node.wsCollection,
        };
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        if (node.wsInternal) {
            // @ts-ignore
            node.internal = this.copyInternal(node.wsInternal, context);
        }
        return node;
    }

    // done.
    visitText(node: Ast.TextNode, context: INavigationContext): any {
        const textContext = {
            isBind: false,
            isEvent: false,
            localized: false,
            noEscape: false,
            ...context,
        };
        const content = this.visitAll(node.wsContent, textContext);
        // @ts-ignore
        node.data =
            node.wsContent.length === 1 && node.wsContent[0] instanceof Ast.TextDataNode
                ? content[0]
                : content;
        // @ts-ignore
        node.type = 'text';
        // @ts-ignore
        node.key = context.currentKey;
        return node;
    }

    // done.
    visitTextData(node: Ast.TextDataNode, context: INavigationContext): any {
        // @ts-ignore
        node.type = 'text';
        // @ts-ignore
        node.value = node.wsContent;
        return node;
    }

    // done.
    visitExpression(node: Ast.ExpressionNode, context: INavigationContext): any {
        // @ts-ignore
        node.isBind = !!context.isBind;
        // @ts-ignore
        node.isEvent = !!context.isEvent;
        // @ts-ignore
        node.localized = !!context.localized;
        // @ts-ignore
        node.noEscape = !!context.noEscape;
        // @ts-ignore
        node.name = node.wsProgram;
        // @ts-ignore
        node.value = '';
        // @ts-ignore
        node.type = 'var';
        return node;
    }

    // done.
    visitTranslation(node: Ast.TranslationNode, context: INavigationContext): any {
        // @ts-ignore
        node.localized = true;
        // @ts-ignore
        node.name = node.wsContext ? `${node.wsContext} @@ ${node.wsText}` : node.wsText;
        // @ts-ignore
        node.type = 'var';
        // @ts-ignore
        node.value = undefined;
        return node;
    }

    // done.
    visitAll(nodes: Ast.Ast[], context: INavigationContext): any {
        const children = [];
        for (let i = 0; i < nodes.length; ++i) {
            const childContext: INavigationContext = {
                ...context,
                currentKey: context.currentKey + nodes[i].wsKey + '_',
            };
            const child = nodes[i].accept(this, childContext);
            if (nodes[i].wsInternal) {
                // @ts-ignore
                child.internal = this.copyInternal(nodes[i].wsInternal, context);
            }
            if (child) {
                children.splice(nodes[i].wsKey, child, child);
            }
        }
        return children;
    }

    // done.
    visitTemplate(node: Ast.TemplateNode, context: INavigationContext): any {
        // @ts-ignore
        node.children = this.visitAll(node.wsContent, context);
        // @ts-ignore
        node.attribs = {
            name: node.wsName,
        };
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = 'ws:template';
        // @ts-ignore
        node.originName = 'ws:template';
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        if (node.wsInternal) {
            // @ts-ignore
            node.internal = this.copyInternal(node.wsInternal, context);
        }
        return node;
    }

    // done.
    visitElement(node: Ast.ElementNode, context: INavigationContext): any {
        // @ts-ignore
        node.children = this.visitAll(node.wsContent, context);
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.name = node.wsName;
        // @ts-ignore
        node.originName = node.wsName;
        // @ts-ignore
        node.key = context.currentKey;
        const attribs = this.getElementAttributesCollection(node, context);
        // @ts-ignore
        node.attribs = Object.keys(attribs).length === 0 ? undefined : attribs;
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        if (node.wsInternal) {
            // @ts-ignore
            node.internal = this.copyInternal(node.wsInternal, context);
        }
        return node;
    }

    // done.
    visitAttribute(node: Ast.AttributeNode, context: INavigationContext): any {
        const attributeContext: INavigationContext = {
            ...context,
            isBind: false,
            isEvent: false,
            localized: false,
            noEscape: false,
        };
        const attributeValue = this.visitAll(node.wsValue, attributeContext);
        // @ts-ignore
        node.data =
            node.wsValue.length === 1 && node.wsValue[0] instanceof Ast.TextDataNode
                ? attributeValue[0]
                : attributeValue;
        // @ts-ignore
        node.key = undefined;
        // @ts-ignore
        node.type = 'text';
        return node;
    }

    // done.
    visitBind(node: Ast.BindNode, context: INavigationContext): any {
        // @ts-ignore
        node.data = [
            {
                // FIXME: legacy behaviour = always false for property 'isBind'
                isBind: false,
                isEvent: false,
                localized: false,
                name: node.wsValue,
                noEscape: false,
                type: 'var',
                value: '',
            },
        ];
        // @ts-ignore
        node.property = true;
        // @ts-ignore
        node.type = 'text';
        return node;
    }

    // done.
    visitEvent(node: Ast.EventNode, context: INavigationContext): any {
        // @ts-ignore
        node.data = [
            {
                isBind: false,
                isEvent: true,
                localized: false,
                name: node.wsHandler,
                noEscape: false,
                type: 'var',
                value: '',
            },
        ];
        // @ts-ignore
        node.property = true;
        // @ts-ignore
        node.type = 'text';
        return node;
    }

    // done.
    visitIf(node: Ast.IfNode, context: INavigationContext): any {
        // @ts-ignore
        node.children = this.visitAll(node.wsConsequent, context);
        // @ts-ignore
        node.attribs = createConditionAttributes(node);
        // @ts-ignore
        node.name = 'ws:if';
        // @ts-ignore
        node.originName = 'ws:if';
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        if (node.wsInternal) {
            // @ts-ignore
            node.internal = this.copyInternal(node.wsInternal, context);
        }
        return node;
    }

    // done.
    visitElse(node: Ast.ElseNode, context: INavigationContext): any {
        // @ts-ignore
        node.children = this.visitAll(node.wsConsequent, context);
        // @ts-ignore
        node.attribs = node.wsTest ? createConditionAttributes(node) : undefined;
        // @ts-ignore
        node.name = 'ws:else';
        // @ts-ignore
        node.originName = 'ws:else';
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        if (node.wsInternal) {
            // @ts-ignore
            node.internal = this.copyInternal(node.wsInternal, context);
        }
        return node;
    }

    // done.
    visitOption(node: Ast.OptionNode, context: INavigationContext): any {
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = `ws:${node.wsName}`;
        // @ts-ignore
        node.originName = `ws:${node.wsName}`;
        // @ts-ignore
        node.type = 'tag';
        const optionValue = node.wsValue;
        if (optionValue.hasFlag(Ast.Flags.TYPE_CASTED)) {
            const patchedOptionValue = optionValue.accept(this, context);
            // @ts-ignore
            node.attribs = patchedOptionValue.attribs;
            // @ts-ignore
            node.children = patchedOptionValue.children;
            // @ts-ignore
            node.isRootTag = node.wsIsRootComponentNode;
            return node;
        }
        // @ts-ignore
        node.children = this.visitAll([node.wsValue], context);
        // @ts-ignore
        node.attribs = undefined;
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        return node;
    }

    // done.
    visitContentOption(node: Ast.ContentOptionNode, context: INavigationContext): any {
        let attributes;
        if (node.wsIsStringType) {
            attributes = {
                type: {
                    data: {
                        value: 'string',
                        type: 'text',
                    },
                    key: undefined,
                    type: 'text',
                },
            };
        }
        // @ts-ignore
        node.children = this.visitAll(node.wsContent, context);
        // @ts-ignore
        node.attribs = attributes;
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = `ws:${node.wsName}`;
        // @ts-ignore
        node.originName = `ws:${node.wsName}`;
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        if (node.wsInternal) {
            // @ts-ignore
            node.internal = this.copyInternal(node.wsInternal, context);
        }
        // @ts-ignore
        node.isContentOption = true;
        return node;
    }

    // done.
    visitComponent(node: Ast.ComponentNode, context: INavigationContext): any {
        // @ts-ignore
        node.attribs = this.getComponentAttributesCollection(node, context);
        if (node.wsPath.hasLogicalPath()) {
            // @ts-ignore
            node.children = [
                {
                    constructor: node.wsPath.getFullPath(),
                    key: undefined,
                    library: node.wsPath.getFullPhysicalPath(),
                    module: node.wsPath.getLogicalPath(),
                    type: 'module',
                },
            ];
            // @ts-ignore
            node.attribs._wstemplatename = node.wsPath.getFullPath();
        } else {
            // @ts-ignore
            node.children = [
                {
                    constructor: node.wsPath.getFullPath(),
                    fn: node.wsPath.getFullPath(),
                    key: undefined,
                    optional: undefined,
                    type: 'control',
                },
            ];
            // @ts-ignore
            node.attribs._wstemplatename = node.wsPath.getFullPath();
        }
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = `ws:${node.wsPath.getFullPath()}`;
        // @ts-ignore
        node.originName = node.wsPath.getFullPath().replace('/', '.');
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.injectedData = this.collectContents(node, context);
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        if (node.wsInternal) {
            // @ts-ignore
            node.internal = this.copyInternal(node.wsInternal, context);
        }
        return node;
    }

    // done.
    visitArray(node: Ast.ArrayNode, context: INavigationContext): any {
        // @ts-ignore
        node.attribs = undefined;
        if (node.hasFlag(Ast.Flags.TARGET_TYPE_CASTED)) {
            // @ts-ignore
            node.attribs = {
                type: {
                    data: {
                        type: 'text',
                        value: 'array',
                    },
                    key: undefined,
                    type: 'text',
                },
            };
        }
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = 'ws:Array';
        // @ts-ignore
        node.originName = 'ws:Array';
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.children = this.visitAll(node.wsElements, context);
        return node;
    }

    // done.
    visitBoolean(node: Ast.BooleanNode, context: INavigationContext): any {
        // @ts-ignore
        node.attribs = undefined;
        if (node.hasFlag(Ast.Flags.TARGET_TYPE_CASTED)) {
            // @ts-ignore
            node.attribs = {
                type: {
                    data: {
                        type: 'text',
                        value: 'boolean',
                    },
                    key: undefined,
                    type: 'text',
                },
            };
        }
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = 'ws:Boolean';
        // @ts-ignore
        node.originName = 'ws:Boolean';
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.children = [
            {
                data: this.visitAll(node.wsData, context),
                key: context.currentKey + '0_',
                type: 'text',
            },
        ];
        return node;
    }

    // done.
    visitFunction(node: Ast.FunctionNode, context: INavigationContext): any {
        const chain = [];
        if (node.hasFlag(Ast.Flags.TARGET_TYPE_CASTED)) {
            chain.push({
                node: {
                    data: {
                        type: 'text',
                        value: 'function',
                    },
                    key: undefined,
                    type: 'text',
                },
                name: 'type',
            });
        }
        // eslint-disable-next-line guard-for-in
        for (const optionName in node.wsOptions) {
            const option = node.wsOptions[optionName];
            const optionValue = (<Ast.ValueNode>option.wsValue).accept(this, context);
            const content = optionValue.wsData;
            const hasTextOnly = content.length === 1 && content[0] instanceof Ast.TextDataNode;
            const processedNode = {
                node: {
                    data: hasTextOnly ? content[0] : content,
                    key: undefined,
                    type: 'text',
                },
                name: optionName,
            };
            chain.splice(option.wsKey, 0, processedNode);
        }
        // @ts-ignore
        node.attribs = undefined;
        if (chain.length > 0) {
            // @ts-ignore
            node.attribs = {};
            for (let index = 0; index < chain.length; ++index) {
                const item = chain[index];
                // @ts-ignore
                node.attribs[item.name] = item.node;
            }
        }
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = 'ws:Function';
        // @ts-ignore
        node.originName = 'ws:Function';
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.children = [
            {
                data: this.visitAll(node.wsFunction, context),
                key: context.currentKey + '0_',
                type: 'text',
            },
        ];
        return node;
    }

    // done.
    visitNumber(node: Ast.NumberNode, context: INavigationContext): any {
        // @ts-ignore
        node.attribs = undefined;
        if (node.hasFlag(Ast.Flags.TARGET_TYPE_CASTED)) {
            // @ts-ignore
            node.attribs = {
                type: {
                    data: {
                        type: 'text',
                        value: 'number',
                    },
                    key: undefined,
                    type: 'text',
                },
            };
        }
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = 'ws:Number';
        // @ts-ignore
        node.originName = 'ws:Number';
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.children = [
            {
                data: this.visitAll(node.wsData, context),
                key: context.currentKey + '0_',
                type: 'text',
            },
        ];
        return node;
    }

    // done.
    visitObject(node: Ast.ObjectNode, context: INavigationContext): any {
        const initChain = [];
        if (node.hasFlag(Ast.Flags.TARGET_TYPE_CASTED)) {
            initChain.push({
                node: {
                    data: {
                        type: 'text',
                        value: 'object',
                    },
                    key: undefined,
                    type: 'text',
                },
                name: 'type',
            });
        }
        // @ts-ignore
        node.attribs = this.collectObjectAttributeProperties(node, context, initChain);
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = 'ws:Object';
        // @ts-ignore
        node.originName = 'ws:Object';
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.children = this.collectObjectProperties(node, context);
        return node;
    }

    // done.
    visitString(node: Ast.StringNode, context: INavigationContext): any {
        // @ts-ignore
        node.attribs = undefined;
        if (node.hasFlag(Ast.Flags.TARGET_TYPE_CASTED)) {
            // @ts-ignore
            node.attribs = {
                type: {
                    data: {
                        type: 'text',
                        value: 'string',
                    },
                    key: undefined,
                    type: 'text',
                },
            };
        }
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = 'ws:String';
        // @ts-ignore
        node.originName = 'ws:String';
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.children = [
            {
                data: this.visitAll(node.wsData, context),
                key: context.currentKey + '0_',
                type: 'text',
            },
        ];
        return node;
    }

    // done.
    visitValue(node: Ast.ValueNode, context: INavigationContext): any {
        // @ts-ignore
        node.attribs = undefined;
        if (node.hasFlag(Ast.Flags.TARGET_TYPE_CASTED)) {
            // @ts-ignore
            node.attribs = {
                type: {
                    data: {
                        type: 'text',
                        value: 'value',
                    },
                    key: undefined,
                    type: 'text',
                },
            };
        }
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = 'ws:Value';
        // @ts-ignore
        node.originName = 'ws:Value';
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.children = [
            {
                data: this.visitAll(node.wsData, context),
                key: context.currentKey + '0_',
                type: 'text',
            },
        ];
        return node;
    }

    // done.
    visitInlineTemplate(node: Ast.InlineTemplateNode, context: INavigationContext): any {
        const initChain = [
            {
                node: {
                    data: {
                        type: 'text',
                        value: node.wsName,
                    },
                    key: undefined,
                    type: 'text',
                },
                name: 'template',
            },
        ];
        // @ts-ignore
        node.attribs = this.getComponentAttributesCollection(node, context, initChain);
        // @ts-ignore
        node.attribs._wstemplatename = {
            data: {
                type: 'text',
                value: node.wsName,
            },
            key: undefined,
            type: 'text',
        };
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = 'ws:partial';
        // @ts-ignore
        node.originName = 'ws:partial';
        // @ts-ignore
        node.type = 'tag';
        // @ts-ignore
        node.children = [];
        if (context.scope.hasTemplate(node.wsName)) {
            // If template was processed with option hasExternalInlineTemplates
            const inlineTemplate = context.scope.getTemplate(node.wsName);
            // @ts-ignore
            node.children = inlineTemplate.wsContent;
        }
        const innerContext: INavigationContext = {
            ...context,
            currentKey: '',
        };
        const injectedData = this.collectContents(node, innerContext);
        if (injectedData.length > 0) {
            // @ts-ignore
            node.injectedData = injectedData;
        }
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        if (node.wsInternal) {
            // @ts-ignore
            node.internal = this.copyInternal(node.wsInternal, context);
        }
        return node;
    }

    // done.
    visitStaticPartial(node: Ast.StaticPartialNode, context: INavigationContext): any {
        const initChain = [
            {
                node: {
                    data: {
                        type: 'text',
                        value: node.wsPath.getFullPath(),
                    },
                    key: undefined,
                    type: 'text',
                },
                name: 'template',
            },
        ];
        // @ts-ignore
        node.attribs = this.getComponentAttributesCollection(node, context, initChain);
        if (isTemplateType(node.wsPath.getFullPath())) {
            // @ts-ignore
            node.attribs._wstemplatename = {
                data: {
                    type: 'text',
                    value: node.wsPath.getFullPath(),
                },
                key: undefined,
                type: 'text',
            };
            // @ts-ignore
            node.children = [
                {
                    fn: node.wsPath.getFullPath(),
                    key: undefined,
                    optional: undefined,
                    type: 'template',
                },
            ];
        } else if (node.wsPath.hasLogicalPath()) {
            // @ts-ignore
            node.attribs._wstemplatename = node.wsPath.getFullPath();
            // @ts-ignore
            node.children = [
                {
                    constructor: node.wsPath.getFullPath(),
                    key: undefined,
                    library: node.wsPath.getFullPhysicalPath(),
                    module: node.wsPath.getLogicalPath(),
                    type: 'module',
                },
            ];
        } else {
            // @ts-ignore
            node.attribs._wstemplatename = node.wsPath.getFullPath();
            // @ts-ignore
            node.children = [
                {
                    constructor: node.wsPath.getFullPath(),
                    fn: node.wsPath.getFullPath(),
                    key: undefined,
                    optional: undefined,
                    type: 'control',
                },
            ];
        }
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = 'ws:partial';
        // @ts-ignore
        node.originName = 'ws:partial';
        // @ts-ignore
        node.type = 'tag';
        const innerContext: INavigationContext = {
            ...context,
            currentKey: '',
        };
        // @ts-ignore
        node.injectedData = this.collectContents(node, innerContext);
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        if (node.wsInternal) {
            // @ts-ignore
            node.internal = this.copyInternal(node.wsInternal, context);
        }
        return node;
    }

    // done.
    visitDynamicPartial(node: Ast.DynamicPartialNode, context: INavigationContext): any {
        const injectedTemplate = {
            isBind: false,
            isEvent: false,
            localized: false,
            name: node.wsExpression,
            noEscape: false,
            type: 'var',
            value: '',
        };
        const initChain = [
            {
                node: {
                    data: [injectedTemplate],
                    key: undefined,
                    type: 'text',
                },
                name: 'template',
            },
        ];
        // @ts-ignore
        node.attribs = this.getComponentAttributesCollection(node, context, initChain);
        // @ts-ignore
        node.attribs._wstemplatename = {
            data: [injectedTemplate],
            key: undefined,
            type: 'text',
        };
        // @ts-ignore
        node.injectedTemplate = injectedTemplate;
        // @ts-ignore
        node.key = context.currentKey;
        // @ts-ignore
        node.name = 'ws:partial';
        // @ts-ignore
        node.originName = 'ws:partial';
        // @ts-ignore
        node.type = 'tag';
        const innerContext: INavigationContext = {
            ...context,
            currentKey: '',
        };
        const children = this.collectContents(node, innerContext);
        // @ts-ignore
        node.children = children;
        // @ts-ignore
        node.injectedData = children;
        // @ts-ignore
        node.isRootTag = node.wsIsRootComponentNode;
        if (node.wsInternal) {
            // @ts-ignore
            node.internal = this.copyInternal(node.wsInternal, context);
        }
        return node;
    }

    // done.
    private getElementAttributesCollection(
        node: Ast.BaseHtmlElement,
        context: INavigationContext
    ): any {
        const attributes = {};
        const chain = this.processAttributesAndEvents(node, context);
        chain.sort((prev: any, next: any) => {
            return prev.key - next.key;
        });
        chain.forEach((element: any) => {
            attributes[element.name] = element.node;
        });
        return attributes;
    }

    // done.
    private getComponentAttributesCollection(
        node: Ast.BaseWasabyElement,
        context: INavigationContext,
        initChain?: any[]
    ): any {
        const attributes = {};
        const chain = this.processAttributesAndEvents(node, context);
        // eslint-disable-next-line guard-for-in
        for (const name in node.wsOptions) {
            const option = node.wsOptions[name];
            if (!option.hasFlag(Ast.Flags.UNPACKED)) {
                continue;
            }
            const optionValue = (<Ast.ValueNode>option.wsValue).wsData;
            const isTextOnly =
                optionValue.length === 1 && optionValue[0] instanceof Ast.TextDataNode;
            const dataArray = this.visitAll(optionValue, context);
            const processedOption = {
                node: {
                    data: isTextOnly ? dataArray[0] : dataArray,
                    key: undefined,
                    type: 'text',
                },
                key: option.wsKey,
                name,
            };
            chain.push(processedOption);
        }
        if (Array.isArray(initChain)) {
            initChain.forEach((element: any) => {
                attributes[element.name] = element.node;
            });
        }
        chain.sort((prev: any, next: any) => {
            return prev.key - next.key;
        });
        chain.forEach((element: any) => {
            attributes[element.name] = element.node;
        });
        return attributes;
    }

    // done.
    private collectContents(node: Ast.BaseWasabyElement, context: INavigationContext): any[] {
        const injectedData = [];
        // eslint-disable-next-line guard-for-in
        for (const optionName in node.wsOptions) {
            const option = node.wsOptions[optionName];
            if (option.hasFlag(Ast.Flags.UNPACKED)) {
                continue;
            }
            const childContext: INavigationContext = {
                ...context,
                currentKey: context.currentKey + option.wsKey + '_',
            };
            const injectedNode = option.accept(this, childContext);
            if (injectedNode) {
                injectedData.splice(option.wsKey, 0, injectedNode);
            }
        }
        // eslint-disable-next-line guard-for-in
        for (const optionName in node.wsContents) {
            const content = node.wsContents[optionName];
            const childContext: INavigationContext = {
                ...context,
                currentKey: context.currentKey + content.wsKey + '_',
            };
            const contentNode = content.accept(this, childContext);
            if (contentNode) {
                injectedData.splice(content.wsKey, 0, contentNode);
            }
        }
        return injectedData;
    }

    // done.
    private collectObjectAttributeProperties(
        node: Ast.ObjectNode,
        context: INavigationContext,
        initChain: any
    ): any {
        const chain = initChain;
        // eslint-disable-next-line guard-for-in
        for (const optionName in node.wsProperties) {
            const originProperty = node.wsProperties[optionName];
            if (!originProperty.hasFlag(Ast.Flags.UNPACKED)) {
                continue;
            }
            const property = <Ast.OptionNode>originProperty;
            const propertyValue = (<Ast.ValueNode>property.wsValue).wsData;
            const isTextOnly =
                propertyValue.length === 1 && propertyValue[0] instanceof Ast.TextDataNode;
            const dataArray = this.visitAll(propertyValue, context);
            const processedOption = {
                node: {
                    data: isTextOnly ? dataArray[0] : dataArray,
                    key: undefined,
                    type: 'text',
                },
                name: optionName,
            };
            chain.splice(property.wsKey, 0, processedOption);
        }
        if (chain.length === 0) {
            return undefined;
        }
        const properties = {};
        for (let index = 0; index < chain.length; ++index) {
            const item = chain[index];
            properties[item.name] = item.node;
        }
        return properties;
    }

    // done.
    private collectObjectProperties(node: Ast.ObjectNode, context: INavigationContext): any {
        const injectedData = [];
        // eslint-disable-next-line guard-for-in
        for (const optionName in node.wsProperties) {
            const originProperty = node.wsProperties[optionName];
            if (originProperty.hasFlag(Ast.Flags.UNPACKED)) {
                continue;
            }
            const childContext: INavigationContext = {
                ...context,
                currentKey: context.currentKey + originProperty.wsKey + '_',
            };
            const property = originProperty.accept(this, childContext);
            if (property) {
                injectedData.splice(originProperty.wsKey, 0, property);
            }
        }
        return injectedData;
    }

    // done.
    private copyInternal(internal: Ast.IInternal, context: INavigationContext): any {
        const copy = {};
        // eslint-disable-next-line guard-for-in
        for (const property in internal) {
            internal[property].data.forEach((expression: Ast.ExpressionNode) => {
                expression.accept(this, context);
            });
            copy[property] = shallowClone(internal[property]);
        }
        return copy;
    }

    // done.
    private processAttributesAndEvents(
        node: Ast.BaseHtmlElement,
        context: INavigationContext
    ): any {
        const chain = [];
        // eslint-disable-next-line guard-for-in
        for (const attributeName in node.wsAttributes) {
            const attribute = node.wsAttributes[attributeName];
            // rm prefix for elements only
            const cleanName = attributeName.replace('attr:', '');
            const name = !attribute.wsHasAttributePrefix ? cleanName : attributeName;
            const processedAttribute = {
                node: attribute.accept(this, context),
                key: attribute.wsKey,
                name,
            };
            chain.push(processedAttribute);
        }
        // eslint-disable-next-line guard-for-in
        for (const name in node.wsEvents) {
            const event = node.wsEvents[name];
            const processedEvent = {
                node: event.accept(this, context),
                key: event.wsKey,
                name,
            };
            chain.push(processedEvent);
        }
        return chain;
    }
}

export default function patch(nodes: Ast.Ast[], scope: Scope): Ast.Ast[] {
    const visitor = new PatchVisitor();
    const context: INavigationContext = {
        scope,
        currentKey: '',
    };
    return visitor.visitAll(nodes, context);
}
