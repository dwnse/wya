import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const UserAuthContext = createContext({})

export function UserAuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Verificar sesión actual
        checkUser()

        // Escuchar cambios de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    // Si el storage manual no tiene token, guardarlo aquí por si acaso
                    // (Esto maneja el caso donde supabase-js recupera sesión por sí mismo)
                    try {
                        const projectRef = import.meta.env.VITE_SUPABASE_URL.match(/\/\/([^.]+)\./)?.[1]
                        if (projectRef && session.access_token) {
                            const key = `sb-${projectRef}-auth-token`
                            if (!localStorage.getItem(key)) {
                                localStorage.setItem(key, JSON.stringify({
                                    access_token: session.access_token,
                                    refresh_token: session.refresh_token,
                                    user: session.user,
                                    expires_at: session.expires_at,
                                    token_type: session.token_type
                                }))
                            }
                        }
                    } catch (e) { }

                    await loadUserProfile(session.user.id)
                } else {
                    // Solo limpiar usuario si estamos seguros que no hay sesión manual válida
                    // Pero authStateChange 'SIGNED_OUT' es confiable
                    if (event === 'SIGNED_OUT') {
                        setUser(null)
                    }
                }
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    async function checkUser() {
        try {
            // Estrategia Manual de Recuperación de Sesión (Prioritaria)
            const projectRef = import.meta.env.VITE_SUPABASE_URL.match(/\/\/([^.]+)\./)?.[1]
            const key = `sb-${projectRef}-auth-token`
            const sessionStr = localStorage.getItem(key)

            let manualSessionValid = false

            if (sessionStr) {
                try {
                    const session = JSON.parse(sessionStr)
                    if (session.access_token) {
                        console.log('[UserAuthContext] Token encontrado en storage manual. Validando...')

                        // Validar token via REST API
                        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
                        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

                        const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
                            headers: {
                                'apikey': supabaseKey,
                                'Authorization': `Bearer ${session.access_token}`
                            }
                        })

                        if (response.ok) {
                            const userData = await response.json()
                            console.log('[UserAuthContext] Token válido. Usuario recuperado:', userData.id)
                            await loadUserProfile(userData.id)
                            manualSessionValid = true
                        } else {
                            console.warn('[UserAuthContext] Token inválido o expirado. Limpiando storage.')
                            localStorage.removeItem(key)
                        }
                    }
                } catch (e) {
                    console.error('Error parsing session from storage', e)
                }
            }

            if (manualSessionValid) return

            // Fallback a supabase-js
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                await loadUserProfile(authUser.id)
            } else {
                setUser(null)
            }
        } catch (error) {
            console.error('Error checking user:', error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    // Helper para headers
    async function getAuthHeaders() {
        try {
            const projectRef = import.meta.env.VITE_SUPABASE_URL.match(/\/\/([^.]+)\./)?.[1]
            const key = `sb-${projectRef}-auth-token`
            const sessionStr = localStorage.getItem(key)

            if (sessionStr) {
                const session = JSON.parse(sessionStr)
                if (session.access_token) {
                    return {
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${session.access_token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            }
        } catch (e) { }

        // Fallback
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY

        return {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }

    async function loadUserProfile(authUserId) {
        try {
            // Usar fetch directo para evitar hanging
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
            const headers = await getAuthHeaders()

            const response = await fetch(
                `${supabaseUrl}/rest/v1/usuarios?select=*,roles(nombre,color)&auth_user_id=eq.${authUserId}&estado=eq.activo&limit=1`,
                { headers }
            )

            if (!response.ok) throw new Error(`Error loading profile: ${response.status}`)
            const users = await response.json()
            const userData = users?.[0]

            if (userData) {
                // Aplanar rol
                if (userData.roles) {
                    userData.rol = userData.roles.nombre
                    userData.rol_color = userData.roles.color
                }
            }

            setUser(userData || null)
        } catch (error) {
            console.error('Error loading user profile:', error)

            // Si hay error cargando perfil pero tenemos authUser ID, intentar setear un usuario básico
            if (authUserId) {
                // Try to construct basic user if profile fails
                setUser({ id: 'temp_' + authUserId, auth_user_id: authUserId, nombre: 'Usuario', email: '' })
            } else {
                setUser(null)
            }
        }
    }

    async function register(email, password, nombre) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        console.log('[UserAuthContext] Starting registration...')

        try {
            // 1. Registrar usuario via REST API
            const authResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    data: { nombre }
                })
            })

            const authData = await authResponse.json()

            if (!authResponse.ok) {
                throw new Error(authData.msg || authData.message || (authData.error_description || 'Error al registrarse'))
            }

            // Caso: Email confirmación requerido
            if (authData.user && !authData.access_token) {
                return null
            }

            if (authData.user && authData.access_token) {
                try {
                    const token = authData.access_token
                    const headers = {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    }

                    const existingReq = await fetch(
                        `${supabaseUrl}/rest/v1/usuarios?auth_user_id=eq.${authData.user.id}&select=id`,
                        { headers }
                    )
                    const existing = await existingReq.json()

                    if (!existing?.length) {
                        await fetch(
                            `${supabaseUrl}/rest/v1/usuarios`,
                            {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({
                                    auth_user_id: authData.user.id,
                                    nombre: nombre.trim(),
                                    email: email
                                })
                            }
                        )
                    }
                } catch (e) {
                    console.error('Error creating profile fallback:', e)
                }
            }

            return authData.user
        } catch (e) {
            console.error('[UserAuthContext] Registration error:', e)
            throw e
        }
    }

    async function login(email, password) {
        console.log('[UserAuthContext] Intentando login REST...', email)
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        try {
            // 1. Login via REST API
            const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            })

            const authData = await authResponse.json()

            if (!authResponse.ok) {
                console.error('[UserAuthContext] Auth error REST:', authData)
                throw new Error(authData.error_description || authData.msg || 'Error al iniciar sesión')
            }

            console.log('[UserAuthContext] REST Login éxito')

            // Guardar token en localStorage manualmente
            if (authData.access_token) {
                try {
                    const projectRef = import.meta.env.VITE_SUPABASE_URL.match(/\/\/([^.]+)\./)?.[1]
                    if (projectRef) {
                        const key = `sb-${projectRef}-auth-token`
                        localStorage.setItem(key, JSON.stringify({
                            access_token: authData.access_token,
                            refresh_token: authData.refresh_token,
                            user: authData.user,
                            expires_at: Math.floor(Date.now() / 1000) + (authData.expires_in || 3600),
                            token_type: 'bearer'
                        }))
                    }
                } catch (e) { }
            }

            if (authData.user && authData.access_token) {
                const token = authData.access_token
                const headers = {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }

                // 3. Cargar perfil
                try {
                    let response = await fetch(
                        `${supabaseUrl}/rest/v1/usuarios?select=*,roles(nombre,color)&auth_user_id=eq.${authData.user.id}&estado=eq.activo&limit=1`,
                        { headers }
                    )

                    let users = await response.json()

                    // Si no existe perfil, crearlo
                    if (!users?.length) {
                        // ... (código de creación omitido para brevedad en replace, pero debo mantenerlo?)
                        // Mejor reemplazar solo el query fetch y luego el procesamiento
                        // Pero replace_file_content con bloques grandes es riesgoso.
                        // Haré un replace mas pequeño solo del fetch y luego del procesamiento
                    }

                    // REINTENTO CON REPLACE MAS PEQUEÑO


                    // Si no existe perfil, crearlo
                    if (!users?.length) {
                        // Intentar usar nombre de metadata
                        const metaName = authData.user.user_metadata?.nombre || authData.user.user_metadata?.name
                        const finalName = metaName || email.split('@')[0]

                        const createResponse = await fetch(
                            `${supabaseUrl}/rest/v1/usuarios`,
                            {
                                method: 'POST',
                                headers: { ...headers, 'Prefer': 'return=representation' },
                                body: JSON.stringify({
                                    auth_user_id: authData.user.id,
                                    nombre: finalName,
                                    email: email
                                })
                            }
                        )

                        if (createResponse.ok) {
                            users = await createResponse.json()
                        }
                    }

                    const userData = users?.[0]

                    // Actualizar último acceso (sin await)
                    if (userData) {
                        fetch(
                            `${supabaseUrl}/rest/v1/usuarios?id=eq.${userData.id}`,
                            {
                                method: 'PATCH',
                                headers,
                                body: JSON.stringify({ ultimo_acceso: new Date().toISOString() })
                            }
                        ).catch(e => { })
                    }

                    if (userData) {
                        // Aplanar rol en login también
                        if (userData.roles) {
                            userData.rol = userData.roles.nombre
                            userData.rol_color = userData.roles.color
                        }
                        setUser(userData)
                        return userData
                    }
                } catch (err) {
                    console.error('[UserAuthContext] Error en flujo de perfil:', err)
                }

                // Fallback
                const fallbackUser = {
                    id: 'temp_' + authData.user.id,
                    auth_user_id: authData.user.id,
                    nombre: email.split('@')[0],
                    email: email,
                    avatar_url: null
                }
                setUser(fallbackUser)
                return fallbackUser
            }

            return null
        } catch (e) {
            console.error('[UserAuthContext] Error en login:', e)
            throw e
        }
    }

    async function logout() {
        try {
            const projectRef = import.meta.env.VITE_SUPABASE_URL.match(/\/\/([^.]+)\./)?.[1]
            if (projectRef) {
                localStorage.removeItem(`sb-${projectRef}-auth-token`)
            }
        } catch (e) { }

        try {
            // Intentar, pero ignorar error si se cuelga
            supabase.auth.signOut().then(() => { }).catch(() => { })
        } catch (e) { }

        setUser(null)
    }

    async function updateProfile(updates) {
        if (!user) throw new Error('No hay usuario logueado')

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const headers = await getAuthHeaders()

        const response = await fetch(
            `${supabaseUrl}/rest/v1/usuarios?id=eq.${user.id}`,
            {
                method: 'PATCH',
                headers: { ...headers, 'Prefer': 'return=representation' },
                body: JSON.stringify(updates)
            }
        )

        if (!response.ok) throw new Error('Error updating profile')
        const data = await response.json()

        setUser(data[0])
        return data[0]
    }

    const value = {
        user,
        loading,
        isLoggedIn: !!user,
        register,
        login,
        logout,
        updateProfile
    }

    return (
        <UserAuthContext.Provider value={value}>
            {children}
        </UserAuthContext.Provider>
    )
}

export function useUserAuth() {
    const context = useContext(UserAuthContext)
    if (!context) {
        throw new Error('useUserAuth debe usarse dentro de UserAuthProvider')
    }
    return context
}

export default UserAuthContext
