import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const Footer = () => {
    return (
        <footer className="client-footer">

            {/* ─── Верхній блок ─────────────────────────── */}
            <div className="client-footer__top justify-content-center align-items-center">

                {/* Лого */}
                <Link href="/home" className="client-footer__logo">
                    <Image
                        src="/images/logo.svg"
                        alt="Lumitune"
                        width={120}
                        height={150}
                    />
                </Link>

                {/* Адреса */}
                <div className="client-footer__contact-block">
                    <p className="client-footer__contact-label">Address:</p>
                    <p className="client-footer__contact-text">
                        st. Shevchenko, 25 house,
                        Odesa, Ukraine
                    </p>
                </div>

                {/* Телефон + Email */}
                <div className="client-footer__contact-block">
                    <p className="client-footer__contact-label">Support:</p>
                    <p className="client-footer__contact-text">(380) 00-000-00-00</p>
                </div>

                {/* Email */}
                <div className="client-footer__contact-block">
                    <p className="client-footer__contact-label">Email:</p>
                    <p className="client-footer__contact-text">yuviron@gmail.com</p>
                </div>

                {/* Соцмережі */}
                <div className="client-footer__socials">
                    <a href="#" className="client-footer__social client-footer__social--fb" aria-label="Facebook">
                        <i className="bi bi-facebook" />
                    </a>
                    <a href="#" className="client-footer__social client-footer__social--tw" aria-label="Twitter">
                        <i className="bi bi-twitter-x" />
                    </a>
                    <a href="#" className="client-footer__social client-footer__social--pt" aria-label="Pinterest">
                        <i className="bi bi-pinterest" />
                    </a>
                    <a href="#" className="client-footer__social client-footer__social--rss" aria-label="RSS">
                        <i className="bi bi-rss-fill" />
                    </a>
                </div>

            </div>

            {/* ─── Нижній блок ──────────────────────────── */}
            <div className="client-footer__bottom">

                {/* Лінки по центру */}
                <nav className="client-footer__links">
                    {[
                        { href: '/about',      label: 'About us'       },
                        { href: '/contact',    label: 'Contact us'     },
                        { href: '/help',       label: 'Help'           },
                        { href: '/privacy',    label: 'Privacy Policy' },
                        { href: '/disclaimer', label: 'Disclaimer'     },
                    ].map(link => (
                        <Link key={link.href} href={link.href} className="client-footer__link">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Копірайт */}
                <p className="client-footer__copy">
                    © {new Date().getFullYear()} Yuviron Inc. All rights reserved.
                </p>

            </div>

        </footer>
    );
};