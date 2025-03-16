import { defineField, defineType } from 'sanity'
import { WrenchIcon } from '@sanity/icons'

export const settingsType = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: WrenchIcon,
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
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'showLogoInMenu',
      title: 'Show Logo In Menu',
      type: 'boolean',
      initialValue: true,
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
      initialValue: {
        hex: '#ffffff'
      },
      options: {
        disableAlpha: true,
      },
    }),
  ],
})