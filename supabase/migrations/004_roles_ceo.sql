-- ============================================
-- MIGRACIÓN 004: IMPLEMENTACIÓN DE ROL CEO
-- ============================================

-- 1. Agregar columna rol_id a tabla usuarios (si no existe)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS rol_id UUID REFERENCES roles(id) ON DELETE SET NULL;

-- 2. Asegurar que existe el rol 'CEO'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'CEO') THEN
        INSERT INTO roles (nombre, descripcion, color, prioridad, estado)
        VALUES ('CEO', 'Rol con permisos de moderación global', '#FFD700', 100, 'activo');
    END IF;
END $$;

-- 3. Crear índice para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol_id);

-- 4. Actualizar políticas de COMENTARIOS para permitir al CEO eliminar cualquiera
-- Primero eliminamos la política anterior si es muy restrictiva o creamos una nueva que la complemente.
-- Como las políticas son OR (permisivas), basta con agregar una nueva.

CREATE POLICY "CEO elimina cualquier comentario" ON comentarios
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            WHERE u.auth_user_id = auth.uid()
            AND r.nombre = 'CEO'
            AND u.estado = 'activo'
        )
    );

-- Nota: Para que el usuario pueda ver el botón en el frontend, necesitaremos leer el rol en el contexto.

-- 5. Actualizar la vista/lectura de usuarios para incluir el rol (opcional, se hace en el query)
