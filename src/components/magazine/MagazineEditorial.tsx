'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function MagazineEditorial({ content }: { content: string }) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <>
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-black z-[100] origin-left"
                style={{ scaleX }}
            />

            <div
                className="prose prose-2xl prose-black max-w-none font-light leading-relaxed text-gray-800 
                prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-black
                prose-p:text-gray-600 prose-p:leading-loose
                prose-img:rounded-[40px] prose-img:shadow-2xl prose-img:my-20
                prose-strong:font-bold prose-strong:text-black
                prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:italic prose-blockquote:bg-gray-50 prose-blockquote:py-8 prose-blockquote:px-12 prose-blockquote:rounded-r-3xl
                [&>p:first-of-type]:first-letter:text-7xl [&>p:first-of-type]:first-letter:font-black [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:leading-none [&>p:first-of-type]:first-letter:text-black"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </>
    );
}
