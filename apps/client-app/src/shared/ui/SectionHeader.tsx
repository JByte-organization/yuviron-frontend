import React from 'react';
import Link from 'next/link';

interface SectionHeaderProps {
    title: string;
    highlightedWord?: string;
    showAll?: boolean;
    showAllHref?: string;
    onShowAll?: () => void;
    onPrev?: () => void;
    onNext?: () => void;
    rightSlot?: React.ReactNode;
    className?: string;
}

export const SectionHeader = ({
                                  title,
                                  highlightedWord,
                                  showAll = false,
                                  showAllHref = '#',
                                  onShowAll,
                                  onPrev,
                                  onNext,
                                  rightSlot,
                                  className = '',
                              }: SectionHeaderProps) => {
    const renderTitle = () => {
        if (!highlightedWord) return <span>{title}</span>;

        const parts = title.split(new RegExp(`(${highlightedWord})`, 'i'));
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlightedWord.toLowerCase() ? (
                        <span key={i} className="section-header__accent">{part}</span>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </>
        );
    };

    return (
        <div className={`d-flex align-items-center justify-content-between mb-3 ${className}`}>
            <h2 className="section-header__title mb-0">{renderTitle()}</h2>

            <div className="d-flex align-items-center gap-2">
                {rightSlot}

                {(onPrev || onNext) && (
                    <div className="d-none d-md-flex gap-1">
                        <button
                            className="section-header__nav-btn"
                            onClick={onPrev}
                            aria-label="Previous"
                        >
                            <i className="bi bi-chevron-left" style={{ fontSize: 12 }} />
                        </button>
                        <button
                            className="section-header__nav-btn"
                            onClick={onNext}
                            aria-label="Next"
                        >
                            <i className="bi bi-chevron-right" style={{ fontSize: 12 }} />
                        </button>
                    </div>
                )}

                {showAll && (
                    <Link
                        href={showAllHref}
                        onClick={onShowAll}
                        className="text-theme d-md-none"
                        aria-label="Show all"
                    >
                        <i className="bi bi-chevron-right" />
                    </Link>
                )}
            </div>
        </div>
    );
};