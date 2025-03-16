import { defineField, defineType } from 'sanity'

export const noteType = defineType({
    name: 'note',
    title: 'Note',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'title' },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'body',
            type: 'array',
            title: 'Content',
            of: [
              {
                type: 'block'
              },
              {
                type: 'image'
              }
            ]
          }),
    ],
})