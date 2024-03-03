export default function ComponentPropsInner(props: { prop: boolean }): JSX.Element {
    return (
        <div>
            <div>Шаблонное свойство == {props.prop === true ? 'true' : 'false'}.</div>
        </div>
    );
}
