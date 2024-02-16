interface IReactWithItemClickCallbackProps {
    onItemClick: Function;
}

export default function ReactWithItemClickCallback(
    props: IReactWithItemClickCallbackProps
): JSX.Element {
    return <div onClick={() => props.onItemClick()}>reactWithItemClickCallback</div>;
}
