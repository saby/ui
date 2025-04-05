import { AdaptiveModeType, useAdaptiveMode } from 'UI/Adaptive';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Storage } from 'UICore/Adaptive';

const serverMarkup =
    typeof window !== 'undefined' ? document.getElementById('serverMarkup')?.outerHTML : '';

export function CookieDemo(_props: any, ref: React.Ref<any>) {
    const s3ac = JSON.stringify(Storage.getInstance().get());

    const adaptiveMode = useAdaptiveMode();
    const adaptiveModes: React.MutableRefObject<AdaptiveModeType[]> = useRef([]);
    const found = adaptiveModes.current.find((am) => am === adaptiveMode);
    if (!found) {
        adaptiveModes.current.push(adaptiveMode);
    }
    const adaptiveModesString = adaptiveModes.current.map((am) => JSON.stringify(am));

    const myRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (myRef.current) {
            myRef.current.outerHTML = serverMarkup ?? '';
        }
    }, []);
    return (
        <div ref={ref} style={{ width: 1000, height: 1000, wordBreak: 'break-all' }}>
            <div>
                <b>serverMarkup:</b>
            </div>
            <div ref={myRef}></div>
            <br />
            <div>
                <b>clientMarkup:</b>
            </div>
            <div id={'serverMarkup'}>
                <div>s3ac = {s3ac}</div>
                <br />
                {adaptiveModesString.map((am, index) => {
                    return (
                        <div>
                            adaptiveMode {index} = {am}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default React.forwardRef(CookieDemo);
