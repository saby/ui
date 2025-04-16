import { TemplateFunction } from 'UI/Base';
import * as React from 'react';
import { DataContext } from './TestContext';
import { IControlOptions } from 'UI/Base';
import { delimitProps } from 'UICore/Jsx';

interface IProps extends IControlOptions {
    selectedItems?: number[];
    content: TemplateFunction;
    attrs: object;
}
interface IState {
    selectedItems: number[];
    setSelectedItems: (selectedItems: number[]) => void;
}

export default class ControllerContextProvider extends React.Component<
    IProps,
    IState
> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            selectedItems: props.selectedItems || [],
            setSelectedItems: (selectedItems) => {
                this.setState({ selectedItems });
            },
        };
    }
    componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (this.props.selectedItems !== prevProps.selectedItems) {
            this.state.setSelectedItems(this.props.selectedItems);
        }
    }
    render(): React.ReactElement {
        const { $wasabyRef, userAttrs, context, events } = delimitProps(
            this.props
        );

        const contentProps = {
            $wasabyRef, // передаем реф для работы wasaby
            context, // передаем контекст для работы еще не переведенных контекстов
            attrs: userAttrs, // передаем атрибуты, которые должны навеситься для работы Wasaby
            ...events, // передаем отфильтрованные подписки на события, которые воспринимает реакт
        };

        return (
            <DataContext.Provider value={this.state}>
                <this.props.content {...contentProps} />
            </DataContext.Provider>
        );
    }
}
