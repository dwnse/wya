-- ============================================
-- MIGRACIÓN: SISTEMA DE USUARIOS PÚBLICOS
-- Login separado del panel de administración
-- ============================================

-- TABLA: usuarios
-- Usuarios públicos que pueden comentar y reaccionar
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID UNIQUE, -- ID de Supabase Auth
    nombre VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    email VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'eliminado')),
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    ultimo_acceso TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_auth ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado);

-- ============================================
-- MODIFICAR TABLAS EXISTENTES
-- ============================================

-- Agregar usuario_id a reacciones (opcional, para usuarios logueados)
ALTER TABLE reacciones ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES usuarios(id);

-- Agregar usuario_id a comentarios (requerido para usuarios logueados)
ALTER TABLE comentarios ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES usuarios(id);

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_reacciones_usuario ON reacciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario ON comentarios(usuario_id);

-- ============================================
-- POLÍTICAS RLS PARA USUARIOS
-- ============================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Lectura pública de usuarios (solo nombre y avatar)
CREATE POLICY "Lectura pública usuarios" ON usuarios
    FOR SELECT USING (estado = 'activo');

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Usuario actualiza su perfil" ON usuarios
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Insertar al registrarse
CREATE POLICY "Insertar usuario al registrarse" ON usuarios
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Admin puede todo
CREATE POLICY "Admin CRUD usuarios" ON usuarios
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM administradores 
            WHERE auth_user_id = auth.uid() 
            AND estado = 'activo'
        )
    );

-- ============================================
-- ACTUALIZAR POLÍTICAS DE COMENTARIOS
-- ============================================

-- Reemplazar política de inserción de comentarios
DROP POLICY IF EXISTS "Insertar comentarios anónimo" ON comentarios;

CREATE POLICY "Insertar comentarios usuario logueado" ON comentarios
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE auth_user_id = auth.uid() 
            AND estado = 'activo'
        )
    );

-- ============================================
-- ACTUALIZAR POLÍTICAS DE REACCIONES
-- ============================================

DROP POLICY IF EXISTS "Insertar reacciones anónimo" ON reacciones;

CREATE POLICY "Insertar reacciones usuario logueado" ON reacciones
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE auth_user_id = auth.uid() 
            AND estado = 'activo'
        )
    );

DROP POLICY IF EXISTS "Eliminar reacciones propias" ON reacciones;

CREATE POLICY "Eliminar reacciones propias usuario" ON reacciones
    FOR DELETE USING (
        usuario_id IN (
            SELECT id FROM usuarios WHERE auth_user_id = auth.uid()
        )
    );

-- ============================================
-- FUNCIÓN: Crear usuario al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_public_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (auth_user_id, nombre, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nota: El trigger se debe crear manualmente si se desea auto-crear usuarios
-- CREATE TRIGGER on_auth_user_created_public
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.handle_new_public_user();
