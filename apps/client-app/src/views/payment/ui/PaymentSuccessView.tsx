'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { getGetApiAuthMeQueryKey } from '@repo/api/client';

// Строгий интерфейс для конфигурации частиц конфетти
interface ConfettiParticle {
    x: number;
    y: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
    rotation: number;
    rotationSpeed: number;
    shape: 'rect' | 'circle' | 'triangle';
}

export const PaymentSuccessView = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // ─── Мгновенное обновление сессии пользователя ────────
    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: getGetApiAuthMeQueryKey() });
    }, [queryClient]);

    // ─── Безопасный и производительный движок конфетти ────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Яркая палитра летящих частиц (неоновые акценты системы)
        const colors = ['#7AE0FF', '#1D4ED8', '#1db954', '#1ed760', '#ffc107', '#e91e63'];
        const confettiCount = 100;
        const particles: ConfettiParticle[] = [];

        // Инициализация пула частиц через плоские объекты (без классов)
        for (let i = 0; i < confettiCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedX: Math.random() * 3 - 1.5,
                speedY: Math.random() * 4 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 3 - 1.5,
                shape: Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'triangle')
            });
        }

        // Цикл рендеринга на Canvas
        const renderLoop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                // Обновление физики движения
                p.x += p.speedX;
                p.y += p.speedY;
                p.rotation += p.rotationSpeed;

                // Возврат триггера, если частица улетела за нижнюю границу экрана
                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                    p.speedY = Math.random() * 4 + 4;
                }

                // Отрисовка геометрии частицы
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;

                ctx.beginPath();
                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else if (p.shape === 'circle') {
                    ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.moveTo(0, -p.size / 2);
                    ctx.lineTo(p.size / 2, p.size / 2);
                    ctx.lineTo(-p.size / 2, p.size / 2);
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(renderLoop);
        };
        renderLoop();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Автоматическая генерация даты окончания (+30 дней)
    const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div
            className="position-relative d-flex align-items-center justify-content-center overflow-hidden"
            style={{
                minHeight: '100vh',
                background: 'radial-gradient(circle at 50% 30%, #161923 0%, #0a0a0d 100%)' // Фирменный глубокий темный фон
            }}
        >
            {/* Слой анимации конфетти */}
            <canvas
                ref={canvasRef}
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{ pointerEvents: 'none', zIndex: 1 }}
            />

            {/* КОНТРАСТНАЯ СВЕТЛАЯ ПЛАШКА (Стиль Spotify/Stripe Receipts) */}
            <div
                className="p-5 rounded-4 position-relative"
                style={{
                    backgroundColor: '#ffffff', // Чистый белый фон плашки
                    maxWidth: '480px',
                    width: '90%',
                    zIndex: 5,
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div className="d-flex flex-column align-items-start text-start">

                    {/* Зеленый круг успеха */}
                    <div
                        className="d-flex align-items-center justify-content-center rounded-circle mb-4"
                        style={{
                            width: '44px',
                            height: '44px',
                            backgroundColor: '#1db954', // Наш сочный зеленый
                            color: '#ffffff'
                        }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>

                    {/* Текстовые блоки с идеальным контрастом на белом фоне */}
                    <h1 className="fw-bold text-dark mb-3 tracking-tight" style={{ fontSize: '32px', color: '#111116' }}>
                        Оплату успішно здійснено!
                    </h1>

                    <p className="mb-1" style={{ fontSize: '15px', color: '#4e4e5e', lineHeight: '1.5' }}>
                        Дякуємо за проведення вашого останнього платежу.
                    </p>

                    <p className="mb-4" style={{ fontSize: '15px', color: '#4e4e5e' }}>
                        Термін дії вашої преміум-підписки закінчується <span className="fw-bold text-dark" style={{ color: '#111116' }}>{expirationDate}</span>.
                    </p>

                    {/* Фирменная темная кнопка для мощного визуального акцента */}
                    <button
                        type="button"
                        className="btn btn-dark fw-bold text-white py-2.5 px-4 border-0 rounded-3 transition-all"
                        style={{
                            fontSize: '16px',
                            boxShadow: '0 4px 12px rgba(17, 17, 22, 0.15)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1c1c24';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#111116';
                            e.currentTarget.style.transform = 'none';
                        }}
                        onClick={() => router.push('/home')}
                    >
                        Повернутися на головну
                    </button>
                </div>
            </div>
        </div>
    );
};