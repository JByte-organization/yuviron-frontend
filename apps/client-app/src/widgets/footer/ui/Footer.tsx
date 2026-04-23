import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const Footer = () => {
    return (
        <footer className="client-footer">
            <div className="container-fluid">

                {/* ─── Верхній блок: лого + контакти ───────── */}
                <div className="row align-items-center py-4 py-lg-5">

                    {/* Лого */}
                    <div className="col-12 col-lg-5 d-flex justify-content-center justify-content-lg-start mb-4 mb-lg-0">
                        <Image
                            src="/images/logo.svg"
                            alt="Lumitune"
                            width={180}
                            height={120}
                            className="client-footer__logo"
                        />
                    </div>

                    {/* Контакти + соцмережі */}
                    <div className="col-12 col-lg-7">

                        {/* Адреса */}
                        <div className="row mb-3">
                            <div className="col-12">
                                <p className="client-footer__contact-item mb-0">
                                    <i className="bi bi-geo-alt-fill client-footer__contact-icon" />
                                    Adress st. Shevchenko, 25 house, UA, Odessa, 00000
                                </p>
                            </div>
                        </div>

                        {/* Телефон + Email */}
                        <div className="row mb-3">
                            <div className="col-12 col-sm-6">
                                <p className="client-footer__contact-item mb-0">
                                    <i className="bi bi-telephone-fill client-footer__contact-icon" />
                                    (380) 00-000-00-00
                                </p>
                            </div>
                            <div className="col-12 col-sm-6 mt-2 mt-sm-0">
                                <p className="client-footer__contact-item mb-0">
                                    <i className="bi bi-envelope-fill client-footer__contact-icon" />
                                    lumitune@gmail.com
                                </p>
                            </div>
                        </div>

                        {/* Соцмережі */}
                        <div className="row">
                            <div className="col-12">
                                <div className="d-flex gap-3">
                                    <a href="#" className="client-footer__social-link" aria-label="Facebook">
                                        <i className="bi bi-facebook" />
                                    </a>
                                    <a href="#" className="client-footer__social-link" aria-label="Twitter">
                                        <i className="bi bi-twitter-x" />
                                    </a>
                                    <a href="#" className="client-footer__social-link" aria-label="Pinterest">
                                        <i className="bi bi-pinterest" />
                                    </a>
                                    <a href="#" className="client-footer__social-link" aria-label="RSS">
                                        <i className="bi bi-rss-fill" />
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ─── Розділювач ───────────────────────────── */}
                <hr className="client-footer__divider" />

                {/* ─── Нижні лінки по центру ────────────────── */}
                <div className="row py-3">
                    <div className="col-12">
                        <div className="d-flex flex-wrap justify-content-center gap-3 gap-md-4">
                            {[
                                { href: '/about',      label: 'About us'      },
                                { href: '/contact',    label: 'Contact us'    },
                                { href: '/help',       label: 'Help'          },
                                { href: '/privacy',    label: 'Privacy Policy'},
                                { href: '/disclaimer', label: 'Disclaimer'    },
                            ].map((link) => (
                                <Link key={link.href} href={link.href} className="client-footer__bottom-link">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
};