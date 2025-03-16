import {defineField, defineType} from 'sanity'

export const blockType = defineType({
    name: 'blockdocument',
    title: 'Block',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'tag',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'html',
            title: 'HTML',
            type: 'code',
            validation: (rule) => rule.required(),
            options: {
                language: 'html',
                languageAlternatives: [{title: 'HTML', value: 'html'}],
            },
        }),
    ],
})