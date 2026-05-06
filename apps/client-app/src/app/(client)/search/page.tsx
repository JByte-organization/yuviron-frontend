import { Suspense } from 'react';
import { SearchPage } from '@/views/search/SearchPage';

// useSearchParams() потребує Suspense в Next.js 14+
export default function Page() {
    return (
        <Suspense fallback={<div className="search-page"><p>Завантаження...</p></div>}>
            <SearchPage />
        </Suspense>
    );
}