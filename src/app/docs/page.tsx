'use client'

export default function DocsPage() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <iframe
        src="/api/docs"
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
      />
    </div>
  )
}
