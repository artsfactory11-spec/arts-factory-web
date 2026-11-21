'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture, PerspectiveCamera, useProgress } from '@react-three/drei';

function ArtworkPlane({ url, width = 1, height = 1 }: { url: string; width?: number; height?: number }) {
    const texture = useTexture(url);

    return (
        <mesh position={[0, 1.5, 0.05]} castShadow receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial map={texture} roughness={0.3} metalness={0.05} />
        </mesh>
    );
}

function GalleryEnvironment() {
    return (
        <group>
            {/* Wall */}
            <mesh position={[0, 1.5, 0]} receiveShadow>
                <planeGeometry args={[10, 5]} />
                <meshStandardMaterial color="#f8f8f8" roughness={0.6} />
            </mesh>
            {/* Floor */}
            <mesh position={[0, 0, 2.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[10, 5]} />
                <meshStandardMaterial color="#e8e6e3" roughness={0.7} />
            </mesh>
        </group>
    );
}

function LoadingOverlay() {
    const { active, progress } = useProgress();

    if (!active && progress === 100) return null;

    return (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-100/90 backdrop-blur-sm transition-opacity duration-300 pointer-events-none">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-charcoal tracking-tight">갤러리 공간을 준비하고 있습니다...</p>
            <span className="text-xs sm:text-sm text-gray-500 mt-1 font-mono">
                {Math.round(progress)}%
            </span>
        </div>
    );
}

interface VRViewerProps {
    imageUrl: string;
    artworkTitle: string;
    sizeDesc?: string;
}

export default function VRViewer({ imageUrl, artworkTitle, sizeDesc }: VRViewerProps) {
    // 사이즈 설명에서 대략적인 비율 추출 (예: "53 x 45.5cm")
    const getRatio = () => {
        if (!sizeDesc) return { w: 1, h: 1.2 };
        const matches = sizeDesc.match(/(\d+\.?\d*)/g);
        if (matches && matches.length >= 2) {
            const w = parseFloat(matches[0]);
            const h = parseFloat(matches[1]);
            const max = Math.max(w, h);
            return { w: (w / max) * 1.5, h: (h / max) * 1.5 };
        }
        return { w: 1, h: 1.2 };
    };

    const { w, h } = getRatio();

    return (
        <div className="w-full h-[600px] bg-gray-100 rounded-3xl lg:rounded-[40px] overflow-hidden relative border border-gray-100 shadow-inner">
            <div className="absolute top-8 left-8 z-10">
                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-gray-500 mb-1">Virtual Preview</h3>
                <p className="text-lg font-serif text-charcoal">{artworkTitle}</p>
            </div>

            <LoadingOverlay />

            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 1.5, 4]} />
                
                {/* 자체 조명 구성: 외부 HDR 환경맵 제거 */}
                <ambientLight intensity={0.8} />
                <directionalLight
                    position={[5, 8, 5]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <pointLight position={[-5, 5, 5]} intensity={0.4} />

                <Suspense fallback={null}>
                    <group>
                        <GalleryEnvironment />
                        <ArtworkPlane url={imageUrl} width={w} height={h} />
                    </group>
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    minDistance={2}
                    maxDistance={6}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.8}
                />
            </Canvas>

            <div className="absolute bottom-8 right-8 z-10 flex gap-4">
                <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-tighter text-gray-700 border border-white/20 shadow-sm">
                    Drag to Rotate
                </div>
                <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-tighter text-gray-700 border border-white/20 shadow-sm">
                    Scroll to Zoom
                </div>
            </div>
        </div>
    );
}
