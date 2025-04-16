import { FocusRoot } from 'UI/Focus';
import WasabyWrapper from '../HOC';

export default function ActivationInReact(): JSX.Element {
    return (
        <WasabyWrapper>
            <div>
                <WrongAutofocusChild />
                <EmptyAutofocusChild />
                <CorrectAutofocusChild />
            </div>
        </WasabyWrapper>
    );
}

// ws-autofocus задан просто атрибутом на элементе.
// При активации элемент должен проигнорироваться с ошибкой в консоли.
function WrongAutofocusChild(): JSX.Element {
    return (
        <div data-qa="wrongAutofocusChild" ws-autofocus="true">
            <input type="text" data-qa="insideWrongAutofocusChild" />
        </div>
    );
}

// autofocus задан верно, но внутри нечего фокусировать.
// При активации элемент должен проигнорироваться молча.
function EmptyAutofocusChild(): JSX.Element {
    return (
        // Немного искуственный способ создать пустую активацию.
        // Если на FocusRoot честно задать autofocus={true}  tabIndex={-1}, атрибут ws-autofocus не проставится, поскольку нет смысла.
        <FocusRoot as="div" tabIndex={-1} data-qa="emptyAutofocusChild" ws-autofocus="true">
            Nothing to focus
        </FocusRoot>
    );
}

// Корректно настроенный автофокус.
// При активации должен сфокусироваться элемент внутри.
function CorrectAutofocusChild(): JSX.Element {
    return (
        <FocusRoot as="div" autofocus={true}>
            <input type="text" data-qa="insideCorrectAutofocusChild" />
        </FocusRoot>
    );
}
