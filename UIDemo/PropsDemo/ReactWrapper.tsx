import { forwardRef, cloneElement } from 'react';

export interface IVar {
    [key: string]: string;
}
interface IStyle {
    [key: string]: string;
}

const Wrapper = forwardRef(
    (props: { var: IVar; children: JSX.Element; style?: IStyle }, ref: any): JSX.Element => {
        let style = props.var;
        if (props.style) {
            style = { ...style, ...props.style };
        }
        const contentProps = {
            ref,
            style,
        };

        return cloneElement(props.children, contentProps);
    }
);
export default Wrapper;
