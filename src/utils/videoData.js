export function getVideoData(url) {
    if (!url) return null

    let parsedUrl
    try {
        parsedUrl = new URL(url)
    } catch {
        return null
    }

    const hostname = parsedUrl.hostname.toLowerCase()
    const pathname = parsedUrl.pathname

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        let videoId = null
        if (pathname.startsWith('/embed/')) videoId = pathname.split('/')[2]
        else if (hostname === 'youtu.be') videoId = pathname.split('/')[1]
        else if (pathname.startsWith('/shorts/')) videoId = pathname.split('/')[2]
        else if (pathname === '/watch') videoId = parsedUrl.searchParams.get('v')

        return videoId
            ? { type: 'iframe', src: `https://www.youtube.com/embed/${videoId}` }
            : null
    }

    if (hostname.endsWith('medal.tv')) {
        const segments = pathname.split('/').filter(Boolean)
        const clipIndex = segments.findIndex(segment => segment === 'clips' || segment === 'clip')
        const clipId = clipIndex >= 0 ? segments[clipIndex + 1] : null

        if (clipId) {
            return {
                type: 'iframe',
                src: `https://medal.tv/clip/${encodeURIComponent(clipId)}?autoplay=0&muted=0&loop=0&controls=1`
            }
        }

        return null
    }

    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || hostname === 'cdn.discordapp.com') {
        return { type: 'video', src: url }
    }

    return null
}
