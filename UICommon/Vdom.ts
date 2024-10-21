// TODO: по-хорошему необходимо разобраться с определениями TOptions, IOptions, TControlOptionsExtended
//  -- все они об одном и том же.
export type { TOptions, IOptions } from './_vdom/Options';

export type { TControlOptionsExtended, TInternalsCollection, TVersionsCollection } from './_vdom/Types';

export { isContentOption } from './_vdom/Types';
export { getChangedOptions, getChangedInternals } from './_vdom/OptionsNew';
export { collectObjectVersions, collectInternalsVersions } from './_vdom/Versions';
