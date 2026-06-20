import { Suspense } from 'react';
import { CategoryTracksPage } from '@/views/mood-genre/CategoryTracksPage';
export default function GenrePage() {
    return (
        <Suspense
            fallback={
                <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                    <div className="spinner-border text-primary spinner-border-sm" role="status" />
                </div>
            }
        >
            <CategoryTracksPage />
        </Suspense>
    );
}