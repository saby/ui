interface ILinkReactProps {
    target: string;
    href: string;
}

export default function LinkReact(props: ILinkReactProps) {
    return (
        <a href={props.href} target={props.target} className="linkReact">
            Link React
        </a>
    );
}
