import { defineField, defineType } from 'sanity'

export const directoryItemType = defineType({
  name: 'directoryItem',
  title: 'Particle Directory Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
        name: 'url',
        title: 'URL',
        type: 'url',
        validation: (rule) => rule.required(),
    }),
  ],
})