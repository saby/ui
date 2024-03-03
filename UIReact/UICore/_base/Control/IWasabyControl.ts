/**
 * @kaizen_zone 02c8f38d-c2cb-404c-b89e-3390ac85a128
 */
import type { IFocusConfig } from 'UICommon/Focus';

/**
 * @event UICore/_base/Control/IWasabyControl#activated Происходит при активации контрола.
 * @param {UI/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {UICore/Focus:IFocusChangedConfig} cfg Конфиг события
 * @remark Контрол активируется, когда на один из его DOM-элементов переходит фокус.
 * Подробное описание и примеры использования события читайте
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/focus/ здесь}.
 * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/focus/
 * @see deactivated
 */

/**
 * @event UICore/_base/Control/IWasabyControl#deactivated Происходит при деактивации контрола.
 * @param {UI/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {UICore/Focus:IFocusChangedConfig} cfg Конфиг события
 * @remark Контрол перестает быть активным, когда все его дочерние контролы теряют фокус.
 * Подробное описание и примеры использования события читайте
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/focus/ здесь}.
 * @see activated
 */

/**
 * @name UICore/_base/Control/IWasabyControl#readOnly
 * @cfg { Boolean } Определяет, может ли пользователь изменить значение контрола
 * (или взаимодействовать с контролом, если его значение не редактируется).
 * @variant true Пользователь не может изменить значение контрола (или взаимодействовать с контролом, если его значение не редактируется).
 * @variant false  Пользователь может изменить значение контрола (или взаимодействовать с контролом, если его значение не редактируется).
 * @variant inherited Значение контрола унаследовано от родителя.
 * @default Inherited
 * @example
 * Рассмотрим на примере контролов List и Input. Текст будет отображаться со стилем "только для чтения", и пользователь не сможет его редактировать.
 * Однако у кнопки есть опция readOnly, которая имеет значение false, поэтому кнопка не унаследует эту опцию из списка, и пользователь сможет кликнуть по ней.
 * <pre>
 *   <Controls.list:View readOnly="{{true}}" >
 *     <ws:itemTemplate>
 *       <Controls.input:Text />
 *       <Controls.buttons:Path readOnly="{{false}}" />
 *     </ws:itemTemplate>
 *   </Controls.list:View>
 * </pre>
 * @remark Эта опция наследуется. Если параметр не задан явно, значение параметра наследуется от родительского контрола. По умолчанию все контролы активны.
 * @see Inherited options
 */

/**
 * @name UICore/_base/Control/IWasabyControl#theme
 * @cfg {String} Название {@link /doc/platform/developmentapl/interface-development/themes/ темы оформления}. В зависимости от темы загружаются различные таблицы стилей и применяются различные стили к контролу.
 * @default default
 * @example
 * В следующем примере {@link Controls/Application} и все его дочерние контролы будут иметь стиль темы оформления "carry". Однако контрол Carry.Head будет иметь тему "presto".
 * Если вы поместите контролы в Carry.Head и не укажите опцию theme, они унаследуют ее значение от родителей и тоже построятся в теме "presto".
 * <pre>
 *   <SbisEnvUI.Bootstrap theme="carry">
 *     <Carry.Head theme="presto" />
 *     <Carry.Workspace>
 *       <Controls.Tree />
 *     </Carry.Workspace>
 *   </SbisEnvUI.Bootstrap>
 * </pre>
 * @remark
 * default — это тема оформления "по умолчанию", которая распространяется вместе с исходным кодом контролов Wasaby и используется для их стилевого оформления.
 *
 * Когда значение опции не задано явно, оно будет взято от родительского контрола. Это продемонстрировано в примере.
 *
 * Подробнее о работе с темами оформления читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/themes/ здесь}.
 */

/**
 * @name UICore/_base/Control/IWasabyControl#notLoadThemes
 * @cfg {Boolean} Флаг, который отключает загрузку переменных тем оформления для контролов.
 * @default undefined
 */

/**
 * @public
 */
export default interface IWasabyControl {
    /**
     * Активирует контрол.
     * @returns {Boolean} True - когда фокус был установлен успешно, false - когда фокус не установлен.
     * @example
     * В следующем примере показано, как активировать ввод при нажатии кнопки.
     * <pre>
     *   Control.extend({
     *     ...
     *     _clickHandler() {
     *       this._children.textInput.activate();
     *     }
     *     ...
     *   });
     * </pre>
     *
     * <pre>
     *   <div>
     *     <Button on:click="_clickHandler()" />
     *     <Controls.Input.Text name="textInput" />
     *   </div>
     * </pre>
     * @param {Object} cfg Объект, содержащий параметры этого метода.
     * Используйте параметр enableScreenKeyboard = true на устройствах с экранной клавиатурой, фокус будет установлен на поле ввода и экранная клавиатура будет отображена.
     * Используйте параметр enableScreenKeyboard = false, фокус будет установлен на родительском элементе, а не на полях ввода.
     * @remark Метод находит DOM-элемент внутри контрола (и его дочерних контролов), который может быть сфокусирован и устанавливает на него фокус.
     * Метод возвращает true, если фокус был установлен успешно, false - если фокус не был установлен.
     * Когда контрол становится активным, все его дочерние контролы также становятся активными. Когда контрол активируется, он запускает событие активации.
     * Подробное описание и инструкцию по работе с методом читайте
     * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/focus/ здесь}.
     * @see https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/focus/
     * @see activated
     * @see deactivated
     */
    activate(cfg: IFocusConfig): boolean;
}
