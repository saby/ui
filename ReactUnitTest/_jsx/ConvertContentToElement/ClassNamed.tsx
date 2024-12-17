interface IClassNamedProps {
    className?: string;
}

export default function ClassNamed({ className }: IClassNamedProps): JSX.Element {
    const finalClassName = 'classNamed ' + (className || '');
    return <div className={finalClassName}>ClassNamed</div>;
}
