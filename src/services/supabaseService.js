import { supabase } from '../supabaseClient'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

async function fetchSupabase(table, query = '') {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?${query}`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept': 'application/json'
      }
    }
  )
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }
  return response.json()
}
export async function obtenerMiembros() {
  const data = await fetchSupabase('miembros',
    'select=*,roles_miembro(roles(nombre,color)),enlaces_sociales_miembro(url_perfil,es_principal,plataformas_sociales(nombre,icono_url))&estado=eq.activo&order=nombre_mostrar'
  )
  return data
}

export async function obtenerMiembroPorId(id) {
  const data = await fetchSupabase('miembros',
    `select=*,roles_miembro(roles(nombre,color)),enlaces_sociales_miembro(url_perfil,es_principal,plataformas_sociales(nombre,icono_url))&id=eq.${id}&estado=eq.activo&limit=1`
  )
  return data?.[0] || null
}
export async function obtenerMiembrosTier() {
  return await fetchSupabase('vista_miembros_tier',
    'select=*&order=tier_orden.desc,puntos_totales.desc,nombre_mostrar'
  )
}

export async function obtenerEstadisticasClan() {
  const data = await fetchSupabase('vista_estadisticas_clan', 'select=*&limit=1')
  return data?.[0] || null
}

export async function obtenerPuntosPorCategoria(miembroId) {
  return await fetchSupabase('vista_puntos_por_categoria',
    `select=*&miembro_id=eq.${encodeURIComponent(miembroId)}&order=puntos.desc`
  )
}

export async function obtenerProgresoMiembro(miembroId) {
  const data = await fetchSupabase('vista_progreso_miembros',
    `select=*&miembro_id=eq.${encodeURIComponent(miembroId)}&limit=1`
  )
  return data?.[0] || null
}

export async function obtenerActividadMiembro(miembroId) {
  return await fetchSupabase('actividad_clan',
    `select=*&miembro_id=eq.${encodeURIComponent(miembroId)}&order=creado_en.desc&limit=8`
  )
}
export async function obtenerClips() {
  const data = await fetchSupabase('clips',
    'select=*,miembros(id,nombre_mostrar,avatar_url),categorias_clips(nombre,slug)&estado=in.(aprobado,activo)&order=creado_en.desc'
  )
  return data
}

export async function obtenerClipsPorMiembro(miembroId) {
  const data = await fetchSupabase('clips',
    `select=*,categorias_clips(nombre,slug)&miembro_id=eq.${miembroId}&estado=in.(aprobado,activo)&order=creado_en.desc`
  )
  return data
}

export async function obtenerCategoriasClips() {
  const data = await fetchSupabase('categorias_clips',
    'select=*&estado=eq.activo&order=orden_mostrar'
  )
  return data
}

export async function crearClip(clip) {
  const { data, error } = await supabase.rpc('crear_clip_usuario', {
    p_titulo: clip.titulo,
    p_url: clip.youtube_url,
    p_descripcion: clip.descripcion || null
  })
  if (error) throw error
  return data
}

export async function obtenerMisClips(usuarioId) {
  return await fetchSupabaseAuthenticated('GET', 'clips', null,
    `select=*,categorias_clips(nombre,slug)&usuario_id=eq.${usuarioId}&order=creado_en.desc`
  )
}

export async function obtenerClipsPendientes() {
  return await fetchSupabaseAuthenticated('GET', 'clips', null,
    `select=*,usuarios:usuarios!clips_usuario_id_fkey(id,nombre,avatar_url),miembros:miembros!clips_miembro_id_fkey(nombre_mostrar)&estado=eq.pendiente&order=creado_en.desc`
  )
}

export async function obtenerTodosClipsAdmin() {
  return await fetchSupabaseAuthenticated('GET', 'clips', null,
    `select=*,usuarios:usuarios!clips_usuario_id_fkey(id,nombre,avatar_url),miembros:miembros!clips_miembro_id_fkey(nombre_mostrar)&order=creado_en.desc`
  )
}

export async function actualizarEstadoClip(clipId, nuevoEstado) {
  if (!['aprobado', 'rechazado', 'pendiente', 'eliminado'].includes(nuevoEstado)) {
    throw new Error('Estado inválido')
  }
  return await fetchSupabaseAuthenticated('PATCH', 'clips', { estado: nuevoEstado }, `id=eq.${clipId}`)
}
export async function obtenerImagenesGaleria() {
  const data = await fetchSupabase('imagenes_galeria',
    'select=*,categorias_galeria(nombre,slug),miembros(nombre_mostrar)&estado=eq.activo&order=creado_en.desc'
  )
  return data
}

export async function obtenerCategoriasGaleria() {
  const data = await fetchSupabase('categorias_galeria',
    'select=*&estado=eq.activo&order=orden_mostrar'
  )
  return data
}

export async function obtenerImagenesPorCategoria(categoriaSlug) {
  const categorias = await fetchSupabase('categorias_galeria',
    `select=id&slug=eq.${categoriaSlug}`
  )
  if (!categorias?.[0]) return []

  const data = await fetchSupabase('imagenes_galeria',
    `select=*,categorias_galeria(nombre,slug)&categoria_id=eq.${categorias[0].id}&estado=eq.activo&order=creado_en.desc`
  )
  return data
}
export async function obtenerCarries() {
  const data = await fetchSupabase('carries',
    'select=*,miembros(id,nombre_mostrar,avatar_url,banner_url,biografia,roles_miembro(roles(nombre,color)),enlaces_sociales_miembro(url_perfil,plataformas_sociales(nombre,icono_url)))&estado=eq.activo&order=orden'
  )
  return data
}
export async function obtenerVetados() {
  const data = await fetchSupabase('vetados',
    'select=*,tipos_vetado(nombre,icono,nivel_peligro),miembros:reportado_por(nombre_mostrar)&estado=eq.activo&order=creado_en.desc'
  )
  return data
}

export async function obtenerTiposVetado() {
  const data = await fetchSupabase('tipos_vetado',
    'select=*&estado=eq.activo&order=nivel_peligro.desc'
  )
  return data
}
export async function obtenerPlataformas() {
  const data = await fetchSupabase('plataformas_sociales',
    'select=*&estado=eq.activo'
  )
  return data
}
export async function obtenerRoles() {
  const data = await fetchSupabase('roles',
    'select=*&estado=eq.activo&order=prioridad.desc'
  )
  return data
}
function getAuthToken() {
  try {
    const projectRef = import.meta.env.VITE_SUPABASE_URL.match(/\/\/([^.]+)\./)?.[1]
    if (!projectRef) return null

    const key = `sb-${projectRef}-auth-token`
    const sessionStr = localStorage.getItem(key)
    if (!sessionStr) return null

    const session = JSON.parse(sessionStr)
    return session.access_token
  } catch (error) {
    return null
  }
}
async function fetchSupabaseAuthenticated(method, table, body = null, query = '') {
  const token = getAuthToken()
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${token || supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }

  const options = {
    method,
    headers
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?${query}`,
    options
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `Error ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export function getSessionId() {
  let sessionId = localStorage.getItem('exo_session_id')
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('exo_session_id', sessionId)
  }
  return sessionId
}

export async function obtenerReacciones(tipoContenido, contenidoId, usuarioId = null) {
  const data = await fetchSupabase('reacciones',
    `select=emoji,usuario_id&tipo_contenido=eq.${tipoContenido}&contenido_id=eq.${contenidoId}`
  )

  const conteo = {}
  const misReacciones = new Set()

  data?.forEach(r => {
    conteo[r.emoji] = (conteo[r.emoji] || 0) + 1
    if (usuarioId && r.usuario_id === usuarioId) {
      misReacciones.add(r.emoji)
    }
  })

  return { conteo, misReacciones: Array.from(misReacciones) }
}

export async function toggleReaccion(tipoContenido, contenidoId, emoji, usuarioId) {
  if (!usuarioId) throw new Error('Usuario no autenticado')
  const existentes = await fetchSupabaseAuthenticated('GET', 'reacciones', null,
    `select=id&tipo_contenido=eq.${tipoContenido}&contenido_id=eq.${contenidoId}&emoji=eq.${encodeURIComponent(emoji)}&usuario_id=eq.${usuarioId}`
  )

  if (existentes?.length > 0) {
    await fetchSupabaseAuthenticated('DELETE', 'reacciones', null, `id=eq.${existentes[0].id}`)
    return { added: false }
  } else {
    await fetchSupabaseAuthenticated('POST', 'reacciones', {
      tipo_contenido: tipoContenido,
      contenido_id: contenidoId,
      emoji,
      usuario_id: usuarioId,
      session_id: getSessionId()
    })
    return { added: true }
  }
}

export async function obtenerComentarios(tipoContenido, contenidoId) {
  const data = await fetchSupabase('comentarios',
    `select=*,usuarios(nombre,avatar_url)&tipo_contenido=eq.${tipoContenido}&contenido_id=eq.${contenidoId}&estado=eq.activo&order=creado_en.desc`
  )
  return data
}

export async function crearComentario(tipoContenido, contenidoId, autor, contenido, usuarioId) {
  if (!usuarioId) throw new Error('Usuario no autenticado')

  const data = await fetchSupabaseAuthenticated('POST', 'comentarios', {
    tipo_contenido: tipoContenido,
    contenido_id: contenidoId,
    autor: autor.trim().substring(0, 50),
    contenido: contenido.trim().substring(0, 500),
    usuario_id: usuarioId,
    session_id: getSessionId()
  },
    'select=*,usuarios(nombre,avatar_url)'
  )
  return data?.[0]
}

export async function obtenerConteoComentarios(tipoContenido, contenidoId) {
  const data = await fetchSupabase('comentarios',
    `select=id&tipo_contenido=eq.${tipoContenido}&contenido_id=eq.${contenidoId}&estado=eq.activo`
  )
  return data?.length || 0
}

export async function eliminarComentarioPublico(id, usuarioId) {
  if (!usuarioId) throw new Error('Usuario no autenticado')
  await fetchSupabaseAuthenticated('DELETE', 'comentarios', null, `id=eq.${id}`)
}
