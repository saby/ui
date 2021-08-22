type TRefFuncArgs = [props: Record<string, unknown> | object, ref: object | null];
type TUnpuckWMLArgs = [data: Record<string, unknown> | object, attr: object, context: unknown,
    isVdom: boolean | undefined, sets?: unknown, forceCompatible?: unknown, generatorConfig?: unknown];

const packedAttrs = '__$$packedAttrs';
const prefixAttrs = '__$$attrs_';
const prefixContext = '__$$context_';
const prefixIsVdom = '__$$isvdom';
const prefixSets = '__$$sets_';
const prefixforceCompatible = '__$$forcecompatible';
const prefixGeneratorConfig = '__$$generatorconfig_';

type TPackedArgs = Record<string, unknown> & { [packedAttrs]: Record<string, string[]> } & { [prefixIsVdom]: boolean | undefined };

function packObject(target: TPackedArgs, source: Record<string, unknown>, prefix: string, key: string): void {
    target[prefix + key] = source[key];
    target[packedAttrs][prefix] = (target[packedAttrs][prefix] || []);
    target[packedAttrs][prefix].push(key);
}

function unpackObject(source: TPackedArgs, prefix: string) {
    const founded = source[packedAttrs][prefix];
    if (!founded) {
        return undefined;
    }

    const result: Record<string, unknown> = {};
    founded.forEach?.((key: string) => {
        result[key] = source[prefix + key];
    });
    return result;
}

export function packTemplateAttrs(...args: TUnpuckWMLArgs): TRefFuncArgs {
    const NullRef = null;
    const NonReactAttrCount = 5;
    let isPacked = true;
    for (let i = 1; i <= NonReactAttrCount && isPacked; i++) {
        isPacked = args[i] === undefined;
    }

    if (isPacked) {
        return [
            args[0], args[1]
        ];
    }

    const [data, attr, context, isVdom, sets, forceCompatible, generatorConfig] = args;
    const scope = data || {};
    scope[packedAttrs] = data[packedAttrs] || {};

    if (attr) {
        Object.keys(attr).forEach(packObject.bind(null, scope, attr, prefixAttrs));
    }
    if (context) {
        Object.keys(context).forEach(packObject.bind(null, scope, context, prefixContext));
    }
    scope[prefixIsVdom] = isVdom;
    if (sets) {
        Object.keys(sets).forEach(packObject.bind(null, scope, sets, prefixSets));
    }
    scope[prefixforceCompatible] = forceCompatible;
    if (generatorConfig) {
        Object.keys(generatorConfig).forEach(packObject.bind(null, scope, generatorConfig, prefixGeneratorConfig));
    }

    let ref = NullRef;
    if ('ref' in data) {
        ref = data['ref'];
        delete data['ref'];
    }
    return [scope, ref];
}

export function unpackTemplateAttrs(props: TPackedArgs, ref: object | null): TUnpuckWMLArgs {
    if (!(packedAttrs in props)) {
        return [props, ref, undefined, undefined, undefined, undefined, undefined];
    }

    if (ref) {
        props.ref = ref;
    }

    if (typeof props[packedAttrs] !== 'object') {
        return [props, {}, undefined, undefined, undefined, undefined, undefined];
    }

    const attr = unpackObject(props, prefixAttrs) || {};
    const context = unpackObject(props, prefixContext);
    const isVdom: boolean = props[prefixIsVdom];
    const sets = unpackObject(props, prefixIsVdom);
    const forceCompatible = props[prefixforceCompatible];
    const generatorConfig = unpackObject(props, prefixGeneratorConfig);

    return [props, attr, context, isVdom, sets, forceCompatible, generatorConfig];
}