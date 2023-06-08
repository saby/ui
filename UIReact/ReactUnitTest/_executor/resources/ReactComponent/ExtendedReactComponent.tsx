import ReactComponent from './ReactComponent';

// Реализация render наследуется от ReactComponent.
export default class ExtendedReactComponent extends ReactComponent {
    protected text: string = 'Is Extended React Component';
}
