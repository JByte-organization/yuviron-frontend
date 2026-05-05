import axios from "axios";

export const apiClient = axios.create({
    baseURL: '', // Или тот порт, на котором запущен фронтенд
    withCredentials: true,
});