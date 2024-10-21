interface IReactComponentWithAnotherOptionProps {
    className?: string;
    anotherOption: string;
}

export default function ReactComponentWithAnotherOption({
    className,
    anotherOption,
}: IReactComponentWithAnotherOptionProps): JSX.Element {
    return <div className={className}>{`anotherOption: ${anotherOption}`}</div>;
}
