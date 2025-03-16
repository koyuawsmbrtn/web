import { defineField, defineType } from 'sanity'

export const socialType = defineType({
    name: 'social',
    title: 'Social',
    type: 'document',
    fields: [
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'title' },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'url',
            type: 'url',
            validation: (rule) => rule.required(),
        }),
    ],
})