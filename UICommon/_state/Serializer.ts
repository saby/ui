import { Serializer } from 'Types/serializer';
import { parse } from 'WasabyLoader/Library';
import * as deserializeTemplate from './TemplateDeserialization';

let compilerIr: {
    deserialize: (result: string) => unknown;
};
function getCompilerIr() {
    if (!compilerIr) {
        compilerIr = require('Compiler/IR');
    }

    return compilerIr;
}

Serializer.pushDeserializePattern({
    patternRegExp: /^TEMPLATEFUNCTOJSON=functio\S\s*\w+/,
    action: deserializeTemplate,
});

Serializer.pushDeserializePattern({
    patternRegExp: /^CONTENT_OPTION,(\d+),/,
    action: function deserializeContentOption(result: string) {
        return getCompilerIr().deserialize(result);
    },
});

Serializer.parseDeclaration = parse;

export { Serializer };
