
import { Sidebar } from '@/widgets/sidebar';
import { AdminHeader } from '@/widgets/header';

import "@repo/ui/styles";
// import "@repo/UsersPage.tsx/admin-styles";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="admin-layout container-fluid p-0 vh-100 overflow-hidden">
            <div className="row g-0 h-100">
                {/* Левая колонка: Sidebar */}
                <div className="col-md-3 col-lg-2 h-100 border-end border-secondary">
                    <Sidebar />
                </div>

                {/* Правая колонка: Header + Контент */}
                <div className="col-md-9 col-lg-10 d-flex flex-column h-100">
                    <AdminHeader />

                    <main className="flex-grow-1 overflow-auto p-4">
                        <div className="container-fluid">
                            {/* Обертка для контента страниц */}
                            <div className="admin-secondary rounded-3 p-3">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}