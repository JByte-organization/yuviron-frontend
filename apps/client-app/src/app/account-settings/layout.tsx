'use client';

import React from 'react';
import { AccountSidebar } from '@/widgets/account-sidebar/ui/AccountSidebar';

interface AccountLayoutProps {
    children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
    return (
        <div className="account-dashboard-wrapper">
            <div className="container-xl px-4">
                <div className="row g-5">
                    <div className="col-12 col-md-4 col-lg-3">
                        <AccountSidebar />
                    </div>
                    <div className="col-12 col-md-8 col-lg-9 account-main-content">
                        <div className="content-inner-card animate-fade-in">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}