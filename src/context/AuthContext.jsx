import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, onAuthStateChange, logout } from '../services/adminService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [admin, setAdmin] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkUser()
        const { data: { subscription } } = onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN') {
                await checkUser()
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                setAdmin(null)
            }
        })

        return () => {
            subscription?.unsubscribe()
        }
    }, [])

    async function checkUser() {
        try {
            const result = await getCurrentUser()
            if (result) {
                setUser(result.user)
                setAdmin(result.admin)
            } else {
                setUser(null)
                setAdmin(null)
            }
        } catch (error) {
            console.error('Error checking user:', error)
            setUser(null)
            setAdmin(null)
        } finally {
            setLoading(false)
        }
    }

    async function handleLogout() {
        try {
            await logout()
            setUser(null)
            setAdmin(null)
        } catch (error) {
            console.error('Error logging out:', error)
        }
    }

    const value = {
        user,
        admin,
        loading,
        isAuthenticated: !!admin,
        logout: handleLogout,
        refreshUser: checkUser
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
