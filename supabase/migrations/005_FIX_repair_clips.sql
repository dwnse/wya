-- ============================================
-- SCRIPT DE REPARACIÓN (Clips y Administradores)
-- Ejecuta este script para arreglar el estado de la base de datos
-- ============================================

-- 1. Asegurar que la tabla 'administradores' tenga la política correcta
-- (Para solucionar el error 406 si fuera por RLS faltante, aunque 406 suele ser "no encontrado" en single())
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin ve su propio perfil" ON administradores;
CREATE POLICY "Admin ve su propio perfil" ON administradores 
    FOR SELECT USING (auth.uid() = auth_user_id);

-- 2. REPARAR TABLA CLIPS (Constraint y Datos)
-- Eliminamos el check antiguo para evitar errores
ALTER TABLE clips DROP CONSTRAINT IF EXISTS clips_estado_check;

-- Actualizamos los estados antiguos ('activo' -> 'aprobado')
UPDATE clips SET estado = 'aprobado' WHERE estado = 'activo';

-- Agregamos el check nuevo COMPLETO
ALTER TABLE clips 
ADD CONSTRAINT clips_estado_check 
CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'eliminado', 'activo', 'inactivo'));
-- Nota: Dejamos 'activo' por seguridad, pero usamos 'aprobado' principalmente.

-- 3. RESTAURAR VISIBILIDAD DE CLIPS (Políticas RLS)
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

-- Borrar políticas potencialmente corruptas o antiguas
DROP POLICY IF EXISTS "Lectura pública clips" ON clips;
DROP POLICY IF EXISTS "Lectura pública clips aprobados" ON clips;
DROP POLICY IF EXISTS "Usuario ve sus propios clips" ON clips;
DROP POLICY IF EXISTS "Usuario crea clips" ON clips;
DROP POLICY IF EXISTS "Admin gestiona todos los clips" ON clips;

-- Política 1: Lectura Pública (Cualquiera puede ver aprobados)
CREATE POLICY "Lectura pública clips aprobados" ON clips
    FOR SELECT USING (estado IN ('aprobado', 'activo'));

-- Política 2: Usuario ve sus propios clips (Logueado ve todo lo suyo)
CREATE POLICY "Usuario ve sus propios clips" ON clips
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_user_id FROM usuarios WHERE id = usuario_id
        )
    );

-- Política 3: Usuario crea clips
CREATE POLICY "Usuario crea clips" ON clips
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT auth_user_id FROM usuarios WHERE id = usuario_id
        )
    );

-- Política 4: Admin Gestión Total (Puede ver/editar TODO)
CREATE POLICY "Admin gestiona todos los clips" ON clips
    FOR ALL USING (
        -- Check simple: Si existe en tabla administradores como activo
        EXISTS (
            SELECT 1 FROM administradores 
            WHERE auth_user_id = auth.uid() 
            AND estado = 'activo'
        )
    );

-- 4. Verificar columna usuario_id
ALTER TABLE clips 
ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_clips_usuario ON clips(usuario_id);
