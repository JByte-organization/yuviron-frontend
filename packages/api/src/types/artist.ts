export interface Artist {
    id: string;
    name: string;
    isVerified: boolean; // Галочка верификации
    genreIds: string[];
    monthlyListeners: number;
}