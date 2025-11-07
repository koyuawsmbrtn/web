import { defineField, defineType } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
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