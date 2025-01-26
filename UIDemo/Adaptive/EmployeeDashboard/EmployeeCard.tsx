import { useAdaptiveMode } from 'UI/Adaptive';

export default function EmployeeCard(props) {
    const adaptiveMode = useAdaptiveMode();
    const isTextVisible = adaptiveMode.container.clientWidth.up(300);

    return (
        <div className={'card'}>
            <img
                className={'card__img tw-left-[0px] @[300px]:tw--left-[50px]'}
                src={props.employee.img}
            />
            {isTextVisible ? (
                <div className={'card__text-container'}>
                    <span className={'card__text'}>{props.employee.name}</span>
                </div>
            ) : (
                <div></div>
            )}
        </div>
    );
}
