'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { usePostApiArtistDashboardProfiles } from '@repo/api';

export const ArtistOnboardingPage = () => {
    // const router = useRouter();
    // const [name, setName] = useState('');
    // const [error, setError] = useState<string | null>(null);
    // const [limitReached, setLimitReached] = useState(false);
    //
    // const { mutate, isPending } = usePostApiArtistDashboardProfiles({
    //     mutation: {
    //         onSuccess: () => {
    //             router.push('/');
    //         },
    //         onError: (err: any) => {
    //             const status = err?.response?.status;
    //             if (status === 403) {
    //                 setLimitReached(true);
    //                 return;
    //             }
    //             const data = err?.response?.data;
    //             setError(
    //                 data?.detail ||
    //                     data?.title ||
    //                     data?.message ||
    //                     'Не вдалося створити профіль артиста. Спробуйте ще раз.',
    //             );
    //         },
    //     },
    // });
    //
    // const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    //     event.preventDefault();
    //     const trimmed = name.trim();
    //     if (!trimmed) {
    //         setError('Введіть ім’я артиста');
    //         return;
    //     }
    //     setError(null);
    //     mutate({ data: { name: trimmed } });
    // };
    //
    return (
        <section style={{ maxWidth: 480, margin: '64px auto', padding: 24 }}>
            <h1>Створіть профіль артиста</h1>
            <p>Це обов’язковий крок для авторів — після цього ви потрапите до головної.</p>

    {/*//         {limitReached ? (*/}
    {/*//             <div style={{ marginTop: 24 }}>*/}
    {/*//                 <p>*/}
    {/*//                     Ви вже досягли ліміту артист-профілів на безкоштовному тарифі (1 профіль).*/}
    {/*//                 </p>*/}
    {/*//                 <button*/}
    {/*//                     type="button"*/}
    {/*//                     className="btn btn-primary"*/}
    {/*//                     onClick={() => router.push('/premium')}*/}
    {/*//                 >*/}
    {/*//                     Перейти на Premium*/}
    {/*//                 </button>*/}
    {/*//             </div>*/}
    {/*//         ) : (*/}
    {/*//             <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>*/}
    {/*//                 <label htmlFor="artistName" className="form-label">*/}
    {/*//                     Ім’я артиста*/}
    {/*//                 </label>*/}
    {/*//                 <input*/}
    {/*//                     id="artistName"*/}
    {/*//                     type="text"*/}
    {/*//                     className="form-control"*/}
    {/*//                     value={name}*/}
    {/*//                     onChange={(event) => setName(event.target.value)}*/}
    {/*//                     disabled={isPending}*/}
    {/*//                 />*/}
    {/*//                 {error && <div style={{ color: '#e66', marginTop: 8 }}>{error}</div>}*/}
    {/*//                 <button*/}
    {/*//                     type="submit"*/}
    {/*//                     className="btn btn-primary w-100"*/}
    {/*//                     style={{ marginTop: 16 }}*/}
    {/*//                     disabled={isPending}*/}
    {/*//                 >*/}
    {/*//                     {isPending ? 'Створення…' : 'Створити профіль'}*/}
    {/*//                 </button>*/}
    {/*//             </form>*/}
    {/*//         )}*/}
        </section>
    );
};

export default ArtistOnboardingPage;
