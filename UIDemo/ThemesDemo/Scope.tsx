import { useMemo, useState, forwardRef } from 'react';
import createThemeScope from 'UI/theme/context';

export default forwardRef(function Scope(_, ref: React.Ref<HTMLDivElement>) {
    const ThemeScope = useMemo(() => {
        return createThemeScope();
    }, []);

    const [pageId, setPageId] = useState('first');

    return (
        <div ref={ref}>
            <ThemeScope pageId={pageId}>
                <div>
                    <button
                        onClick={() => {
                            setPageId('second');
                        }}
                    >
                        сменить page
                    </button>
                    <br />
                    {pageId}
                </div>
            </ThemeScope>
        </div>
    );
});
