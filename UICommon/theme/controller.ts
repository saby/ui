/**
 * Библиотека контроллера тем
 * @remark
 * Контроллер управляет загрузкой/удалением стилей всех контроллов на wasaby-странице на клиенте и СП
 * Подробнее о работе с темами оформления читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/themes/ здесь}.
 * @library UICommon/theme/controller
 * @includes getThemeController UICommon/theme/_controller/Controller#getInstance
 * @includes THEME_TYPE UICommon/theme/_controller/css/const#THEME_TYPE
 * @includes EMPTY_THEME UICommon/theme/_controller/css/const#EMPTY_THEME
 * @includes DEFAULT_THEME UICommon/theme/_controller/css/const#DEFAULT_THEME
 * @public
 */
import { Controller } from './_controller/Controller';
import LinkResolver from './_controller/LinkResolver';
import Loader from './_controller/Loader';

export const getThemeController = Controller.getInstance;
export { TScopeType, TSiteType, TClassList, IActiveTheme } from './_controller/Controller';
export { THEME_TYPE, EMPTY_THEME, DEFAULT_THEME } from './_controller/css/const';
export { LinkResolver, Controller, Loader };
