import type { PageMeta } from "./types";
import type { CollectionEntry } from "astro:content";

/** Generate page meta information from a page collection object. Checks for meta properties and falls back to page title.
 * @returns PageMeta object to use in PageWrapper / HeadMeta components.
 */
export function getPageMeta(page: CollectionEntry<"pages">): PageMeta {
    const metaTitle = page.data.meta?.title ?? page.data.title;
    const metaDescription = page.data.meta?.description ?? undefined;
    return {
        id: page.id,
        meta: {
            title: metaTitle,
            description: metaDescription,
        },
        openGraph: {
            title: page.data.openGraph?.title ?? metaTitle,
            description: page.data.openGraph?.description ?? metaDescription,
        },
    };
}

export function getCollectionMeta(
    entry:
        | CollectionEntry<"posts">
        | CollectionEntry<"reviews">
        | CollectionEntry<"updates">
): PageMeta {
    const metaTitle = entry.data.title;
    const metaDescription = entry.data.summary ?? undefined;
    return {
        id: entry.id,
        meta: {
            title: entry.data.title,
            description: metaDescription,
        },
        openGraph: {
            title: metaTitle,
            description: metaDescription,
        },
    };
}
