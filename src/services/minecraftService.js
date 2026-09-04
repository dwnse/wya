const fallbackSkin = 'https://mc-heads.net/skin/Steve'
const defaultMinecraftAvatar = 'https://mc-heads.net/avatar/Steve/128'

export function obtenerAvatarMinecraft(username, profile) {
    if (!profile?.found) return defaultMinecraftAvatar
    const currentName = profile.name || username?.trim()
    return currentName
        ? `https://mc-heads.net/avatar/${encodeURIComponent(currentName)}/128`
        : defaultMinecraftAvatar
}

export async function consultarPerfilMinecraft(username) {
    const cleanUsername = username?.trim()
    if (!cleanUsername) return { found: false, premium: false, code: 'NO_USERNAME', skin: fallbackSkin, model: 'classic', cape: null, capes: [] }

    const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/minecraft-profile?username=${encodeURIComponent(cleanUsername)}`
    const transientCodes = new Set(['TIMEOUT', 'RATE_LIMITED', 'MOJANG_ERROR', 'CONNECTION_ERROR'])
    let lastError = null

    for (let attempt = 0; attempt < 2; attempt += 1) {
        const controller = new AbortController()
        const timeout = window.setTimeout(() => controller.abort(), 10000)
        try {
            const response = await fetch(endpoint, { signal: controller.signal })
            const data = await response.json().catch(() => null)
            if (!data) throw new Error('Respuesta inválida del servidor')
            
            if (data.found || !transientCodes.has(data.code) || attempt === 1) {
                // IMPORTANTE: Si data.found es true, devolvemos TODO lo que venga del servidor (incluyendo TODAS las capas).
                if (data.found) {
                    return {
                        ...data,
                        // Aseguramos que capes siempre sea un array (aunque el servidor lo mande vacío o indefinido)
                        capes: Array.isArray(data.capes) ? data.capes : []
                    }
                }
                // Si no se encontró, devolvemos el fallback
                return { ...data, skin: fallbackSkin, model: 'classic', cape: null, capes: [] }
            }
            lastError = data
        } catch (error) {
            lastError = {
                found: false,
                premium: false,
                code: error.name === 'AbortError' ? 'TIMEOUT' : 'CONNECTION_ERROR',
                message: 'No se pudo consultar el perfil de Minecraft'
            }
        } finally {
            window.clearTimeout(timeout)
        }
    }

    return {
        ...(lastError || {}),
        found: false,
        premium: false,
        skin: fallbackSkin,
        model: 'classic',
        cape: null,
        capes: []
    }
}

export function perfilMinecraftEnCache(member) {
    if (!member?.minecraft_skin_actualizada_en || !member.minecraft_skin_url) return null
    const age = Date.now() - new Date(member.minecraft_skin_actualizada_en).getTime()
    if (age < 0 || age >= 24 * 60 * 60 * 1000) return null
    return {
        found: member.minecraft_es_premium,
        premium: member.minecraft_es_premium,
        code: member.minecraft_es_premium ? 'CACHED' : 'NOT_FOUND',
        name: member.minecraft_es_premium ? member.minecraft_username : null,
        uuid: member.minecraft_uuid,
        skin: member.minecraft_skin_url,
        model: member.minecraft_skin_model || 'classic',
        cape: null,
        capes: []
    }
}