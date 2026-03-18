import { $api } from '../../instance';
import { Track } from '../../types';

export const trackService = {
    async getAll(search: string = ''): Promise<Track[]> {
        const { data } = await $api.get<Track[]>('/tracks', {
            params: { search }
        });
        return data;
    },

    async getById(id: string): Promise<Track> {
        const { data } = await $api.get<Track>(`/tracks/${id}`);
        return data;
    },

    async create(data: any): Promise<Track> {
        const { data: createdTrack } = await $api.post<Track>('/tracks', data);
        return createdTrack;
    }
};