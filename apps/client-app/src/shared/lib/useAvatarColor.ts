'use client';

import { useState, useEffect } from 'react';

/**
 * Витягує домінуючий колір з зображення через Canvas API.
 * Не потребує зовнішніх бібліотек — використовує вбудований браузерний Canvas.
 *
 * Якщо хочеш більш точний результат — встанови node-vibrant:
 * pnpm add node-vibrant --filter client-app
 * і замінити реалізацію на Vibrant.from(src).getPalette()
 */
export const useAvatarColor = (src?: string | null): string => {
    const [color, setColor] = useState('#1E3A5F'); // fallback колір

    useEffect(() => {
        if (!src) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // Зменшуємо до 50x50 для швидкості
                canvas.width  = 50;
                canvas.height = 50;
                ctx.drawImage(img, 0, 0, 50, 50);

                // Беремо піксель з центру-верху (найпредставніше місце)
                const data = ctx.getImageData(10, 10, 30, 30).data;

                let r = 0, g = 0, b = 0, count = 0;
                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }

                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);

                // Трохи затемнюємо щоб текст був читабельний
                r = Math.floor(r * 0.7);
                g = Math.floor(g * 0.7);
                b = Math.floor(b * 0.7);

                setColor(`rgb(${r}, ${g}, ${b})`);
            } catch {
                // CORS або інша помилка — використовуємо fallback
            }
        };
    }, [src]);

    return color;
};