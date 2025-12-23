-- ============================================
-- CONFIGURAR SUPABASE STORAGE PARA IMÁGENES
-- ============================================
-- Ejecuta esto en Supabase SQL Editor

-- 1. Crear bucket público para imágenes
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Política para permitir lectura pública
CREATE POLICY "Lectura pública de imágenes" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'images');

-- 3. Política para permitir subida a usuarios autenticados
CREATE POLICY "Usuarios autenticados suben imágenes" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'images');

-- 4. Política para permitir actualización a usuarios autenticados
CREATE POLICY "Usuarios autenticados actualizan imágenes" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'images');

-- 5. Política para permitir eliminación a usuarios autenticados
CREATE POLICY "Usuarios autenticados eliminan imágenes" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'images');

-- ============================================
-- VERIFICAR CONFIGURACIÓN
-- ============================================
SELECT * FROM storage.buckets WHERE id = 'images';
