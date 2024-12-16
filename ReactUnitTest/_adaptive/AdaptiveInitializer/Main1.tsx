import Layout1 from './Layout1';
import { AdaptiveInitializerConfig } from 'UICore/Adaptive';

export default function Main1() {
    return (
        <AdaptiveInitializerConfig isPhoneForced={true}>
            <Layout1 />
        </AdaptiveInitializerConfig>
    );
}
