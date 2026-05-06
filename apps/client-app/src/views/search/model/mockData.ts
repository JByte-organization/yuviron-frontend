import type { SearchResults } from './types';

export const MOCK_SEARCH_RESULTS: SearchResults = {
    tracks: [
        { id: 't1', title: 'Rockstar',          artistNames: ['LISA'],              artistId: 'lisa',      albumId: 'a1', albumTitle: 'Alter Ego',    durationMs: 166000, coverUrl: null },
        { id: 't2', title: 'Die With A Smile',  artistNames: ['Lady Gaga', 'Bruno Mars'], artistId: 'gaga', albumId: 'a2', albumTitle: 'Die With A Smile', durationMs: 250000, coverUrl: null },
        { id: 't3', title: 'How You Like That', artistNames: ['BLACKPINK'],         artistId: 'bp',        albumId: 'a3', albumTitle: 'THE ALBUM',    durationMs: 182000, coverUrl: null },
        { id: 't4', title: 'LALISA',            artistNames: ['LISA'],              artistId: 'lisa',      albumId: 'a4', albumTitle: 'Сінгл',        durationMs: 186000, coverUrl: null },
        { id: 't5', title: 'Pink Venom',        artistNames: ['BLACKPINK'],         artistId: 'bp',        albumId: 'a3', albumTitle: 'Born Pink',     durationMs: 194000, coverUrl: null },
    ],
    artists: [
        { id: 'bp',    name: 'BLACKPINK',      monthlyListeners: 75247295, avatarUrl: null },
        { id: 'lisa',  name: 'LISA',           monthlyListeners: 72780975, avatarUrl: null },
        { id: 'gaga',  name: 'Lady Gaga',      monthlyListeners: 68432100, avatarUrl: null },
        { id: 'alyona',name: 'Alyona Alyona',  monthlyListeners: 1240000,  avatarUrl: null },
    ],
    albums: [
        { id: 'a1', title: 'Alter Ego',     artistName: 'LISA',     artistId: 'lisa',  tracksCount: 8,  coverUrl: null },
        { id: 'a2', title: 'Die With A Smile', artistName: 'Lady Gaga', artistId: 'gaga', tracksCount: 1, coverUrl: null },
        { id: 'a3', title: 'THE ALBUM',     artistName: 'BLACKPINK', artistId: 'bp',   tracksCount: 8,  coverUrl: null },
        { id: 'a4', title: 'Born Pink',     artistName: 'BLACKPINK', artistId: 'bp',   tracksCount: 10, coverUrl: null },
    ],
    playlists: [
        { id: 'p1', name: 'K-Pop Hits 2025',    authorName: 'Lumitune', tracksCount: 45, coverUrl: null },
        { id: 'p2', name: 'K-Pop Workout',       authorName: 'Lumitune', tracksCount: 32, coverUrl: null },
        { id: 'p3', name: 'BLACKPINK Best',      authorName: 'Марія',    tracksCount: 28, coverUrl: null },
        { id: 'p4', name: 'K-Pop Love Songs',    authorName: 'Lumitune', tracksCount: 20, coverUrl: null },
    ],
    genres: [
        { id: 'g1', name: 'K-Pop',        color: '#FF4081', coverUrl: null },
        { id: 'g2', name: 'Поп',          color: '#7C4DFF', coverUrl: null },
        { id: 'g3', name: 'Електронна',   color: '#00BCD4', coverUrl: null },
        { id: 'g4', name: 'Хіп-хоп',     color: '#FF6D00', coverUrl: null },
    ],
};