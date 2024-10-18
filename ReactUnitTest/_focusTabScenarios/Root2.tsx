import { FocusRoot } from 'UI/Focus';

export default function Root2(): JSX.Element {
    return (
        <FocusRoot as="div" tabIndex={0} className="root2">
            <p>input в корне: </p>
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
        </FocusRoot>
    );
}
