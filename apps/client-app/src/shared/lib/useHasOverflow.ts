'use client';

import { useEffect, useRef, useState, type DependencyList } from 'react';

/**
 * Відстежує, чи горизонтальний контент елемента переповнює його (тобто чи є
 * що гортати). Повертає [ref, hasOverflow]. Прикріпіть ref до прокручуваного
 * контейнера; hasOverflow=true, лише коли scrollWidth перевищує clientWidth.
 *
 * Призначення: ховати стрілки прокрутки слайдера, коли контенту замало.
 *
 * Вимірювання — у колбеку ResizeObserver (спрацьовує одразу при observe та на
 * кожну зміну розміру), а не в тілі ефекту, тож setState поза рендером.
 * Передавайте у deps те, від чого змінюється набір елементів (напр. довжину
 * списку) — щоб переміряти після появи/зникнення контенту.
 */
export const useHasOverflow = <T extends HTMLElement>(deps: DependencyList = []) => {
    const ref = useRef<T>(null);
    const [hasOverflow, setHasOverflow] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const measure = () => setHasOverflow(el.scrollWidth - el.clientWidth > 1);
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        window.addEventListener('resize', measure);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return [ref, hasOverflow] as const;
};
