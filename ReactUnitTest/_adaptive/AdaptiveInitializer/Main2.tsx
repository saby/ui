import Layout1 from './Layout1';
import { AdaptiveInitializerConfig } from 'UICore/Adaptive';

export default function Main2() {
    return (
        <AdaptiveInitializerConfig isPhoneForced={false}>
            <Layout1 />
        </AdaptiveInitializerConfig>
    );
}
