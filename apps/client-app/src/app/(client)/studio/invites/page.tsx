import { Suspense } from 'react';
import { AcceptTeamInviteCard } from '@/features/artist/team/ui/AcceptTeamInviteCard';

/**
 * Прийняття запрошення до команди артиста. Бек шле лист із посиланням
 * /studio/invites?code=… — саме цей шлях і параметр `code`, тому роут має бути
 * тут (раніше був лише /team-invite → лист падав у 404). Той самий компонент.
 */
export default function StudioInvites() {
    return (
        <section className="client-forgot-page">
            <div className="client-forgot-page__panel">
                <div className="client-forgot-page__content">
                    <Suspense fallback={null}>
                        <AcceptTeamInviteCard />
                    </Suspense>
                </div>
            </div>
        </section>
    );
}
