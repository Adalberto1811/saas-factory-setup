import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

interface Props {
    title: string;
    subtitle: string;
    primaryColor: string;
}

export const MainVideo: React.FC<Props> = ({ title, subtitle, primaryColor }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(frame, [0, 30], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const scale = interpolate(frame, [0, 30], [0.8, 1], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#0a0a0a',
                color: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'sans-serif',
            }}
        >
            <div
                style={{
                    opacity,
                    transform: `scale(${scale})`,
                    textAlign: 'center',
                }}
            >
                <h1
                    style={{
                        fontSize: 120,
                        fontWeight: 'bold',
                        color: primaryColor,
                        marginBottom: 20,
                    }}
                >
                    {title}
                </h1>
                <p
                    style={{
                        fontSize: 60,
                        color: '#a1a1aa',
                    }}
                >
                    {subtitle}
                </p>
            </div>

            <div
                style={{
                    position: 'absolute',
                    bottom: 100,
                    width: '100%',
                    textAlign: 'center',
                    fontSize: 40,
                    color: '#52525b',
                }}
            >
                Frame: {frame} / Progress: {Math.round((frame / 150) * 100)}%
            </div>
        </AbsoluteFill>
    );
};
