-- ============================================
-- FIX URGENTE: Restaurar acceso a datos
-- Ejecutar TODO este SQL en Supabase SQL Editor
-- ============================================

-- OPCIÓN 1: Deshabilitar RLS temporalmente para debug
-- (Comentar esto después de verificar que funciona)

-- ============================================
-- TABLAS PRINCIPALES - Asegurar lectura pública
-- ============================================

-- MIEMBROS
ALTER TABLE miembros ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública miembros" ON miembros;
CREATE POLICY "Permitir lectura pública miembros" ON miembros
    FOR SELECT TO anon, authenticated USING (true);

-- ROLES_MIEMBRO (tabla de relación)
ALTER TABLE roles_miembro ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública roles_miembro" ON roles_miembro;
CREATE POLICY "Permitir lectura pública roles_miembro" ON roles_miembro
    FOR SELECT TO anon, authenticated USING (true);

-- ENLACES_SOCIALES_MIEMBRO
ALTER TABLE enlaces_sociales_miembro ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública enlaces" ON enlaces_sociales_miembro;
CREATE POLICY "Permitir lectura pública enlaces" ON enlaces_sociales_miembro
    FOR SELECT TO anon, authenticated USING (true);

-- ROLES
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública roles" ON roles;
CREATE POLICY "Permitir lectura pública roles" ON roles
    FOR SELECT TO anon, authenticated USING (true);

-- PLATAFORMAS_SOCIALES
ALTER TABLE plataformas_sociales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública plataformas" ON plataformas_sociales;
CREATE POLICY "Permitir lectura pública plataformas" ON plataformas_sociales
    FOR SELECT TO anon, authenticated USING (true);

-- ============================================
-- CLIPS
-- ============================================

ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública clips" ON clips;
CREATE POLICY "Permitir lectura pública clips" ON clips
    FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE categorias_clips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública cat_clips" ON categorias_clips;
CREATE POLICY "Permitir lectura pública cat_clips" ON categorias_clips
    FOR SELECT TO anon, authenticated USING (true);

-- ============================================
-- GALERÍA
-- ============================================

ALTER TABLE imagenes_galeria ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública galeria" ON imagenes_galeria;
CREATE POLICY "Permitir lectura pública galeria" ON imagenes_galeria
    FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE categorias_galeria ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública cat_galeria" ON categorias_galeria;
CREATE POLICY "Permitir lectura pública cat_galeria" ON categorias_galeria
    FOR SELECT TO anon, authenticated USING (true);

-- ============================================
-- CARRIES (TOP CLAN)
-- ============================================

ALTER TABLE carries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública carries" ON carries;
CREATE POLICY "Permitir lectura pública carries" ON carries
    FOR SELECT TO anon, authenticated USING (true);

-- ============================================
-- VETADOS
-- ============================================

ALTER TABLE vetados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública vetados" ON vetados;
CREATE POLICY "Permitir lectura pública vetados" ON vetados
    FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE tipos_vetado ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública tipos_vetado" ON tipos_vetado;
CREATE POLICY "Permitir lectura pública tipos_vetado" ON tipos_vetado
    FOR SELECT TO anon, authenticated USING (true);

-- ============================================
-- INTERACCIONES
-- ============================================

ALTER TABLE reacciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública reacciones" ON reacciones;
CREATE POLICY "Permitir lectura pública reacciones" ON reacciones
    FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública comentarios" ON comentarios;
CREATE POLICY "Permitir lectura pública comentarios" ON comentarios
    FOR SELECT TO anon, authenticated USING (true);

-- ============================================
-- USUARIOS
-- ============================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública usuarios" ON usuarios;
CREATE POLICY "Permitir lectura pública usuarios" ON usuarios
    FOR SELECT TO anon, authenticated USING (true);

-- ============================================
-- VERIFICAR QUE TODO ESTÁ BIEN
-- ============================================

-- Esta consulta debe devolver resultados
SELECT 'miembros' as tabla, COUNT(*) as total FROM miembros
UNION ALL
SELECT 'clips', COUNT(*) FROM clips
UNION ALL
SELECT 'imagenes_galeria', COUNT(*) FROM imagenes_galeria
UNION ALL
SELECT 'carries', COUNT(*) FROM carries
UNION ALL
SELECT 'vetados', COUNT(*) FROM vetados;
