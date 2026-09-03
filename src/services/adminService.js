import { supabase } from '../supabaseClient'

export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
    })

    if (error) throw error

    const admin = await obtenerPerfilAdministrativo(data.user)
    if (!admin) {
        await supabase.auth.signOut()
        throw new Error('No tienes permisos de administrador')
    }

    await supabase.from('usuarios').update({ ultimo_acceso: new Date().toISOString() }).eq('id', admin.usuario_id)

    return { user: data.user, admin }
}

async function obtenerPerfilAdministrativo(authUser) {
    const { data: profile, error } = await supabase
        .from('usuarios')
        .select('*, roles(id,nombre,color,prioridad)')
        .eq('auth_user_id', authUser.id)
        .eq('estado', 'activo')
        .maybeSingle()

    if (error || !profile) return null

    const roleName = profile.roles?.nombre
    if (!['CEO', 'Administrador', 'Moderador'].includes(roleName)) return null

    return {
        ...profile,
        usuario_id: profile.id,
        nombre: profile.nombre || authUser.email?.split('@')[0] || 'Administrador',
        email: profile.email || authUser.email,
        nivel_acceso: roleName === 'CEO' ? 5 : roleName === 'Administrador' ? 4 : 3,
        rol: roleName,
        rol_color: profile.roles?.color
    }
}

export async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const admin = await obtenerPerfilAdministrativo(user)

    return admin ? { user, admin } : null
}

export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session)
    })
}

export async function crearMiembro(datos) {
    const { data, error } = await supabase
        .from('miembros')
        .insert([datos])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function obtenerUsuariosParaMiembro() {
    const { data, error } = await supabase
        .from('usuarios')
        .select('id,nombre,email,auth_user_id')
        .ilike('email', '%@gmail.com')
        .eq('estado', 'activo')
        .order('nombre')

    if (error) throw error
    return data
}

export async function actualizarMiembro(id, datos) {
    const { data, error } = await supabase
        .from('miembros')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function eliminarMiembro(id) {
    const { error } = await supabase
        .from('miembros')
        .update({ estado: 'eliminado' })
        .eq('id', id)

    if (error) throw error
}

export async function crearClip(datos) {
    const { data, error } = await supabase
        .from('clips')
        .insert([datos])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function actualizarClip(id, datos) {
    const { data, error } = await supabase
        .from('clips')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function eliminarClip(id) {
    const { error } = await supabase
        .from('clips')
        .update({ estado: 'eliminado' })
        .eq('id', id)

    if (error) throw error
}

export async function crearImagen(datos) {
    const { data, error } = await supabase
        .from('imagenes_galeria')
        .insert([datos])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function actualizarImagen(id, datos) {
    const { data, error } = await supabase
        .from('imagenes_galeria')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function eliminarImagen(id) {
    const { error } = await supabase
        .from('imagenes_galeria')
        .update({ estado: 'eliminado' })
        .eq('id', id)

    if (error) throw error
}

export async function crearCarry(datos) {
    const { data, error } = await supabase
        .from('carries')
        .insert([datos])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function actualizarCarry(id, datos) {
    const { data, error } = await supabase
        .from('carries')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function eliminarCarry(id) {
    const { error } = await supabase
        .from('carries')
        .update({ estado: 'eliminado' })
        .eq('id', id)

    if (error) throw error
}

export async function crearVetado(datos) {
    const { data, error } = await supabase
        .from('vetados')
        .insert([datos])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function actualizarVetado(id, datos) {
    const { data, error } = await supabase
        .from('vetados')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function eliminarVetado(id) {
    const { error } = await supabase
        .from('vetados')
        .update({ estado: 'eliminado' })
        .eq('id', id)

    if (error) throw error
}

export async function obtenerTodosMiembros() {
    const { data, error } = await supabase
        .from('miembros')
        .select('*')
        .neq('estado', 'eliminado')
        .order('nombre_mostrar')

    if (error) throw error
    return data
}

export async function obtenerSolicitudesMiembro() {
    const { data, error } = await supabase
        .from('solicitudes_miembro')
        .select('*, usuarios!solicitudes_miembro_usuario_id_fkey(id,nombre,email,avatar_url)')
        .order('creado_en', { ascending: false })

    if (error) throw error
    return data
}

export async function aprobarSolicitudMiembro(id) {
    const { data, error } = await supabase.rpc('aprobar_solicitud_miembro', { p_solicitud_id: id })
    if (error) throw error
    return data
}

export async function rechazarSolicitudMiembro(id, motivo = null) {
    const { data, error } = await supabase.rpc('rechazar_solicitud_miembro', {
        p_solicitud_id: id,
        p_motivo: motivo
    })
    if (error) throw error
    return data
}

export async function obtenerCategoriasPuntosAdmin() {
    const { data, error } = await supabase
        .from('categorias_puntos')
        .select('*')
        .eq('estado', 'activo')
        .order('orden')

    if (error) throw error
    return data
}

export async function asignarPuntosMiembro(datos) {
    const { data, error } = await supabase.rpc('asignar_puntos_miembro', {
        p_miembro_id: datos.miembro_id,
        p_categoria_id: datos.categoria_id,
        p_cantidad: Number(datos.cantidad),
        p_motivo: datos.motivo,
        p_evento_id: datos.evento_id || null
    })

    if (error) throw error
    return Array.isArray(data) ? data[0] : data
}

export async function crearClipManual(datos) {
    const { data, error } = await supabase.rpc('crear_clip_admin', {
        p_titulo: datos.titulo,
        p_url: datos.youtube_url,
        p_descripcion: datos.descripcion || null
    })
    if (error) throw error
    return data
}

export async function obtenerEventosAdmin() {
    const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha_inicio', { ascending: false })
    if (error) throw error
    return data
}

export async function crearEvento(datos) {
    const { data, error } = await supabase.from('eventos').insert([datos]).select().single()
    if (error) throw error
    return data
}

export async function actualizarEvento(id, datos) {
    const { data, error } = await supabase.from('eventos').update(datos).eq('id', id).select().single()
    if (error) throw error
    return data
}

export async function eliminarEvento(id) {
    const { error } = await supabase.from('eventos').update({ estado: 'cancelado' }).eq('id', id)
    if (error) throw error
}

export async function obtenerTodosClips() {
    const { data, error } = await supabase
        .from('clips')
        .select(`
            *,
            miembros (nombre_mostrar),
            categorias_clips (nombre)
        `)
        .neq('estado', 'eliminado')
        .order('creado_en', { ascending: false })

    if (error) throw error
    return data
}

export async function obtenerTodasImagenes() {
    const { data, error } = await supabase
        .from('imagenes_galeria')
        .select(`
            *,
            categorias_galeria (nombre)
        `)
        .neq('estado', 'eliminado')
        .order('creado_en', { ascending: false })

    if (error) throw error
    return data
}

export async function obtenerTodosCarries() {
    const { data, error } = await supabase
        .from('carries')
        .select(`
            *,
            miembros (nombre_mostrar, avatar_url)
        `)
        .neq('estado', 'eliminado')
        .order('orden')

    if (error) throw error
    return data
}

export async function obtenerTodosVetados() {
    const { data, error } = await supabase
        .from('vetados')
        .select(`
            *,
            tipos_vetado (nombre, icono, nivel_peligro)
        `)
        .neq('estado', 'eliminado')
        .order('creado_en', { ascending: false })

    if (error) throw error
    return data
}

export async function obtenerCategoriasGaleriaAdmin() {
    const { data, error } = await supabase
        .from('categorias_galeria')
        .select('*')
        .order('orden')

    if (error) throw error
    return data
}

export async function crearCategoriaGaleria(datos) {
    const { data, error } = await supabase
        .from('categorias_galeria')
        .insert([datos])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function actualizarCategoriaGaleria(id, datos) {
    const { data, error } = await supabase
        .from('categorias_galeria')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function eliminarCategoriaGaleria(id) {
    const { error } = await supabase
        .from('categorias_galeria')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function obtenerCategoriasClipsAdmin() {
    const { data, error } = await supabase
        .from('categorias_clips')
        .select('*')
        .order('orden')

    if (error) throw error
    return data
}

export async function crearCategoriaClips(datos) {
    const { data, error } = await supabase
        .from('categorias_clips')
        .insert([datos])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function actualizarCategoriaClips(id, datos) {
    const { data, error } = await supabase
        .from('categorias_clips')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function eliminarCategoriaClips(id) {
    const { error } = await supabase
        .from('categorias_clips')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function obtenerTiposVetadoAdmin() {
    const { data, error } = await supabase
        .from('tipos_vetado')
        .select('*')
        .order('nivel_peligro', { ascending: false })

    if (error) throw error
    return data
}

export async function crearTipoVetado(datos) {
    const { data, error } = await supabase
        .from('tipos_vetado')
        .insert([datos])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function actualizarTipoVetado(id, datos) {
    const { data, error } = await supabase
        .from('tipos_vetado')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function eliminarTipoVetado(id) {
    const { error } = await supabase
        .from('tipos_vetado')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function obtenerRolesAdmin() {
    const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('nombre')

    if (error) throw error
    return data
}

export async function crearRol(datos) {
    const { data, error } = await supabase
        .from('roles')
        .insert([datos])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function actualizarRol(id, datos) {
    const { data, error } = await supabase
        .from('roles')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function eliminarRol(id) {
    const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function obtenerTodosComentarios() {
    const { data, error } = await supabase
        .from('comentarios')
        .select('*')
        .order('creado_en', { ascending: false })

    if (error) throw error
    return data
}

export async function eliminarComentario(id) {
    const { error } = await supabase
        .from('comentarios')
        .update({ estado: 'eliminado' })
        .eq('id', id)

    if (error) throw error
}

export async function restaurarComentario(id) {
    const { error } = await supabase
        .from('comentarios')
        .update({ estado: 'activo' })
        .eq('id', id)

    if (error) throw error
}

export async function obtenerTodosUsuarios() {
    const { data, error } = await supabase
        .from('usuarios')
        .select(`
            *,
            roles (id, nombre, color)
        `)
        .order('creado_en', { ascending: false })

    if (error) throw error
    return data
}

export async function actualizarUsuario(id, datos) {
    const { data, error } = await supabase
        .from('usuarios')
        .update(datos)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

