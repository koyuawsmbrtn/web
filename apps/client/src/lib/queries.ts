import type { Home } from './sanity.types'

export type HomeResult = Home

export const homeQuery = `*[_type == "home"][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  title,
  headerSection{
    _type,
    title,
    description,
    backgroundImage{
      asset->{
        _id,
        _ref,
        _type,
        url,
        metadata {
          dimensions {
            width,
            height
          }
        }
      },
      crop,
      hotspot,
      alt
    },
    button{
      _type,
      text,
      link{
        _type,
        type,
        value,
        anchor,
        parameters,
        blank,
        url,
        email,
        phone,
        internalLink->{
          _ref,
          _type
        }
      }
    }
  }
}`