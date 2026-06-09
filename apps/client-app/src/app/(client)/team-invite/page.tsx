import { Suspense } from 'react';
import { AcceptTeamInviteCard } from '@/features/artist/team/ui/AcceptTeamInviteCard';

export default function TeamInvite() {
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
