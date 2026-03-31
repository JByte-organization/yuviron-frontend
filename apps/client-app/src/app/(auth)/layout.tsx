"use client";

import React from "react";

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <main className="auth-layout d-flex flex-column align-items-center justify-content-center min-vh-100 py-5">
            <div className="mb-5 text-center">
                <span className="fs-1 fw-bold text-primary">YUVIRON</span>
     *       </div>

            <section className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-5 col-xl-4">
                        <div className="card bg-black border-secondary p-4 shadow-lg">
                            {children}
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
        .auth-layout {
          background: radial-gradient(circle at top, #121212 0%, #000 100%);
        }
        .card {
           border-radius: 12px;
        }
      `}</style>
        </main>
    );
}