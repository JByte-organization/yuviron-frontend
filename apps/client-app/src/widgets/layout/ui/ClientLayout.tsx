'use client';

import React, { createContext, useContext, useState } from 'react';
import { Header } from '@/widgets/header/ui/Header';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { Footer } from '@/widgets/footer/ui/Footer';

// ─── Context щоб Sidebar міг повідомити Layout про стан ───
interface SidebarContextValue {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextValue>({
    collapsed: false,
    setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

// ─── Layout ───────────────────────────────────────────────
interface ClientLayoutProps {
    children: React.ReactNode;
}

export const ClientLayout = ({ children }: ClientLayoutProps) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
            <div
                className="client-layout"
                style={{
                    backgroundImage: "url('/images/bg-linear.svg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                }}
            >
                <Header/>

                <div className="client-layout__body">
                    <Sidebar/>

                    <main
                        className={`client-layout__main${collapsed ? ' client-layout__main--sidebar-collapsed' : ''}`}>
                        {children}
                        <Footer/>
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    );
};