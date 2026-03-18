'use client';

import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from '@tanstack/react-table';
import { OverlayTrigger, Tooltip, Form } from 'react-bootstrap';

import { Track } from '@repo/api';

export const TracksTable = ({ data }: { data: Track[] }) => {
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

    const columns = useMemo<ColumnDef<Track>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <Form.Check
                        type="checkbox"
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        className="admin-checkbox"
                    />
                ),
                cell: ({ row }) => (
                    <Form.Check
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        className="admin-checkbox"
                    />
                ),
                size: 50,
            },
            {
                accessorKey: 'name',
                header: 'Name',
                cell: (info) => (
                    <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>{info.getValue() as string}</Tooltip>}
                    >
                        <span className="text-truncate d-block fw-medium">
                            {info.getValue() as string}
                        </span>
                    </OverlayTrigger>
                ),
                size: 180,
            },
            // Делаем заголовки более читаемыми (Artist ID -> Artist)
            { accessorKey: 'artistId', header: 'Artist', size: 120 },
            { accessorKey: 'genreId', header: 'Genre', size: 120 },
            { accessorKey: 'tagsId', header: 'Tags', size: 120 },
            { accessorKey: 'albumId', header: 'Album', size: 120 },
            { accessorKey: 'SeqNum', header: 'Seq', size: 80 },
            {
                accessorKey: 'playsNum',
                header: 'Plays',
                size: 100,
                cell: (info) => (info.getValue() as number).toLocaleString() // Красивое число
            },
            { accessorKey: 'id', header: 'ID', size: 150 },
            { accessorKey: 'time', header: 'Time', size: 80 },
            {
                id: 'play',
                header: 'Play',
                size: 70,
                cell: ({ row }) => {
                    const isPlaying = playingTrackId === row.original.id;
                    return (
                        <button
                            className="btn btn-link p-0 text-cyan fs-5"
                            onClick={() => setPlayingTrackId(isPlaying ? null : row.original.id)}
                        >
                            <i className={`bi ${isPlaying ? 'bi-pause-circle-fill' : 'bi-play-circle-fill'}`}></i>
                        </button>
                    );
                }
            },
            {
                id: 'actions',
                header: 'Actions',
                size: 110,
                cell: ({ row }) => (
                    <div className="d-flex gap-2 justify-content-center">
                        <button
                            className="btn-action edit"
                            title="Edit"
                            onClick={() => console.log('Edit track:', row.original.id)}
                        >
                            <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                            className="btn-action delete"
                            title="Delete"
                            onClick={() => console.log('Delete track:', row.original.id)}
                        >
                            <i className="bi bi-trash3-fill"></i>
                        </button>
                    </div>
                )
            }
        ],
        [playingTrackId]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: 'onChange',
    });

    return (
        <div className="admin-table-wrapper border rounded-3 bg-dark-soft">
            <div className="table-responsive">
                <table className="admin-table" style={{ width: table.getCenterTotalSize() }}>
                    <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} style={{ width: header.getSize() }}>
                                    <div className="d-flex align-items-center justify-content-between px-2">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        <i className="bi bi-chevron-expand opacity-25 small"></i>
                                    </div>
                                    <div
                                        onMouseDown={header.getResizeHandler()}
                                        onTouchStart={header.getResizeHandler()}
                                        className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`}
                                    />
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} style={{ width: cell.column.getSize() }}>
                                    <div className="px-2">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </div>
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