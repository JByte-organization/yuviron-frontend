'use client';

import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from '@tanstack/react-table';

// Тип импортируем из сгенерированных моделей Orval
import { GetApiAdminPlaylistsIdTracksParams } from '@repo/api/generated/models/getApiAdminPlaylistsIdTracksParams';

interface TracksTableProps {
    data: GetApiAdminPlaylistsIdTracksParams[];
}

// Хелпер для форматирования миллисекунд в MM:SS
const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
};

export const TracksTable = ({ data }: TracksTableProps) => {
    const columns = useMemo<ColumnDef<GetApiAdminPlaylistsIdTracksParams>[]>(
        () => [
            {
                accessorKey: 'coverUrl',
                header: 'Cover',
                size: 70,
                cell: (info) => {
                    const url = info.getValue() as string;
                    return (
                        <img
                            src={url ? `https://dev-api.yuviron.com/storage/${url}` : '/placeholder.jpg'}
                            alt="Cover"
                            className="rounded"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                    );
                }
            },
            {
                accessorKey: 'title',
                header: 'Name',
                cell: (info) => (
                    <span className="text-truncate d-block fw-medium">
                        {info.getValue() as string}
                    </span>
                ),
                size: 200,
            },
            {
                accessorKey: 'artistNames',
                header: 'Artists',
                size: 180,
                cell: (info) => (info.getValue() as string[]).join(', ') // Склеиваем массив имен
            },
            {
                accessorKey: 'albumTitle',
                header: 'Album',
                size: 150
            },
            {
                accessorKey: 'playCount',
                header: 'Plays',
                size: 100,
                cell: (info) => (info.getValue() as number).toLocaleString()
            },
            {
                accessorKey: 'durationMs',
                header: 'Time',
                size: 80,
                cell: (info) => formatDuration(info.getValue() as number) // Форматируем MM:SS
            },
            {
                accessorKey: 'explicit',
                header: '18+',
                size: 60,
                cell: (info) => info.getValue() ? <span className="badge bg-danger">E</span> : null
            },
            {
                id: 'actions',
                header: 'Actions',
                size: 110,
                cell: ({ row }) => (
                    <div className="d-flex gap-2 justify-content-center">
                        <button className="btn-action edit" title="Edit">
                            <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button className="btn-action delete" title="Delete">
                            <i className="bi bi-trash3-fill"></i>
                        </button>
                    </div>
                )
            }
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="admin-table-wrapper border rounded-3 bg-dark-soft">
            <div className="table-responsive">
                <table className="admin-table w-100">
                    <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} style={{ width: header.getSize() }}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};