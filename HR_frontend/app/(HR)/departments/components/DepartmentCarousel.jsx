// app/(HR)/departments/components/DepartmentCarousel.jsx
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { DepartmentCard } from "./DepartmentCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DepartmentCarousel({ departments, onCardClick }) {
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Function to check if scrolling is possible in either direction
    const checkScrollability = useCallback(() => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setCanScrollLeft(scrollLeft > 0);
            // Check if there's more content to scroll to on the right
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    }, []);

    // Run the check when the component mounts or the list of departments changes
    useEffect(() => {
        const container = scrollContainerRef.current;
        checkScrollability();
        window.addEventListener('resize', checkScrollability);
        if (container) {
            container.addEventListener('scroll', checkScrollability);
        }
        return () => {
            window.removeEventListener('resize', checkScrollability);
            if (container) {
                container.removeEventListener('scroll', checkScrollability);
            }
        };
    }, [departments, checkScrollability]);

    // Function to handle the button clicks
    const handleScroll = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            // Scroll by 80% of the visible width for a nice page-like effect
            const scrollAmount = container.clientWidth * 0.8;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group">
            {/* Left Scroll Button */}
            <button
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                className={`absolute top-1/2 left-0 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-lg
                           transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                aria-label="Scroll left"
            >
                <ChevronLeft className="h-6 w-6 text-slate-700 dark:text-slate-200" />
            </button>

            {/* The Horizontal Scrolling Container */}
            <div
                ref={scrollContainerRef}
                className="flex items-stretch gap-6 overflow-x-auto snap-x snap-mandatory pb-4
                           scrollbar-hide" // Hides the default scrollbar
            >
                {departments.map(dept => (
                    <div key={dept.id} className="snap-start flex-shrink-0 w-[280px]">
                        <DepartmentCard department={dept} onClick={onCardClick} />
                    </div>
                ))}
            </div>

            {/* Right Scroll Button */}
            <button
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                className={`absolute top-1/2 right-0 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-lg
                           transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                aria-label="Scroll right"
            >
                <ChevronRight className="h-6 w-6 text-slate-700 dark:text-slate-200" />
            </button>
        </div>
    );
}