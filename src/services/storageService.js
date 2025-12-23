import { supabase } from '../supabaseClient'

/**
 * Sube una imagen a Supabase Storage
 * @param {File} file - Archivo a subir
 * @param {string} bucket - Nombre del bucket (ej: 'avatars', 'gallery', 'clips')
 * @param {string} folder - Carpeta dentro del bucket (opcional)
 * @returns {Promise<string>} URL pública de la imagen
 */
export async function uploadImage(file, bucket = 'images', folder = '') {
    if (!file) throw new Error('No se proporcionó ningún archivo')

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no válido. Use JPG, PNG, GIF o WebP')
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
        throw new Error('El archivo es muy grande. Máximo 5MB')
    }

    // Generar nombre único
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomId}.${extension}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Subir archivo
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        })

    if (error) throw error

    // Obtener URL pública
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

    return urlData.publicUrl
}

/**
 * Elimina una imagen de Supabase Storage
 * @param {string} url - URL completa de la imagen
 * @param {string} bucket - Nombre del bucket
 */
export async function deleteImage(url, bucket = 'images') {
    if (!url) return

    try {
        // Extraer path del URL
        const urlParts = url.split(`/storage/v1/object/public/${bucket}/`)
        if (urlParts.length < 2) return

        const filePath = urlParts[1]

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath])

        if (error) console.error('Error eliminando imagen:', error)
    } catch (err) {
        console.error('Error:', err)
    }
}

/**
 * Componente para previsualizar imagen antes de subir
 */
export function createImagePreview(file) {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
    })
}
