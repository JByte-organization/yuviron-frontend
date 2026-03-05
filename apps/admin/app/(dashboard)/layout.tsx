import { Sidebar } from '../../components/layout/Sidebar';
//import { Header } from '../../components/layout/Header';
import "@yuviron/ui/src/styles/main.scss";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="admin-layout">
            {/* Сайдбар слева */}
            <Sidebar />

            {/* Основная область справа */}
            <div className="flex-grow-1 d-flex flex-column overflow-hidden">
                {/*//<Header />*/}
                <main className="p-4 overflow-auto" style={{ backgroundColor: '#020A13', minHeight: 'calc(100vh - 70px)' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}