'use client';

import { TracksTable } from '@/components/tracks/TracksTable';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { AdminModal } from '@/components/shared/AdminModal';
import { TrackForm } from '@/components/tracks/TrackForm';
import {useState, useEffect} from "react";

export interface Track {
    id: string;
    name: string;
    artistId: string;
    genreId: string;
    tagsId: string;
    albumId: string;
    SeqNum: string;
    playsNum: number;
    time: string;
}

// тестовые данные
const mockTracks: Track[] = [
    {
        id: '1',
        name: 'Etiam purus in',
        artistId: 'Curabit...',
        genreId: 'Morbi...',
        tagsId: 'Tortor...',
        albumId: 'Tortor...',
        SeqNum: '264523273',
        playsNum: 23564564,
        time: '6:66',
    },
    {
        id: '2',
        name: 'Duis eget habi...',
        artistId: 'At ame...',
        genreId: 'Com...',
        tagsId: 'Tortor...',
        albumId: 'Tortor...',
        SeqNum: '264523273',
        playsNum: 31208371,
        time: '6:66',
    },
    {
        id: '3',
        name: 'Aliquam velit l...',
        artistId: 'Pellente...',
        genreId: 'Tortor...',
        tagsId: 'Tortor...',
        albumId: 'Tortor...',
        SeqNum: '264523273',
        playsNum: 912381,
        time: '6:66',
    },
];

export default function TracksPage() {
    const [tracks, setTracks] = useState<Track[]>([]); // Состояние для списка треков
    const [isLoading, setIsLoading] = useState(true); // Состояние загрузки
    const [showModal, setShowModal] = useState(false);

    // Функция для получения данных с сервера
    const fetchTracks = async (searchQuery: string = '') => {
        setIsLoading(true);
        try {
            // Замени URL на адрес твоего реального API
            const response = await fetch(`/api/tracks?search=${searchQuery}`);
            const data = await response.json();
            setTracks(data);
        } catch (error) {
            console.error("Ошибка при загрузке треков:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Вызываем загрузку при первом рендере
    useEffect(() => {
        fetchTracks();
    }, []);

    const handleSearch = (query: string) => {
        fetchTracks(query); // Теперь поиск реально дергает API
    };

    const handleSaveTrack = async (formData: any) => {
        try {
            const response = await fetch('/api/tracks', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                fetchTracks(); // Обновляем список после сохранения
                setShowModal(false);
            }
        } catch (error) {
            console.error("Ошибка при сохранении:", error);
        }
    };

    return (
        <div className="p-4">
            <TableToolbar
                title="Track"
                subtitle="List track"
                addButtonText="New Track"
                onAddClick={() => setShowModal(true)}
                onSearch={(v) => console.log(v)}
            />
            {/* modal */}
            <AdminModal
                show={showModal}
                onHide={() => setShowModal(false)}
                title="Track"
            >
                <TrackForm onSave={(data) => {
                    console.log(data);
                    setShowModal(false);
                }} />
            </AdminModal>
            <TracksTable data={mockTracks} />
        </div>
    );


    // return (
    //     <div className="p-4">
    //         <TableToolbar
    //             title="Track"
    //             subtitle="List track"
    //             addButtonText="New Track"
    //             onAddClick={() => setShowModal(true)}
    //             onSearch={handleSearch}
    //         />
    //
    //         <AdminModal show={showModal} onHide={() => setShowModal(false)} title="Track">
    //             <TrackForm onSave={handleSaveTrack} />
    //         </AdminModal>
    //
    //         {isLoading ? (
    //             <div>Загрузка...</div>
    //         ) : (
    //             <TracksTable data={tracks} />
    //         )}
    //     </div>
    // );
}