-- ============================================
-- MIGRACIÓN: SISTEMA DE INTERACCIONES
-- Comentarios y Reacciones para Clips y Galería
-- ============================================

-- TABLA: reacciones
-- Almacena las reacciones de los usuarios
CREATE TABLE IF NOT EXISTS reacciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_contenido VARCHAR(20) NOT NULL CHECK (tipo_contenido IN ('clip', 'imagen')),
    contenido_id UUID NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para reacciones
CREATE INDEX IF NOT EXISTS idx_reacciones_contenido ON reacciones(tipo_contenido, contenido_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reacciones_unico ON reacciones(tipo_contenido, contenido_id, emoji, session_id);

-- TABLA: comentarios
-- Almacena los comentarios de los usuarios
CREATE TABLE IF NOT EXISTS comentarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo_contenido VARCHAR(20) NOT NULL CHECK (tipo_contenido IN ('clip', 'imagen')),
    contenido_id UUID NOT NULL,
    autor VARCHAR(50) NOT NULL,
    contenido TEXT NOT NULL CHECK (char_length(contenido) <= 500),
    session_id VARCHAR(100) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'eliminado')),
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para comentarios
CREATE INDEX IF NOT EXISTS idx_comentarios_contenido ON comentarios(tipo_contenido, contenido_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_estado ON comentarios(estado);

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- Habilitar RLS
ALTER TABLE reacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;

-- REACCIONES: Lectura pública
CREATE POLICY "Lectura pública reacciones" ON reacciones
    FOR SELECT USING (true);

-- REACCIONES: Insertar anónimo
CREATE POLICY "Insertar reacciones anónimo" ON reacciones
    FOR INSERT WITH CHECK (true);

-- REACCIONES: Eliminar propio (por session_id)
CREATE POLICY "Eliminar reacciones propias" ON reacciones
    FOR DELETE USING (true);

-- COMENTARIOS: Lectura pública (solo activos)
CREATE POLICY "Lectura pública comentarios" ON comentarios
    FOR SELECT USING (estado = 'activo');

-- COMENTARIOS: Insertar anónimo
CREATE POLICY "Insertar comentarios anónimo" ON comentarios
    FOR INSERT WITH CHECK (true);

-- COMENTARIOS: Admin puede todo
CREATE POLICY "Admin CRUD comentarios" ON comentarios
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- REACCIONES: Admin puede todo
CREATE POLICY "Admin CRUD reacciones" ON reacciones
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- VISTA: Conteo de reacciones por contenido
-- ============================================
CREATE OR REPLACE VIEW conteo_reacciones AS
SELECT 
    tipo_contenido,
    contenido_id,
    emoji,
    COUNT(*) as cantidad
FROM reacciones
GROUP BY tipo_contenido, contenido_id, emoji;
