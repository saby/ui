import { ThemeDesigner, T } from 'UI/Theme';

const bold: 'bold' = 'bold';
export default function () {
    const font = {
        h1: {
            fontSize: '14px',
            fontFamily: 'Tahoma',
            fontWeight: bold,
        },
    };

    return (
        <ThemeDesigner font={font} background={{}} properties={{}} variables={{}}>
            <div>
                <h1>Заголовок</h1>
                Декорируемый контент
            </div>
        </ThemeDesigner>
    );
}
