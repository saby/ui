import WasabyControl from 'ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyControl';
import WasabyControlWithClass from 'ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyControlWithClass';
import WasabyControlHoc from 'ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyControlHoc';
import WasabyWithTemplate from 'ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyWithTemplate';
import WasabyControlHocWithClass from 'ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyControlHocWithClass';
import WasabyWithTemplateWithClass from 'ReactUnitTest/_base/resources/ControlTest/WasabyReact/WasabyWithTemplateWithClass';

export default function ReactControl() {
    return (
        <div>
            <WasabyControl caption="reactClass" className="reactClass" />
            <WasabyControlWithClass
                caption="wasabyClass reactClass"
                className="reactClass"
            />
            <WasabyControlHoc
                caption="wasabyHocClass reactClass"
                className="reactClass"
            />
            <WasabyWithTemplate
                caption="wasabyHocTemplateClass reactClass"
                className="reactClass"
            />
            <WasabyControlHocWithClass
                caption="wasabyClass wasabyHocClass reactClass"
                className="reactClass"
            />
            <WasabyWithTemplateWithClass
                caption="wasabyClass wasabyHocTemplateClass reactClass"
                className="reactClass"
            />
        </div>
    );
}
