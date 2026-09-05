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
    const { data, error } = await supabase.rpc('enviar_solicitud_miembro', {
        p_usuario_id: usuarioId,
        p_razon: datos.razon.trim(),
        p_nombre_usuario: datos.nombre_usuario.trim(),
        p_nombre_mostrar: datos.nombre_mostrar.trim(),
        p_minecraft_username: datos.minecraft_username.trim() || null,
        p_fecha_ingreso: datos.fecha_ingreso || null
    })

    if (error) {
        if (error.message?.includes('Ya tienes una solicitud')) {
            throw new Error('Ya tienes una solicitud pendiente o aprobada.')
        }
        throw error
    }
    return Array.isArray(data) ? data[0] : data
}