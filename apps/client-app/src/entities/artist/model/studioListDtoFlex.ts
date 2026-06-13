import type {
    StudioAlbumListItemDto,
    StudioTrackListItemDto,
} from '@repo/api/artist.ts';

/**
 * Толерантні розширення studio-DTO.
 *
 * Живий /swagger/artist флапає не лише доступністю (часто 500), а й СКЛАДОМ
 * полів: бек то додає, то прибирає artistNames/albumId/albumTitle/albumPosition
 * у StudioTrackListItemDto і tracksCount у StudioAlbumListItemDto. CI фетчить
 * живий свагер і генерує типи з нього, локально генерація йде з закоміченого
 * fallback (packages/api/openapi/artist.swagger.json) — тому той самий код
 * мусить компілюватись з ОБОМА версіями типів.
 *
 * Тут ці поля оголошені опційно поверх згенерованого DTO: якщо генерація їх
 * має — intersection збігається 1:1, якщо ні — поля просто `undefined` у
 * рантаймі, а UI вже скрізь читає їх через `??`-фолбеки.
 */
export type StudioTrackListItemFlex = StudioTrackListItemDto & {
    albumId?: string;
    /** @nullable */
    albumTitle?: string | null;
    albumPosition?: number;
    /** @nullable */
    artistNames?: string[] | null;
};

export type StudioAlbumListItemFlex = StudioAlbumListItemDto & {
    tracksCount?: number;
};
