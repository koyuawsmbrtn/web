import { defineField, defineType } from 'sanity'

export const cardType = defineType({
    name: 'card',
    title: 'Card',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'tag',
            title: 'Tag',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
        }),
        defineField({
            name: 'link',
            title: 'Link',
            type: 'url',
        }),
        defineField({
            name: 'content',
            type: 'text',
            title: 'Content',
            validation: (rule) => rule.required(),
        }),
    ],
})