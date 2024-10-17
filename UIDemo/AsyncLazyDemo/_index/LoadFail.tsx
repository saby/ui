import { Async } from 'UI/Async';

export default function LoadFail() {
    return (
        <Async
            componentName="NotExistModule"
            className="UIDemo-AsyncDemo__container demo-AsyncDemo__loadFailContainer"
        />
    );
}
