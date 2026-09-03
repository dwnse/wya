import { supabase } from '../supabaseClient'

export async function obtenerMiSolicitud(usuarioId) {
    const { data, error } = await supabase
        .from('solicitudes_miembro')
        .select('*')
        .eq('usuario_id', usuarioId)
        .maybeSingle()

    if (error) throw error
    return data
}

export async function solicitarMembresia(usuarioId, datos) {
    if (!datos.email?.toLowerCase().endsWith('@gmail.com')) {
        throw new Error('La membresía requiere un correo Gmail')
    }
    const { data, error } = await supabase
        .from('solicitudes_miembro')
        .insert({
            usuario_id: usuarioId,
            razon: datos.razon.trim(),
            nombre_usuario: datos.nombre_usuario.trim(),
            nombre_mostrar: datos.nombre_mostrar.trim(),
            minecraft_username: datos.minecraft_username.trim() || null,
            fecha_ingreso: datos.fecha_ingreso || null
        })
        .select()
        .single()

    if (error) throw error
    return data
}