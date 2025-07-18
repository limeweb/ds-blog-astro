import { getCollection, render } from "astro:content";
import rss, { type RSSFeedItem } from "@astrojs/rss";
import mdxRenderer from "@astrojs/mdx/server.js";
import type { CollectionEntry } from "astro:content";
import type { APIContext } from "astro";
import { tzDate } from "@formkit/tempo";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import sanitizeHtml from "sanitize-html";

function assignLink(
    entry:
        | CollectionEntry<"posts">
        | CollectionEntry<"reviews">
        | CollectionEntry<"updates">
) {
    let href = "";
    switch (entry.collection) {
        case "posts":
            href = `/posts/${entry.id}`;
            break;
        case "reviews":
            href = `/library/reviews/${entry.id}`;
            break;
        case "updates":
            href = `/now#${entry.id}`;
            break;
    }
    return href;
}

export async function GET(ctx: APIContext) {
    const posts = await getCollection(
        "posts",
        ({ data }) => data.draft != true
    );
    const reviews = await getCollection("reviews");
    const updates = await getCollection("updates");
    const entries = [...posts, ...reviews, ...updates];
    const now = new Date();

    // get full site url to prepend relative links with
    let baseURL = ctx.site?.href || "https://daniel-saunders.com";
    if (baseURL.endsWith("/")) {
        baseURL = baseURL.slice(0, -1);
    }

    // Create a new Astro container to render MDX components
    // @link https://github.com/withastro/roadmap/discussions/419
    // @link https://docs.astro.build/en/reference/container-reference/
    const container = await AstroContainer.create();

    // load MDX renderer
    container.addServerRenderer({
        name: "@astrojs/mdx",
        renderer: mdxRenderer,
    });

    const feedItems: RSSFeedItem[] = await Promise.all(
        entries
            .sort((a, b) => (b.data.date as any) - (a.data.date as any))
            .map(async (entry): Promise<RSSFeedItem> => {
                // Get the `<Content/>` component for the current entry
                const { Content } = await render(entry);

                // use Astro container to render content to string
                const entryHTML = await container.renderToString(Content);

                // Process and sanitize the raw content with sanitize-html.
                // Also make sure that relative links are converted to absolute links.
                const sanitizedHTML = sanitizeHtml(entryHTML, {
                    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
                    transformTags: {
                        a: (_t, attrs) => ({
                            tagName: "a",
                            attribs: {
                                href: attrs.href.startsWith("/")
                                    ? baseURL + attrs.href
                                    : attrs.href,
                            },
                        }),
                        img: (_t, attrs) => ({
                            tagName: "img",
                            attribs: {
                                src: attrs.src.startsWith("/")
                                    ? baseURL + attrs.src
                                    : attrs.src,
                            },
                        }),
                    },
                });

                return {
                    title:
                        entry.collection == "updates"
                            ? `${entry.data.title} Update`
                            : entry.data.title,
                    description: entry.data.summary,
                    link: assignLink(entry),
                    pubDate: tzDate(entry.data.date, "America/Los_Angeles"),
                    customData: `${
                        entry.collection != "updates" && entry.data.updated_date
                            ? `<atom:updated>${tzDate(
                                  entry.data.updated_date,
                                  "America/Los_Angeles"
                              ).toISOString()}</atom:updated>`
                            : ""
                    }<atom:author><atom:name>Daniel Saunders</atom:name></atom:author>`,
                    content: sanitizedHTML,
                };
            })
    );

    return rss({
        title: "Daniel Saunders • Designer & Developer",
        description:
            "The personal website of web designer & developer Daniel Saunders.",
        site: ctx.site || "https://daniel-saunders.com",
        xmlns: {
            atom: "http://www.w3.org/2005/Atom",
        },
        customData: `<atom:link href="${
            baseURL + "/feed.xml"
        }" rel="self" type="application/rss+xml"></atom:link><language>en-us</language><generator>Astro v.5</generator><lastBuildDate>${now.toUTCString()}</lastBuildDate>`,
        items: feedItems,
    });
}
