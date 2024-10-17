export default function Root4(): JSX.Element {
    return (
        <div>
            <input className="input1" type="text" tabIndex={1} placeholder="tabIndex = 1" />
            <input
                className="input2"
                type="text"
                data-qa="Этот сценарий начинается здесь"
                tabIndex={-1}
                placeholder="tabIndex = -1"
            />
            <input className="input3" type="text" tabIndex={0} placeholder="tabIndex = 0" />
            <input className="input4" type="text" tabIndex={2} placeholder="tabIndex = 2" />
        </div>
    );
}
