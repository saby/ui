import { useCallback, CSSProperties } from 'react';
import { ElementFinder, IFocusElementProps } from 'UICommon/Focus';
import { FocusRoot } from 'UICore/Focus';

type TCallbackRef = (element: HTMLElement) => void;

interface IProps {
    testingResult: Record<string, IFocusElementProps>;
}
const displayNonStyle: CSSProperties = {
    display: 'none',
};
const visibilityHiddenStyle: CSSProperties = {
    visibility: 'hidden',
};
const emptyStyle: CSSProperties = {};
export default function OneBigTestGetElementProps({ testingResult }: IProps): JSX.Element {
    const updateTestingResult = useCallback<TCallbackRef>(
        (element: HTMLElement) => {
            if (!element) {
                return;
            }
            const dataQa = element.getAttribute('data-qa');
            if (testingResult[dataQa]) {
                throw new Error('Обязательна уникальность data-qa для полного покрытия');
            }
            testingResult[dataQa] = ElementFinder.getElementProps(element);
        },
        [testingResult]
    );
    return (
        <div>
            <InnerComponent
                updateTestingResult={updateTestingResult}
                testingElementStyle={emptyStyle}
            />
            <InnerComponent
                updateTestingResult={updateTestingResult}
                testingElementStyle={displayNonStyle}
                dataQaSuffix="DisplayNone"
            />
            <InnerComponent
                updateTestingResult={updateTestingResult}
                testingElementStyle={visibilityHiddenStyle}
                dataQaSuffix="VisibilityHidden"
            />
        </div>
    );
}

interface IInnerComponentProps {
    updateTestingResult: TCallbackRef;
    dataQaSuffix?: string;
    testingElementStyle: CSSProperties;
}
function InnerComponent({
    updateTestingResult,
    dataQaSuffix = '',
    testingElementStyle,
}: IInnerComponentProps): JSX.Element {
    return (
        <div>
            <div>
                <div
                    style={testingElementStyle}
                    data-qa={`simlpeDiv${dataQaSuffix}`}
                    ref={updateTestingResult}
                />
            </div>
            <div>
                <div
                    tabIndex={1}
                    style={testingElementStyle}
                    data-qa={`tabIndexDiv${dataQaSuffix}`}
                    ref={updateTestingResult}
                />
            </div>
            <div>
                <FocusRoot
                    as="div"
                    style={testingElementStyle}
                    data-qa={`focusRootSimple${dataQaSuffix}`}
                    ref={updateTestingResult}
                />
            </div>
            <div>
                <FocusRoot
                    as="div"
                    cycling="true"
                    style={testingElementStyle}
                    data-qa={`focusRootCycling${dataQaSuffix}`}
                    ref={updateTestingResult}
                />
            </div>
            <div>
                <FocusRoot
                    as="div"
                    contentEditable="true"
                    style={testingElementStyle}
                    data-qa={`focusRootContenteditable${dataQaSuffix}`}
                    ref={updateTestingResult}
                />
            </div>
            <div>
                <a
                    href="/page/"
                    style={testingElementStyle}
                    data-qa={`anchorWithHref${dataQaSuffix}`}
                    ref={updateTestingResult}
                />
            </div>
            <div>
                <a
                    style={testingElementStyle}
                    data-qa={`anchorWithoutHref${dataQaSuffix}`}
                    ref={updateTestingResult}
                />
            </div>
            <div>
                <input
                    type="text"
                    style={testingElementStyle}
                    data-qa={`inputEnabled${dataQaSuffix}`}
                    ref={updateTestingResult}
                />
            </div>
            <div>
                <input
                    type="text"
                    disabled={true}
                    style={testingElementStyle}
                    data-qa={`inputDisabled${dataQaSuffix}`}
                    ref={updateTestingResult}
                />
            </div>
            <div>
                <div
                    contentEditable="true"
                    style={testingElementStyle}
                    data-qa={`divContenteditable${dataQaSuffix}`}
                    ref={updateTestingResult}
                />
            </div>
            <div className="compatible">
                <div
                    className="ws-disabled"
                    style={testingElementStyle}
                    data-qa={`classWsDisabled${dataQaSuffix}`}
                    ref={updateTestingResult}
                ></div>
                <div
                    ws-creates-context="true"
                    style={testingElementStyle}
                    data-qa={`attrWsCreatesContext${dataQaSuffix}`}
                    ref={updateTestingResult}
                ></div>
                <div
                    ws-delegates-tabfocus="true"
                    style={testingElementStyle}
                    data-qa={`attrWsDelegatesTabfocus${dataQaSuffix}`}
                    ref={updateTestingResult}
                ></div>
                <div
                    ws-tab-cycling="true"
                    style={testingElementStyle}
                    data-qa={`attrWsTabCycling${dataQaSuffix}`}
                    ref={updateTestingResult}
                ></div>
            </div>
        </div>
    );
}
