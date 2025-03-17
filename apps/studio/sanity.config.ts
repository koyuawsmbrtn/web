import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {codeInput} from '@sanity/code-input'
import {colorInput} from '@sanity/color-input'
import {WrenchIcon} from '@sanity/icons'
import {media} from 'sanity-plugin-media'

export default defineConfig({
  name: 'default',
  title: 'koyu\'s personal website',

  projectId: 'qo2xqopm',
  dataset: 'production',

  plugins: [structureTool({
    structure: (S) =>
      S.list()
        .title('Content')
        .items([
          S.listItem()
            .title('Posts')
            .child(S.documentList().title('Blog posts').filter('_type == "post"')),
          S.listItem()
            .title('Pages')
            .child(S.documentList().title('Pages').filter('_type == "page"')),
          S.listItem()
            .title('Notes')
            .child(S.documentList().title('Notes').filter('_type == "note"')),
          S.listItem()
            .title('Avatars')
            .child(S.documentList().title('Avatars').filter('_type == "avatar"')),
          S.listItem()
            .title('Blocks')
            .child(S.documentList().title('Blocks').filter('_type == "blockdocument"')),
          S.listItem()
            .title('Cards')
            .child(S.documentList().title('Cards').filter('_type == "card"')),
          S.listItem()
            .title('Socials')
            .child(S.documentList().title('Socials').filter('_type == "social"')),
          S.divider(),
          S.listItem()
            .title('Settings')
            .child(S.document().schemaType('settings').documentId('settings'))
            .icon(WrenchIcon),
        ])

  }),
  visionTool(),
  codeInput(),
  colorInput(),
  media({
    creditLine: {
      enabled: true,
      excludeSources: ['unsplash'],
    },
  }),
  ],

  schema: {
    types: schemaTypes,
  },
})
