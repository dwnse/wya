import { useState, useEffect } from 'react'
import {
    obtenerMiembros,
    obtenerClips,
    obtenerCategoriasClips,
    obtenerImagenesGaleria,
    obtenerCategoriasGaleria,
    obtenerCarries,
    obtenerVetados,
    obtenerTiposVetado
} from '../services/supabaseService'

// Hook genérico para fetching
function useSupabaseQuery(queryFn, deps = []) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true

        async function fetchData() {
            try {
                setLoading(true)
                const result = await queryFn()
                if (isMounted) {
                    setData(result)
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchData()

        return () => {
            isMounted = false
        }
    }, deps)

    return { data, loading, error, refetch: () => queryFn().then(setData) }
}

// Hooks específicos
export function useMiembros() {
    return useSupabaseQuery(obtenerMiembros)
}

export function useClips() {
    return useSupabaseQuery(obtenerClips)
}

export function useCategoriasClips() {
    return useSupabaseQuery(obtenerCategoriasClips)
}

export function useImagenesGaleria() {
    return useSupabaseQuery(obtenerImagenesGaleria)
}

export function useCategoriasGaleria() {
    return useSupabaseQuery(obtenerCategoriasGaleria)
}

export function useCarries() {
    return useSupabaseQuery(obtenerCarries)
}

export function useVetados() {
    return useSupabaseQuery(obtenerVetados)
}

export function useTiposVetado() {
    return useSupabaseQuery(obtenerTiposVetado)
}

// Hook para clips agrupados por miembro
export function useClipsAgrupados() {
    const { data: clips, loading, error } = useClips()

    const clipsAgrupados = clips?.reduce((acc, clip) => {
        const miembroId = clip.miembros?.id || 'sin-miembro'
        const miembroNombre = clip.miembros?.nombre_mostrar || 'Sin asignar'

        if (!acc[miembroId]) {
            acc[miembroId] = {
                miembro: clip.miembros,
                clips: []
            }
        }
        acc[miembroId].clips.push(clip)
        return acc
    }, {})

    return {
        data: clipsAgrupados ? Object.values(clipsAgrupados) : null,
        loading,
        error
    }
}

// Hook para galería agrupada por categoría
export function useGaleriaAgrupada() {
    const { data: imagenes, loading, error } = useImagenesGaleria()

    const imagenesAgrupadas = imagenes?.reduce((acc, img) => {
        const catSlug = img.categorias_galeria?.slug || 'otros'
        const catNombre = img.categorias_galeria?.nombre || 'Otros'

        if (!acc[catSlug]) {
            acc[catSlug] = {
                categoria: img.categorias_galeria,
                imagenes: []
            }
        }
        acc[catSlug].imagenes.push(img)
        return acc
    }, {})

    return {
        data: imagenesAgrupadas ? Object.values(imagenesAgrupadas) : null,
        loading,
        error
    }
}
