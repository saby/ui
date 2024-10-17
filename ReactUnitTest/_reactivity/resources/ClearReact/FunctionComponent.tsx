import { useState, useRef } from 'react';
import { Record } from 'Types/entity';
import { useObservableOfVersion } from 'UICore/WasabyReactivity';

interface IFCProps {
    onNewRecord: (recordSetter: (newRecord: Record) => void) => void;
}

function FunctionComponent(props: IFCProps) {
    const [record, setRecord] = useState<Record>();
    props.onNewRecord(setRecord);

    const renderCounter = useRef(0);

    useObservableOfVersion(record);

    return (
        <div>
            <div>{++renderCounter.current}</div>
            <div>{record ? record.get('text') : 'no record'}</div>
        </div>
    );
}

export default FunctionComponent;
