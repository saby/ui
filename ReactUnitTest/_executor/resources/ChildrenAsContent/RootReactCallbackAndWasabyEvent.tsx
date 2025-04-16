import ReactWithItemClickCallback from './ReactWithItemClickCallback';
import WasabyWithItemClickEvent from './WasabyWithItemClickEvent';

interface IRootReactCallbackAndWasabyEventProps {
    wasabyEventHandler: Function;
    reactCallbackHandler: Function;
}

export default function RootReactCallbackAndWasabyEvent(
    props: IRootReactCallbackAndWasabyEventProps
): JSX.Element {
    return (
        <div className="rootReactCallbackAndWasabyEvent">
            <WasabyWithItemClickEvent wasabyEventHandler={props.wasabyEventHandler}>
                <ReactWithItemClickCallback onItemClick={props.reactCallbackHandler} />
            </WasabyWithItemClickEvent>
        </div>
    );
}
