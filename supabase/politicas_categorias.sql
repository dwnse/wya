-- ============================================
-- POLÍTICAS RLS PARA CATEGORÍAS Y TIPOS
-- ============================================
-- Ejecuta esto en Supabase SQL Editor

-- CATEGORÍAS GALERÍA
CREATE POLICY "Lectura pública categorias_galeria" ON categorias_galeria 
    FOR SELECT USING (true);
CREATE POLICY "Admin CRUD categorias_galeria" ON categorias_galeria 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CATEGORÍAS CLIPS
CREATE POLICY "Lectura pública categorias_clips" ON categorias_clips 
    FOR SELECT USING (true);
CREATE POLICY "Admin CRUD categorias_clips" ON categorias_clips 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- TIPOS VETADO
CREATE POLICY "Lectura pública tipos_vetado" ON tipos_vetado 
    FOR SELECT USING (true);
CREATE POLICY "Admin CRUD tipos_vetado" ON tipos_vetado 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ROLES
CREATE POLICY "Lectura pública roles" ON roles 
    FOR SELECT USING (true);
CREATE POLICY "Admin CRUD roles" ON roles 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PLATAFORMAS SOCIALES
CREATE POLICY "Lectura pública plataformas_sociales" ON plataformas_sociales 
    FOR SELECT USING (true);
CREATE POLICY "Admin CRUD plataformas_sociales" ON plataformas_sociales 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
