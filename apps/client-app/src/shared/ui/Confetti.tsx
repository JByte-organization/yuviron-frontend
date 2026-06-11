'use client';

import React from 'react';

// Лёгкое конфетти без сторонних либ и без правок SCSS у @repo/ui (он пребилдится —
// см. память про rebuild). Кейфреймы инжектим одним <style>, чтобы компонент был
// самодостаточным. Запускается анмаунтом/ремаунтом (key) у вызывающего.
const COLORS = ['#2ECC71', '#00A6FF', '#7B61FF', '#FFB347', '#FF6B6B'];

// Детермінований псевдорандом від числа (чиста Math.sin — не порушує
// react-hooks/purity, на відміну від Math.random). seed змінює патерн між залпами.
const pseudo = (n: number): number => {
    const x = Math.sin(n) * 43758.5453;
    return x - Math.floor(x);
};

export const Confetti = ({ count = 90, seed = 1 }: { count?: number; seed?: number }) => {
    const pieces = React.useMemo(
        () =>
            Array.from({ length: count }, (_, i) => ({
                left: pseudo(i + 1 + seed) * 100,
                delay: pseudo(i + 7 + seed * 3) * 0.35,
                duration: 1.8 + pseudo(i + 13 + seed * 5) * 1.4,
                color: COLORS[i % COLORS.length]!,
                width: 6 + pseudo(i + 19 + seed * 7) * 6,
            })),
        [count, seed],
    );

    return (
        <div className="yv-confetti" aria-hidden="true">
            <style
                dangerouslySetInnerHTML={{
                    __html: `
.yv-confetti{position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden}
.yv-confetti__piece{position:absolute;top:-16px;border-radius:2px;opacity:.95;
  animation-name:yv-confetti-fall;animation-timing-function:cubic-bezier(.3,.6,.5,1);animation-fill-mode:forwards}
@keyframes yv-confetti-fall{
  0%{transform:translateY(-12vh) rotate(0deg);opacity:1}
  100%{transform:translateY(108vh) rotate(720deg);opacity:.15}}`,
                }}
            />
            {pieces.map((p, i) => (
                <span
                    key={i}
                    className="yv-confetti__piece"
                    style={{
                        left: `${p.left}%`,
                        background: p.color,
                        width: p.width,
                        height: p.width * 0.4,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                    }}
                />
            ))}
        </div>
    );
};
