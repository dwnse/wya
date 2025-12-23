-- ============================================
-- CREAR USUARIO DE PRUEBA PARA ADMIN
-- ============================================
-- IMPORTANTE: Sigue estos pasos:
--
-- PASO 1: Ve a Supabase Dashboard > Authentication > Users
-- PASO 2: Clic en "Add user" > "Create new user"
-- PASO 3: Ingresa estos datos:
--         Email: admin@exo.com
--         Password: Admin123!
-- PASO 4: Copia el UUID del usuario creado
-- PASO 5: Reemplaza 'TU_AUTH_USER_ID_AQUI' con ese UUID
-- PASO 6: Ejecuta este SQL en Supabase SQL Editor
-- ============================================

-- Insertar administrador de prueba
-- NOTA: Reemplaza el auth_user_id con el UUID real del usuario de Supabase Auth
INSERT INTO administradores (
    auth_user_id,
    email,
    nombre,
    avatar_url,
    nivel_acceso,
    estado
) VALUES (
    'TU_AUTH_USER_ID_AQUI',  -- <-- REEMPLAZAR CON UUID REAL
    'admin@exo.com',
    'Admin EXO',
    '/images/logo123.jpg',
    5,  -- Super Admin (nivel máximo)
    'activo'
);

-- ============================================
-- ALTERNATIVA: Si ya tienes el UUID del usuario
-- Ejemplo con UUID ficticio (no usar en producción):
-- ============================================
/*
INSERT INTO administradores (
    auth_user_id,
    email,
    nombre,
    avatar_url,
    nivel_acceso,
    estado
) VALUES (
    '12345678-1234-1234-1234-123456789012',
    'admin@exo.com',
    'Admin EXO',
    '/images/logo123.jpg',
    5,
    'activo'
);
*/

-- ============================================
-- CREDENCIALES DE PRUEBA:
-- Email: admin@exo.com
-- Password: Admin123!
-- URL: http://localhost:5173/admin/login
-- ============================================
