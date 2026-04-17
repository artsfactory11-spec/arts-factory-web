'use client';

import { useEffect } from 'react';

export default function ImageProtection() {
    useEffect(() => {
        // 1. 전체 페이지 우클릭 방지
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // 2. 전체 페이지 요소 드래그 방지
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault();
        };

        // 3. 텍스트 선택 방지 (input, textarea 제외)
        const handleSelectStart = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        };

        // 이벤트 리스너 등록
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('selectstart', handleSelectStart);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('selectstart', handleSelectStart);
        };
    }, []);

    // CSS 수준에서도 텍스트 드래그(선택) 방지
    return (
        <style dangerouslySetInnerHTML={{
            __html: `
            body {
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            input, textarea {
                -webkit-touch-callout: default;
                -webkit-user-select: auto;
                -moz-user-select: auto;
                -ms-user-select: auto;
                user-select: auto;
            }
            `
        }} />
    );
}
