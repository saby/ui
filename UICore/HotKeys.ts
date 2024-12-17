/**
 * @kaizen_zone 756abe02-446a-441d-96fd-3b64239d74fc
 */
/**
 * Библиотека горячих клавиш
 * @library UICore/HotKey
 * @includes Dispatcher UICore/_hotKeys/Dispatcher
 * @includes KeyHook UICore/_hotKeys/KeyHook
 * @includes KeyStop UICore/_hotKeys/KeyStop
 * @public
 */
import KeyHook from './_hotKeys/KeyHook';
import Dispatcher from './_hotKeys/Dispatcher';
import KeyStop from './_hotKeys/KeyStop';
import { dispatcherHandler } from './_hotKeys/dispatcherHandler';
export { ISyntheticEvent } from './_hotKeys/dispatcherHandler';

export { KeyHook, Dispatcher, KeyStop, dispatcherHandler };
