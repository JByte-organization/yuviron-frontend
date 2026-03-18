import { $api } from '../../instance';
import {User, Artist, Genre, Admin} from '../../types';

export const adminService = {

    // Managing other entities
    async getAllUsers(): Promise<User[]> {
        const { data } = await $api.get<User[]>('/admin/users');
        return data;
    },

    // Personal profile
    async getMyProfile(): Promise<Admin> {
        const { data } = await $api.get<Admin>('/admin/me');
        return data;
    },

    async updateMyProfile(formData: FormData): Promise<Admin> {
        const { data } = await $api.patch<Admin>('/admin/me', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    },

    async banUser(id: string): Promise<void> {
        await $api.post(`/admin/users/${id}/ban`);
    },

    // Artists
    async verifyArtist(id: string): Promise<void> {
        await $api.patch(`/admin/artists/${id}/verify`);
    },

    // Genres/Moods
    async createGenre(name: string): Promise<Genre> {
        const { data } = await $api.post<Genre>('/genres', { name });
        return data;
    },
    async deleteGenre(id: string): Promise<void> {
        await $api.delete(`/genres/${id}`);
    }
};