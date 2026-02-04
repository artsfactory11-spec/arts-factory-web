'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useTexture, PerspectiveCamera } from '@react-three/drei';

function ArtworkPlane({ url, width = 1, height = 1 }: { url: string; width?: number; height?: number }) {
    const texture = useTexture(url);

    return (
        <mesh position={[0, 1.5, 0.05]}>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial map={texture} />
        </mesh>
    );
}

function GalleryEnvironment() {
    return (
        <group>
            {/* Wall */}
            <mesh position={[0, 1.5, 0]}>
                <planeGeometry args={[10, 5]} />
                <meshStandardMaterial color="#f8f8f8" roughness={0.5} />
            </mesh>
            {/* Floor */}
            <mesh position={[0, 0, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[10, 5]} />
                <meshStandardMaterial color="#e0e0e0" roughness={0.8} />
            </mesh>
        </group>
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
        <div className="w-full h-[600px] bg-gray-100 rounded-[40px] overflow-hidden relative border border-gray-100 shadow-inner">
            <div className="absolute top-8 left-8 z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Virtual Preview</h3>
                <p className="text-lg font-serif italic">{artworkTitle}</p>
            </div>

            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 1.5, 4]} />
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.5} shadows="contact">
                        <group>
                            <GalleryEnvironment />
                            <ArtworkPlane url={imageUrl} width={w} height={h} />
                        </group>
                    </Stage>
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
                <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-tighter text-gray-500 border border-white/20">
                    Drag to Rotate
                </div>
                <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-tighter text-gray-500 border border-white/20">
                    Scroll to Zoom
                </div>
            </div>
        </div>
    );
}
