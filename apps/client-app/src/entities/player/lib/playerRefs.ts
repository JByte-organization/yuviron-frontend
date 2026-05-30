// Глобальні refs для audio елементів плеєра.
// Singleton — один екземпляр на весь застосунок.

export const playerAudioRef: { current: HTMLAudioElement | null } = { current: null };
export const playerAdAudioRef: { current: HTMLAudioElement | null } = { current: null };