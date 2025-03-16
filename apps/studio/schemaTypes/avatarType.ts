import { defineField, defineType } from 'sanity'

export const avatarType = defineType({
    name: 'avatar',
    title: 'Avatar',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'link',
            title: 'Link',
            type: 'url',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
        }),
    ],
})