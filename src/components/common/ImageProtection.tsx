'use client';

import { useEffect } from 'react';

export default function ImageProtection() {
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // 이미지 또는 이미지를 포함한 요소에서 우클릭 방지
            if (target.tagName === 'IMG' || target.style.backgroundImage) {
                e.preventDefault();
            }
        };

        const handleDragStart = (e: DragEvent) => {
            const target = e.target as HTMLElement;
            // 이미지 드래그 방지
            if (target.tagName === 'IMG') {
                e.preventDefault();
            }
        };

        // 이벤트 리스너 등록
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('dragstart', handleDragStart);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('dragstart', handleDragStart);
        };
    }, []);

    // 이 컴포넌트는 UI를 렌더링하지 않음
    return null;
}
