import { supabase } from '../supabaseClient'

// ============================================
// AUTENTICACIÓN
// ============================================

export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) throw error

    // Verificar si es administrador
    const { data: admin, error: adminError } = await supabase
        .from('administradores')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .eq('estado', 'activo')
        .single()

    if (adminError || !admin) {
        await supabase.auth.signOut()
        throw new Error('No tienes permisos de administrador')
    }

    // Actualizar último acceso
    await supabase
        .from('administradores')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', admin.id)

    return { user: data.user, admin }
}

export async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: admin } = await supabase
        .from('administradores')
        .select('*')
        .eq('auth_user_id', user.id)
        .eq('estado', 'activo')
        .single()

    return admin ? { user, admin } : null
}

export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session)
    })
}

// ============================================
// CRUD MIEMBROS
// ============================================

export async function crearMiembro(datos) {
    const { data, error } = await supabase
        .from('miembros')
        .insert([datos])
        .select()
        .single()

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

// ============================================
// CRUD CLIPS
// ============================================

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

// ============================================
// CRUD GALERÍA
// ============================================

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

// ============================================
// CRUD CARRIES
// ============================================

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

// ============================================
// CRUD VETADOS
// ============================================

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

// ============================================
// OBTENER TODOS (ADMIN - incluye inactivos)
// ============================================

export async function obtenerTodosMiembros() {
    const { data, error } = await supabase
        .from('miembros')
        .select('*')
        .neq('estado', 'eliminado')
        .order('nombre_mostrar')

    if (error) throw error
    return data
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

// ============================================
// CRUD CATEGORÍAS GALERÍA
// ============================================

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

// ============================================
// CRUD CATEGORÍAS CLIPS
// ============================================

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

// ============================================
// CRUD TIPOS VETADO
// ============================================

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

// ============================================
// CRUD ROLES
// ============================================

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

// ============================================
// COMENTARIOS (Admin)
// ============================================

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

// ============================================
// CRUD USUARIOS (PÚBLICOS)
// ============================================

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

/* Fin del archivo */
