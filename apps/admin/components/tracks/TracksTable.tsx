'use client';

import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from '@tanstack/react-table';
import { OverlayTrigger, Tooltip, Form } from 'react-bootstrap';

// Твой тип данных из макета
type Track = {
    name: string;
    artistId: string;
    genreId: string;
    tagsId: string;
    albumId: string;
    SeqNum: number;
    playsNum: number;
    id: number;
    time: string;
};

export const TracksTable = ({ data }: { data: Track[] }) => {
    const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

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
                        <span className="text-truncate d-block">{info.getValue() as string}</span>
                    </OverlayTrigger>
                ),
                size: 180,
            },
            { accessorKey: 'artistId', header: 'artistid', size: 120 },
            { accessorKey: 'genreId', header: 'genreid', size: 120 },
            { accessorKey: 'tagsId', header: 'tagsid', size: 120 },
            { accessorKey: 'albumId', header: 'albumid', size: 120 },
            { accessorKey: 'SeqNum', header: 'SeqNum', size: 100 },
            { accessorKey: 'playsNum', header: 'PlaysNum', size: 120 },
            { accessorKey: 'id', header: 'ID', size: 180 },
            { accessorKey: 'time', header: 'Time', size: 90 },
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
                            <i className={`bi ${isPlaying ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                        </button>
                    );
                }
            },
            {
                id: 'tableTitle',
                header: 'Table Title',
                size: 110,
                cell: ({ row }) => (
                    <div className="d-flex gap-2 justify-content-center">
                        <button className="btn-action edit">
                            <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button className="btn-action delete">
                            <i className="bi bi-x-lg"></i>
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
        <div className="admin-table-wrapper">
            <div className="table-responsive">
                <table className="admin-table" style={{ width: table.getCenterTotalSize() }}>
                    <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} style={{ width: header.getSize() }}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        <i className="bi bi-chevron-expand opacity-25 small"></i>
                                    </div>
                                    {/* Линия ресайза */}
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