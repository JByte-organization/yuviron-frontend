import { Sidebar } from '@/components/layout/Sidebar';
import "@repo/ui/admin-styles";
import "@repo/ui/styles";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        // .admin-layout задает общий темный фон #020A13
        <div className="admin-layout container-fluid p-0 vh-100 overflow-hidden">
            <div className="row g-0 h-100">

                {/* Сайдбар: занимает ровно 3 колонки из 12 (col-md-3) */}
                <div className="col-md-3 col-lg-2 h-100 border-end border-secondary">
                    <Sidebar />
                </div>

                {/* Основная область: занимает оставшиеся 9 колонок (col-md-9) */}
                <div className="col-md-9 col-lg-10 d-flex flex-column h-100">

                    {/* Хедер (верхняя планка как на скрине) */}
                    <header className="admin-header d-flex align-items-center justify-content-end px-4">
                        <div className="user-profile-wrapper">
                            {/* Иконка пользователя */}
                            <div className="rounded-circle border border-secondary"
                                 style={{ width: '35px', height: '35px', background: '#353E4B' }}>
                            </div>
                        </div>
                    </header>

                    {/* Контент: прокручивается только этот блок */}
                    <main className="flex-grow-1 overflow-auto p-4">
                        <div className="container-fluid">
                            {children}
                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
}