'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TracksTable } from '@/components/tracks/TracksTable';
import { TableToolbar } from '@/components/shared/TableToolbar';
import { AdminModal } from '@/components/shared/AdminModal';
import { TrackForm } from '@/components/tracks/TrackForm';
import { trackService, Track } from '@repo/api';

export default function TracksPage() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    // useCallback => функция не пересоздается при каждом рендере
    const fetchTracks = useCallback(async (searchQuery: string = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await trackService.getAll(searchQuery);
            setTracks(data);
        } catch (err) {
            console.error("Ошибка при загрузке треков:", err);
            setError("Не удалось загрузить список треков. Проверьте соединение с сервером.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Загрузка данных при монтировании
    useEffect(() => {
        fetchTracks();
    }, [fetchTracks]);

    const handleSearch = (query: string) => {
        fetchTracks(query);
    };

    const handleSaveTrack = async (formData: any) => {
        try {
            await trackService.create(formData);
            await fetchTracks(); // Обновляем список
            setShowModal(false);
        } catch (err) {
            console.error("Ошибка при сохранении:", err);
            alert("Произошла ошибка при сохранении трека.");
        }
    };

    return (
        <div className="p-4">
            <TableToolbar
                title="Tracks"
                subtitle="Manage your music library"
                addButtonText="New Track"
                onAddClick={() => setShowModal(true)}
                onSearch={handleSearch}
            />

            <AdminModal
                show={showModal}
                onHide={() => setShowModal(false)}
                title="Create New Track"
            >
                <TrackForm onSave={handleSaveTrack} />
            </AdminModal>

            {/* отображение ошибки */}
            {error && (
                <div className="alert alert-danger m-3" role="alert">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="spinner-border text-cyan" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="mt-3">
                    {tracks.length > 0 ? (
                        <TracksTable data={tracks} />
                    ) : (
                        <div className="text-center py-5 text-white">
                            <i className="bi bi-music-note-beamed fs-1 d-block mb-3"></i>
                            <p>No tracks found. Try changing your search or add a new one.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}