import type {LoaderLocals} from '@sanity/svelte-loader'

declare global {
  namespace App {
    interface Locals extends LoaderLocals {}
  }
}

export {}