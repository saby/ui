import { ComponentType, DetailedHTMLProps, InputHTMLAttributes } from 'react';
import { FocusRoot } from 'UI/Focus';

// А мб получится сделать Generic для FocusRoot, чтобы без таких танцев с бубном обходиться?
// С ходу не получилось, FocusRoot = это результат выполнения forwardRef.
type TInputAttributes = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
interface IInputFocusRootProps extends TInputAttributes {
    as: 'input';
}
type TInputFocusRoot = ComponentType<IInputFocusRootProps>;
const InputFocusRoot: TInputFocusRoot = FocusRoot as TInputFocusRoot;

export default function Root1(): JSX.Element {
    return (
        <FocusRoot as="div" cycling={true} tabIndex={0} className="root1">
            <p>input в корне:</p>
            <input className="input1" type="text" tabIndex={2} placeholder="tabIndex = 2" />
            <input className="input2" type="text" tabIndex={1} placeholder="tabIndex = 1" />
            <input className="input3" type="text" tabIndex={3} placeholder="tabIndex = 3" />

            <p>FocusRoot tabIndex = 0:</p>
            <FocusRoot as="div" tabIndex={0}>
                <input className="input4" type="text" tabIndex={3} placeholder="tabIndex = 3" />
                <input className="input5" type="text" tabIndex={2} placeholder="tabIndex = 2" />
                <input className="input6" type="text" tabIndex={1} placeholder="tabIndex = 1" />
            </FocusRoot>

            <p>FocusRoot tabIndex = 4:</p>
            <FocusRoot as="div" tabIndex={4}>
                <input className="input7" type="text" tabIndex={2} placeholder="tabIndex = 2" />
                <input className="input8" type="text" placeholder="no tabIndex" />
                <input className="input9" type="text" tabIndex={1} placeholder="tabIndex = 1" />
            </FocusRoot>

            <p>FocusRoot tabIndex = 0:</p>
            <FocusRoot as="div" tabIndex={0}>
                <div>
                    <span>div:</span>
                    <input className="input10" type="text" placeholder="no tabIndex" />
                </div>

                <div className="div1" tabIndex={0}>
                    <span>div + tabIndex = 0:</span>
                    <input className="input11" type="text" placeholder="no tabIndex" />
                </div>

                <FocusRoot as="div" tabIndex={-1}>
                    <span>FocusRoot:</span>
                    <input className="input12" type="text" placeholder="no tabIndex" />
                </FocusRoot>

                <FocusRoot as="div" className="div2" tabIndex={0}>
                    <span>FocusRoot tabIndex = 0:</span>
                    <input className="input13" type="text" placeholder="no tabIndex" />
                </FocusRoot>

                <FocusRoot as="div" tabIndex={-1}>
                    <span>FocusRoot tabIndex = -1:</span>
                    <input className="input14" type="text" placeholder="no tabIndex" />
                </FocusRoot>

                <FocusRoot as="div" tabIndex={0}>
                    <span>FocusRoot tabIndex = 0:</span>
                    <input className="input15" type="text" placeholder="no tabIndex" />
                </FocusRoot>

                <FocusRoot as="div" tabIndex={-1}>
                    <span>FocusRoot:</span>
                    <input className="input16" type="text" placeholder="no tabIndex" />
                </FocusRoot>

                <FocusRoot as="div" tabIndex={0}>
                    <span>FocusRoot tabIndex = 0:</span>
                    <input className="input17" type="text" placeholder="no tabIndex" />
                </FocusRoot>

                <FocusRoot as="div">
                    <span>FocusRoot tabIndex = 0:</span>
                    <input className="input18" type="text" placeholder="no tabIndex" />
                </FocusRoot>

                <FocusRoot as="div"></FocusRoot>

                <FocusRoot as="div">just some text</FocusRoot>

                <InputFocusRoot as="input" className="input19" type="text" />

                <div className="div3" contentEditable={true}></div>
            </FocusRoot>
        </FocusRoot>
    );
}
