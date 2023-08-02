/**
 * @description Code generation compatible methods
 */

import { genGetScope } from './Generator';
import { genUniteScope, getPlainMergeFunction } from './TClosure';

/**
 * Generate scope="{{ ... }}" substitution.
 */
export function getDotsScopeSubstitution(): string {
    const innerScope = genGetScope('data');
    const outerScope = '{parent: undefined, element: undefined}';
    return (
        genUniteScope(innerScope, outerScope) + `(${getPlainMergeFunction()})`
    );
}
