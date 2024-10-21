interface IReactUnput {
    inputId?: string;
}

function ReactInput(props: IReactUnput) {
    return (
        <div>
            <input type="text" id={props.inputId} />
        </div>
    );
}

ReactInput.defaultProps = {
    inputId: 'reactInput',
};

export default ReactInput;
