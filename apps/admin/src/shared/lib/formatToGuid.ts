export const formatToGuid = (rawId: string | null | undefined): string | null => {
    if (!rawId) return null;

    if (rawId.includes('-')) return rawId;

    if (rawId.length === 32) {
        return `${rawId.slice(0, 8)}-${rawId.slice(8, 12)}-${rawId.slice(12, 16)}-${rawId.slice(16, 20)}-${rawId.slice(20)}`;
    }

    return rawId;
};