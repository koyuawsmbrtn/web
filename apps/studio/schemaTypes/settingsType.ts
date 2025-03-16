import { defineField, defineType } from 'sanity'

export const settingsType = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'websiteName',
      title: 'Website Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'websiteDescription',
      title: 'Website Description',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'showTextInMenu',
      title: 'Show Text In Menu',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image'
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent Color',
      type: 'color',
      initialValue: '#ffffff',
      options: {
        disableAlpha: true,
      },
    }),
  ],
})