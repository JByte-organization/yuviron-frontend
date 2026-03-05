// apps/admin/components/layout/Sidebar.tsx
import Link from 'next/link';

export const Sidebar = () => {
    return (
        <aside className="admin-sidebar p-3">
            <div className="mb-4">
                <button className="btn btn-info w-100 py-2 fw-bold">+ New Item</button>
            </div>

            <nav className="flex-grow-1">
                <ul className="list-unstyled">
                    <li className="mb-2"><Link href="/users" className="nav-link text-white">Users</Link></li>
                    <li className="mb-2"><Link href="/artists" className="nav-link text-white">Artists</Link></li>
                    <li className="mb-2"><Link href="/dashboard" className="nav-link text-white">Dashboard</Link></li>

                    <li className="mt-4 text-muted small text-uppercase">Elements</li>
                    <li className="mb-1"><Link href="/tracks" className="nav-link text-white opacity-75">Tracks</Link></li>
                    <li className="mb-1"><Link href="/playlists" className="nav-link text-white opacity-75">Playlists</Link></li>
                    {/* Добавь остальные пункты: Albums, Genres, Moods */}
                </ul>
            </nav>

            <div className="mt-auto border-top border-secondary pt-3">
                <button className="btn btn-outline-danger w-100">Exit</button>
            </div>
        </aside>
    );
};