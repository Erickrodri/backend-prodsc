import { ApiReference } from '@scalar/nextjs-api-reference'

export const GET = ApiReference({
  configuration: {
    theme: 'purple',
    layout: 'modern',
    spec: {
      url: '/api/reference',
    },
  },
})
