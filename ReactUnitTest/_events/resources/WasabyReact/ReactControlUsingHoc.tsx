import WasabyControlHoc from 'ReactUnitTest/_events/resources/WasabyReact/WasabyControlHoc';
import WasabyWithTemplate from 'ReactUnitTest/_events/resources/WasabyReact/WasabyWithTemplate';

export default function ReactControlUsingHoc({ clickFn = () => {} }) {
    function onClickHandler(value: string): void {
        clickFn();
    }
    function onMouseDown(): void {
        clickFn();
    }
    return (
        <div>
            <WasabyControlHoc
                caption="Button"
                onClick={() => {
                    return onClickHandler('abc');
                }}
                _id="wasabyControlHoc"
                onMouseDown={onMouseDown}
            />
            <WasabyWithTemplate
                caption="Button"
                onClick={() => {
                    return onClickHandler('abc');
                }}
                _id="wasabyControlTemplate"
                onMouseDown={onMouseDown}
            />
        </div>
    );
}
