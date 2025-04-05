import WasabyControl from 'ReactUnitTest/_events/resources/WasabyReact/WasabyControl';

export default function ReactControl({ clickFn = () => {} }) {
    function onClickHandler(): void {
        clickFn();
    }
    function onClickHandlerUseArgs(event: Event): void {
        clickFn();
    }
    function onClickHandlerUseArgs2(
        event: Event,
        value: { prop: number }
    ): void {
        clickFn();
    }
    return (
        <div>
            <WasabyControl
                caption="Button"
                onClick={onClickHandler}
                _id="wasabyControl"
            />
            <WasabyControl
                caption="Button"
                onClick={onClickHandlerUseArgs}
                _id="wasabyControlWithArgs"
            />
            <WasabyControl
                caption="Button"
                onClick={(e) => {
                    return onClickHandlerUseArgs2(e, { prop: 0 });
                }}
                _id="wasabyControlWithArgs2"
            />
        </div>
    );
}
