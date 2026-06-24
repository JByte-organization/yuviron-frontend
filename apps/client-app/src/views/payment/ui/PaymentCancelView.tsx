'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export const PaymentCancelView = () => {
    const router = useRouter();

    return (
        <div
            className="position-relative d-flex align-items-center justify-content-center overflow-hidden"
            style={{
                minHeight: '100vh',
                background: 'radial-gradient(circle at 50% 30%, #161923 0%, #0a0a0d 100%)' // Фірмовий глибокий темний фон
            }}
        >
            {/* КОНТРАСТНА СВІТЛА ПЛАШКА (Стиль Spotify/Stripe Receipts) */}
            <div
                className="p-5 rounded-4 position-relative"
                style={{
                    backgroundColor: '#ffffff', // Чистий білий фон плашки
                    maxWidth: '480px',
                    width: '90%',
                    zIndex: 5,
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div className="d-flex flex-column align-items-start text-start">

                    {/* Червоний круг скасування транзакції */}
                    <div
                        className="d-flex align-items-center justify-content-center rounded-circle mb-4"
                        style={{
                            width: '44px',
                            height: '44px',
                            backgroundColor: '#dc3545', // Наш сочний червоний акцент (danger)
                            color: '#ffffff'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>

                    {/* Текстові блоки з ідеальним контрастом на білому тлі */}
                    <h1 className="fw-bold text-dark mb-2 tracking-tight" style={{ fontSize: '32px', color: '#111116' }}>
                        Транзакцію перервано
                    </h1>

                    <p className="mb-1" style={{ fontSize: '15px', color: '#4e4e5e', lineHeight: '1.5' }}>
                        Операцію еквайрингу було скасовано користувачем або відхилено банком-емітентом.
                    </p>

                    <p className="mb-4" style={{ fontSize: '15px', color: '#4e4e5e', lineHeight: '1.5' }}>
                        Транзакційний стек скинуто. Зміни балансу відсутні, кошти з вашого рахунку списані не були.
                    </p>

                    {/* Блок кнопок дій */}
                    <div className="d-flex flex-column gap-2 mt-2 w-100">
                        {/* Акцентна темна кнопка Спробувати знову */}
                        <button
                            type="button"
                            className="btn fw-bold text-white py-2.5 px-4 border-0 rounded-3 transition-all text-uppercase"
                            style={{
                                backgroundColor: '#111116', // Темний обсидіан
                                fontSize: '12px',
                                letterSpacing: '0.05em',
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
                            onClick={() => router.push('/premium')}
                        >
                            Спробувати знову
                        </button>

                        {/* Мінімалістична світла кнопка повернення */}
                        <button
                            type="button"
                            className="btn fw-bold py-2.5 px-4 rounded-3 transition-all text-uppercase"
                            style={{
                                backgroundColor: 'transparent',
                                border: '1px solid #e1e1e8',
                                color: '#5f5f6e',
                                fontSize: '12px',
                                letterSpacing: '0.05em'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f4f4f6';
                                e.currentTarget.style.color = '#111116';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#5f5f6e';
                            }}
                            onClick={() => router.push('/')}
                        >
                            На головну
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};