import React from 'react';
import { ArtistDetailsDto } from '@repo/api';

interface Props {
    artist: ArtistDetailsDto;
}

export const ArtistRow = ({ artist }: Props) => {
    return (
        <tr className="border-bottom border-secondary align-middle" style={{ backgroundColor: '#212631' }}>
            <td className="px-4">
                <input type="checkbox" className="form-check-input bg-dark border-secondary shadow-none" />
            </td>
            <td className="py-3">
                <div className="d-flex align-items-center gap-3">
                    <div className="rounded bg-secondary d-flex align-items-center justify-content-center overflow-hidden"
                         style={{ width: '40px', height: '40px' }}>
                        {artist.imageUrl ? (
                            <img src={artist.imageUrl} alt="" className="w-100 h-100 object-fit-cover" />
                        ) : (
                            <span className="text-white-50">A</span>
                        )}
                    </div>
                    <div className="text-white fw-bold">{artist.name}</div>
                </div>
            </td>
            <td className="text-secondary small text-truncate" style={{ maxWidth: '200px' }}>
                {artist.description || 'No description'}
            </td>
            <td>
                {artist.isVerified ? (
                    <span className="badge rounded-pill bg-primary text-dark px-3">VERIFIED</span>
                ) : (
                    <span className="badge rounded-pill bg-dark border border-secondary text-secondary px-3">STANDARD</span>
                )}
            </td>
            <td className="text-secondary small">
                {artist.createdAt ? new Date(artist.createdAt).toLocaleDateString() : 'N/A'}
            </td>
            <td className="text-secondary small font-monospace">
                {artist.id?.slice(0, 8)}...
            </td>
            <td className="text-end px-4">
                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-sm text-info shadow-none">✏️</button>
                    <button className="btn btn-sm text-danger shadow-none">❌</button>
                </div>
            </td>
        </tr>
    );
};