import { useContext } from 'react';
import testContext from './testContext';

export default function ContextUser(): JSX.Element {
    const testContextValue = useContext(testContext);
    return <div className="contextUser">Context value: {testContextValue}</div>;
}
