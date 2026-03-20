import { defineField, defineType } from 'sanity'

export const skillCloudType = defineType({
    name: 'skillCloud',
    title: 'Skill Cloud',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'skills',
            title: 'Skills',
            type: 'array',
            validation: (rule) => rule.required(),
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'name',
                            title: 'Name',
                            type: 'string',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'category',
                            title: 'Category',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Languages', value: 'Languages' },
                                    { title: 'Frameworks', value: 'Frameworks' },
                                    { title: 'DevOps', value: 'DevOps' },
                                    { title: 'Tools', value: 'Tools' },
                                ],
                            },
                        }),
                        defineField({
                            name: 'proficiency',
                            title: 'Proficiency',
                            type: 'number',
                            initialValue: 3,
                            validation: (rule) => rule.min(1).max(5).integer(),
                        }),
                    ],
                    preview: {
                        select: {
                            title: 'name',
                            subtitle: 'category',
                        },
                    },
                },
            ],
        }),
    ],
})
