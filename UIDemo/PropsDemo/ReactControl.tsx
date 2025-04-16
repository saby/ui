import { IVar, default as ReactWrapper } from './ReactWrapper';

export default function ReactControl(props: { var: IVar }): JSX.Element {
    return (
        <div>
            <ReactWrapper var={props.var}>
                <div>React control</div>
            </ReactWrapper>
        </div>
    );
}
