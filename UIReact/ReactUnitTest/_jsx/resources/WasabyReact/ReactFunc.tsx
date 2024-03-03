/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import { default as Wasaby } from './Wasaby';

export default function ReactFunc(props) {
    return <Wasaby {...props} additionName="reactFunc" id="reactFunc" />;
}
