import React from 'react';
import { TrackDetailsDto } from '@repo/api';

interface Props {
    track: TrackDetailsDto;
}

export const TrackRow = ({ track }: Props) => {
    // Форматирование секунд в ММ:СС
    // const formatDuration = (seconds?: number) => {
    //     if (!seconds) return '00:00';
    //     const mins = Math.floor(seconds / 60);
    //     const secs = Math.floor(seconds % 60);
    //     return `${mins}:${secs.toString().padStart(2, '0')}`;
    // };

    return (
        <tr className="border-bottom border-secondary align-middle" style={{ backgroundColor: '#212631' }}>
            <td className="px-4">
                <input type="checkbox" className="form-check-input bg-dark border-secondary shadow-none" />
            </td>

            {/* Название и обложка */}
            <td className="py-3">
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded bg-secondary d-flex align-items-center justify-content-center overflow-hidden"
                         style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                        {track.coverUrl ? (
                            <img src={track.coverUrl} alt="" className="w-100 h-100 object-fit-cover" />
                        ) : (
                            <span className="text-white-50 small">🎵</span>
                        )}
                    </div>
                    <div className="text-white fw-bold">{track.title}</div>
                </div>
            </td>

            {/*<td className="text-info">{track.artists || 'Unknown Artist'}</td>*/}
            {/*<td className="text-secondary small">{track.genreName}</td>*/}
            {/*<td className="text-secondary font-monospace">{formatDuration(track.duration)}</td>*/}

            {/*<td>*/}
            {/*    <span className={`badge rounded-pill px-3 ${track.status === 'Active' ? 'bg-success' : 'bg-warning text-dark'}`}>*/}
            {/*        {track.status?.toUpperCase()}*/}
            {/*    </span>*/}
            {/*</td>*/}

            {/*<td className="text-secondary small">{track.createdAt ? new Date(track.createdAt).toLocaleDateString() : 'N/A'}</td>*/}
            {/*<td className="text-secondary small font-monospace">{track.id?.slice(0, 8)}...</td>*/}

            {/*<td className="text-end px-4">*/}
            {/*    <div className="d-flex justify-content-end gap-2">*/}
            {/*        <button className="btn btn-sm text-info shadow-none">✏️</button>*/}
            {/*        <button className="btn btn-sm text-danger shadow-none">❌</button>*/}
            {/*    </div>*/}
            {/*</td>*/}
        </tr>
    );
};