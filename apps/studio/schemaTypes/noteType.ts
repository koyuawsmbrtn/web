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
          type: 'image',
          options: {
            hotspot: true
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for SEO and accessibility'
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            }
          ]
        },
        {
          title: 'Card',
          name: 'card',
          type: 'object',
          fields: [
            {
              title: 'Card',
              name: 'cardReference',
              type: 'reference',
              to: [{ type: 'card' }]
            }
          ]
        },
        {
          title: 'Notes List',
          name: 'notes',
          type: 'object'
        },
        {
          title: 'Block',
          name: 'blockref',
          type: 'object',
          fields: [
            {
              title: 'Block',
              name: 'blockReference',
              type: 'reference',
              to: [{ type: 'blockdocument' }]
            }
          ]
        }
      ]
    }),
  ],
})