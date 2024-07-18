/**
 * @author Krylov M.A.
 */

import createFormatter from './generators/Formatter';
import createECMAScriptGenerator from './generators/ECMAScript';
import MarkupGenerator from './generators/Markup';
import Methods from './generators/Methods';
import Generator from './generators/Generator';
import Chain from './generators/Chain';
import EntryPoint from './generators/EntryPoint';
import Symbols from './generators/Symbols';

import {
    MUSTACHE_EXPRESSION_METHODS_PARAMETER,
    TEMPLATE_BODY_GENERATOR_PARAMETER,
    ENTRY_POINT_IDENTIFIER,
    STRINGS_IDENTIFIER
} from './Constants';

const CODE_GENERATOR_VERSION = 1;

export default function createGenerator(
    esVersion: number,
    isRelease: boolean,
    isWmlMode: boolean = true,
    offset: number = 0
): MarkupGenerator {
    const formatter = createFormatter(offset, isRelease);
    const ecmaScript = createECMAScriptGenerator(esVersion);
    const methods = new Methods(formatter, MUSTACHE_EXPRESSION_METHODS_PARAMETER, isRelease);
    const generator = new Generator(formatter, TEMPLATE_BODY_GENERATOR_PARAMETER, isRelease);
    const chain = new Chain(formatter, isRelease);
    const entryPoint = new EntryPoint(formatter, ENTRY_POINT_IDENTIFIER, CODE_GENERATOR_VERSION, isRelease);
    const symbols = new Symbols(STRINGS_IDENTIFIER, isRelease && isWmlMode);

    return new MarkupGenerator(formatter, ecmaScript, methods, generator, chain, entryPoint, symbols, isWmlMode);
}
