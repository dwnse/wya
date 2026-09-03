import { supabase } from '../supabaseClient'

export async function uploadImage(file, bucket = 'images', folder = '') {
    if (!file) throw new Error('No se proporcionó ningún archivo')
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no válido. Use JPG, PNG, GIF o WebP')
    }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
        throw new Error('El archivo es muy grande. Máximo 5MB')
    }
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomId}.${extension}`
    const filePath = folder ? `${folder}/${fileName}` : fileName
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        })

    if (error) throw error
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

    return urlData.publicUrl
}

export async function deleteImage(url, bucket = 'images') {
    if (!url) return

    try {
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

export function createImagePreview(file) {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
    })
}
