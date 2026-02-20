import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="MainVideo"
                component={MainVideo as any}
                durationInFrames={150}
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    title: 'SaaS Factory V3',
                    subtitle: 'Programmatic Video via Remotion',
                    primaryColor: '#059669',
                }}
            />
        </>
    );
};
