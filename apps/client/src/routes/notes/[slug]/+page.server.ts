import type { NoteServerLoad } from './$types';
import { serverClient } from '$lib/server/sanity';
import { error } from '@sveltejs/kit';

const NOTE_QUERY = `*[_type == "note" && slug.current == $slug][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    title,
    slug,
    tags,
    publishedAt,
    body,
    image,
    hidden,
    sortOrder
}`;

// Helper function to extract description from body
function extractDescription(body: any): string | undefined {
    if (!body || !Array.isArray(body)) return undefined;
    
    const firstBlock = body[0];
    if (
        firstBlock &&
        firstBlock._type === 'block' &&
        'children' in firstBlock &&
        Array.isArray(firstBlock.children)
    ) {
        return firstBlock.children
            .filter((child: any) => child.text)
            .map((child: any) => child.text)
            .join(' ')
            .slice(0, 160);
    }
    return undefined;
}

export const load: NoteServerLoad = async ({ params }) => {
    const { slug } = params;

    console.log('Loading note with slug:', slug);

    if (!slug) {
        console.log('No slug provided');
        throw error(404, 'Slug not found');
    }

    try {
        console.log('Fetching note with query:', NOTE_QUERY);
        console.log('Query params:', { slug });
        
        const note = await serverClient.fetch(NOTE_QUERY, { slug });
        
        console.log('Fetched note:', note ? { title: note.title?.replace(/[\u200B-\u200D\uFEFF\u2060-\u206F]/g, ''), _id: note._id, bodyLength: note.body?.length } : 'null');

        if (!note) {
            console.log('No note found');
            throw error(404, 'Note not found');
        }

        // Extract description from first block
        const description = extractDescription(note.body);

        return {
            note, // Changed from 'page' to 'note'
            meta: {
                title: note.title,
                description,
                url: `/notes/${note.slug?.current}`,
                publishedAt: note.publishedAt,
                tags: note.tags
            }
        };
    } catch (err) {
        console.error('Error fetching note:', err);
        
        // Log more details about the error
        if (err instanceof Error) {
            console.error('Error message:', err.message);
            console.error('Error stack:', err.stack);
        }
        
        throw error(500, 'Failed to load note');
    };
};
