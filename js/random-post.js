async function randomPost() {
  try {
    const indexResponse = await fetch('/api/posts.json')
    if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status}`)

    const indexData = await indexResponse.json()
    const pages = indexData?.data?.pages || []
    const total = indexData?.data?.count || 0
    if (!pages.length || !total) return

    let offset = Math.floor(Math.random() * total)
    let selectedPage = pages[0]
    for (const page of pages) {
      if (offset < page.count) {
        selectedPage = page
        break
      }
      offset -= page.count
    }

    const pageResponse = await fetch(`/${selectedPage.api.replace(/^\/+/, '')}`)
    if (!pageResponse.ok) throw new Error(`HTTP ${pageResponse.status}`)

    const pageData = await pageResponse.json()
    const posts = pageData?.data?.posts || []
    if (!posts.length) return

    let target = posts[Math.min(offset, posts.length - 1)]
    const targetUrl = post => new URL(post.url, location.origin)
    if (posts.length > 1 && targetUrl(target).pathname === location.pathname) {
      target = posts[(offset + 1) % posts.length]
    }

    location.href = targetUrl(target).href
  } catch (error) {
    console.error('Failed to load a random post:', error)
  }
}
