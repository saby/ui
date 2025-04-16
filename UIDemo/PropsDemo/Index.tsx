import { useState } from 'react';
import { IVar, default as ReactWrapper } from './ReactWrapper';
import { default as WasabyControl } from './WasabyControl';
import { default as ReactControl } from './ReactControl';

const themeVars: IVar = {
    '--primary_color': 'red',
    '--empty_var': ' ',
};

export default function Index(): JSX.Element {
    const [renderWasaby, setRenderWasaby] = useState(false);
    return (
        <div>
            <button
                onClick={() => {
                    setRenderWasaby(!renderWasaby);
                }}
            >
                render {renderWasaby ? 'react' : 'wasaby'}
            </button>
            <ReactWrapper var={themeVars}>
                {renderWasaby ? (
                    <WasabyControl var={themeVars} />
                ) : (
                    <ReactControl var={themeVars} />
                )}
            </ReactWrapper>
        </div>
    );
}
