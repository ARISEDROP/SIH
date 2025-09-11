import React from 'react';

interface RippleEffectProps {
    top: string;
    left: string;
}

const RippleEffect: React.FC<RippleEffectProps> = ({ top, left }) => {
    return (
        <>
            <style>{`
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                .animate-ripple {
                    animation: ripple 1s ease-out forwards;
                }
            `}</style>
            <div
                className="absolute w-10 h-10 rounded-full border-2 border-cyan-400 animate-ripple pointer-events-none"
                style={{
                    top: top,
                    left: left,
                    transform: 'translate(-50%, -50%)',
                }}
            />
        </>
    );
};

export default RippleEffect;