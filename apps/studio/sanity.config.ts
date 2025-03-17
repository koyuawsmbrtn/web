import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {codeInput} from '@sanity/code-input'
import {colorInput} from '@sanity/color-input'
import {WrenchIcon, ComposeIcon, DocumentIcon, DocumentTextIcon, UsersIcon, CodeBlockIcon, BlockElementIcon, DiamondIcon} from '@sanity/icons'
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
            .child(S.documentList().title('Blog posts').filter('_type == "post"'))
            .icon(ComposeIcon),
          S.listItem()
            .title('Pages')
            .child(S.documentList().title('Pages').filter('_type == "page"'))
            .icon(DocumentIcon),
          S.listItem()
            .title('Notes')
            .child(S.documentList().title('Notes').filter('_type == "note"'))
            .icon(DocumentTextIcon),
          S.listItem()
            .title('Avatars')
            .child(S.documentList().title('Avatars').filter('_type == "avatar"'))
            .icon(UsersIcon),
          S.listItem()
            .title('Blocks')
            .child(S.documentList().title('Blocks').filter('_type == "blockdocument"'))
            .icon(CodeBlockIcon),
          S.listItem()
            .title('Cards')
            .child(S.documentList().title('Cards').filter('_type == "card"'))
            .icon(BlockElementIcon),
          S.listItem()
            .title('Socials')
            .child(S.documentList().title('Socials').filter('_type == "social"'))
            .icon(DiamondIcon),
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
