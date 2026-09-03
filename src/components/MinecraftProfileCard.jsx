import { useEffect, useRef, useState } from 'react'
import { SkinViewer } from 'skinview3d'
import { Icon } from './Icons.jsx'
import { consultarPerfilMinecraft } from '../services/minecraftService.js'

// Función auxiliar para obtener la URL de la capa
function getCapeTextureUrl(cape, profile) {
    // Si es la capa oficial de Minecraft, usamos la URL del servidor (sin CORS)
    if (cape.source?.toLowerCase() === 'minecraft' && profile?.cape) return profile.cape
    
    // Si es Optifine... ¡LO DESCARTAMOS TOTALMENTE!
    if (cape.source?.toLowerCase() === 'optifine') return null
    
    // Cualquier otra fuente
    return cape.textureUrl || cape.url
}

function CapeViewer({ cape, profile }) {
    const canvasRef = useRef(null)
    const viewerRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const [failed, setFailed] = useState(false)
    const textureUrl = getCapeTextureUrl(cape, profile)

    useEffect(() => {
        if (!textureUrl || !canvasRef.current) return undefined

        setLoading(true)
        setFailed(false)

        const viewer = new SkinViewer({
            canvas: canvasRef.current,
            width: 110,
            height: 110,
            cape: textureUrl,
            skin: null,
            background: 0x000000,
            fov: 26,
            zoom: 0.65,
            enableControls: true
        })

        viewer.renderer.setClearColor(0x000000, 0)
        viewer.controls.enablePan = false
        viewer.controls.enableRotate = true
        viewer.controls.enableZoom = true
        viewer.controls.rotateSpeed = 0.7
        viewer.controls.zoomSpeed = 0.8
        viewer.controls.minDistance = 8
        viewer.controls.maxDistance = 24
        viewer.playerObject.skin.visible = false
        viewer.playerObject.cape.visible = true
        viewer.playerObject.elytra.visible = false
        viewer.playerWrapper.rotation.y = Math.PI
        viewer.playerWrapper.rotation.x = 0
        viewer.playerObject.position.set(0, -0.15, 0)
        viewer.playerObject.rotation.set(0, 0, 0)
        viewer.playerObject.scale.set(0.48, 0.48, 0.48)
        viewer.resetCameraPose()
        viewer.controls.update()

        viewerRef.current = viewer

        const image = new window.Image()
        image.onload = () => {
            if (!viewerRef.current || viewerRef.current.disposed) return
            setLoading(false)
        }
        image.onerror = () => {
            setFailed(true)
            setLoading(false)
        }
        image.src = textureUrl

        return () => {
            viewerRef.current = null
            viewer.dispose()
        }
    }, [textureUrl])

    if (!textureUrl) return null

    return (
        <div className="minecraft-cape-viewer" aria-label={`Capa ${cape.source || 'Minecraft'}`}>
            {loading && !failed ? <span className="minecraft-cape-loading">Cargando…</span> : null}
            {!failed ? <canvas ref={canvasRef} /> : <span className="minecraft-cape-error">Vista no disponible</span>}
        </div>
    )
}

function MinecraftProfileCard({ username }) {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(Boolean(username))
    const canvasRef = useRef(null)
    const activeCape = profile?.cape ? { source: 'Minecraft', textureUrl: profile.cape, url: profile.cape } : null

    useEffect(() => {
        if (loading || !profile?.skin || !canvasRef.current) return undefined
        const viewer = new SkinViewer({
            canvas: canvasRef.current,
            width: 260,
            height: 320,
            skin: profile.skin,
            cape: profile.cape || undefined
        })
        viewer.fov = 50
        viewer.zoom = 0.72
        viewer.controls.enableZoom = true
        viewer.controls.enablePan = false
        viewer.renderer.setClearColor(0x000000, 0)

        return () => viewer.dispose()
    }, [loading, profile])

    useEffect(() => {
        let active = true
        if (!username) {
            setProfile({ found: false, premium: false, skin: 'https://mc-heads.net/skin/Steve', model: 'classic', cape: null, capes: [] })
            setLoading(false)
            return undefined
        }

        setLoading(true)
        consultarPerfilMinecraft(username).then(data => {
            if (active) setProfile(data)
        }).finally(() => {
            if (active) setLoading(false)
        })

        return () => { active = false }
    }, [username])

    return (
        <section className="minecraft-profile-card profile-panel">
            <div className="panel-title"><span>Perfil Minecraft Java</span><Icon name="skull" size={17} /></div>
            {loading ? <div className="minecraft-profile-loading">Consultando perfil Premium...</div> : <div className="minecraft-profile-content">
                <div className="minecraft-profile-main">
                    <div className="minecraft-skin-frame"><canvas ref={canvasRef} aria-label={`Skin 3D de ${profile?.name || 'Steve'}`} /></div>
                    <div className="minecraft-profile-data">
                        <div><span>Estado</span><strong className={profile?.found ? 'minecraft-online' : 'minecraft-missing'}>{profile?.found ? 'Premium on' : profile?.code === 'NOT_FOUND' ? 'Premium off' : 'No se pudo verificar el perfil'}</strong></div>
                        {profile?.found && <>
                            <div><span>Nombre actual</span><strong>{profile.name}</strong></div>
                            <div><span>UUID</span><strong className="minecraft-uuid">{profile.uuid}</strong></div>
                            {activeCape && <div className="minecraft-profile-cape">
                                <span>Capa</span>
                                <CapeViewer cape={activeCape} profile={profile} />
                            </div>}
                        </>}
                    </div>
                </div>
            </div>}
        </section>
    )
}

export default MinecraftProfileCard