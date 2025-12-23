-- ============================================
-- WYA - ESQUEMA DE BASE DE DATOS
-- Supabase PostgreSQL
-- ============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: administradores
-- Login para administradores del sistema
-- Vinculada a Supabase Auth (auth.users)
-- ============================================
CREATE TABLE administradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    nivel_acceso INT DEFAULT 1 CHECK (nivel_acceso BETWEEN 1 AND 5),
    ultimo_acceso TIMESTAMPTZ,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado')),
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Niveles de acceso:
-- 1 = Visualizador (solo lectura)
-- 2 = Editor (puede editar contenido)
-- 3 = Moderador (puede gestionar miembros)
-- 4 = Admin (acceso completo excepto super)
-- 5 = Super Admin (acceso total)

CREATE INDEX idx_administradores_auth ON administradores(auth_user_id);
CREATE INDEX idx_administradores_email ON administradores(email);
CREATE INDEX idx_administradores_estado ON administradores(estado);

-- ============================================
-- TABLA: permisos_admin
-- Permisos específicos por administrador
-- ============================================
CREATE TABLE permisos_admin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES administradores(id) ON DELETE CASCADE,
    tabla VARCHAR(50) NOT NULL,
    puede_crear BOOLEAN DEFAULT FALSE,
    puede_leer BOOLEAN DEFAULT TRUE,
    puede_editar BOOLEAN DEFAULT FALSE,
    puede_eliminar BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado')),
    UNIQUE(admin_id, tabla)
);

CREATE INDEX idx_permisos_admin ON permisos_admin(admin_id);
CREATE INDEX idx_permisos_estado ON permisos_admin(estado);

-- ============================================
-- TABLA: miembros
-- Miembros del clan WYA
-- ============================================
CREATE TABLE miembros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    nombre_mostrar VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    banner_url TEXT,
    biografia TEXT,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado')),
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_miembros_estado ON miembros(estado);
CREATE INDEX idx_miembros_nombre_usuario ON miembros(nombre_usuario);

-- ============================================
-- TABLA: roles
-- Roles del clan (Fundador, Admin, Miembro, etc.)
-- ============================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    color VARCHAR(7),
    prioridad INT DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado'))
);

CREATE INDEX idx_roles_estado ON roles(estado);

-- ============================================
-- TABLA: roles_miembro (Intermedia)
-- Relación muchos a muchos entre miembros y roles
-- ============================================
CREATE TABLE roles_miembro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    miembro_id UUID NOT NULL REFERENCES miembros(id) ON DELETE CASCADE,
    rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    asignado_en TIMESTAMPTZ DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado')),
    UNIQUE(miembro_id, rol_id)
);

CREATE INDEX idx_roles_miembro_miembro ON roles_miembro(miembro_id);
CREATE INDEX idx_roles_miembro_rol ON roles_miembro(rol_id);
CREATE INDEX idx_roles_miembro_estado ON roles_miembro(estado);

-- ============================================
-- TABLA: plataformas_sociales
-- Plataformas (YouTube, Discord, Twitch, etc.)
-- ============================================
CREATE TABLE plataformas_sociales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    icono_url TEXT,
    url_base TEXT,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado'))
);

CREATE INDEX idx_plataformas_estado ON plataformas_sociales(estado);

-- ============================================
-- TABLA: enlaces_sociales_miembro (Intermedia)
-- Enlaces sociales de cada miembro
-- ============================================
CREATE TABLE enlaces_sociales_miembro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    miembro_id UUID NOT NULL REFERENCES miembros(id) ON DELETE CASCADE,
    plataforma_id UUID NOT NULL REFERENCES plataformas_sociales(id) ON DELETE CASCADE,
    url_perfil TEXT NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado')),
    UNIQUE(miembro_id, plataforma_id)
);

CREATE INDEX idx_enlaces_sociales_miembro ON enlaces_sociales_miembro(miembro_id);
CREATE INDEX idx_enlaces_sociales_estado ON enlaces_sociales_miembro(estado);

-- ============================================
-- TABLA: categorias_clips
-- Categorías para organizar clips
-- ============================================
CREATE TABLE categorias_clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    orden_mostrar INT DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado'))
);

CREATE INDEX idx_categorias_clips_estado ON categorias_clips(estado);
CREATE INDEX idx_categorias_clips_slug ON categorias_clips(slug);

-- ============================================
-- TABLA: clips
-- Videos/Clips de YouTube
-- ============================================
CREATE TABLE clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    miembro_id UUID REFERENCES miembros(id) ON DELETE SET NULL,
    categoria_id UUID REFERENCES categorias_clips(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    youtube_url TEXT NOT NULL,
    miniatura_url TEXT,
    descripcion TEXT,
    destacado BOOLEAN DEFAULT FALSE,
    vistas INT DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado')),
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clips_miembro ON clips(miembro_id);
CREATE INDEX idx_clips_categoria ON clips(categoria_id);
CREATE INDEX idx_clips_estado ON clips(estado);
CREATE INDEX idx_clips_destacado ON clips(destacado);

-- ============================================
-- TABLA: categorias_galeria
-- Categorías de galería (Wins, Giveaways, Memes)
-- ============================================
CREATE TABLE categorias_galeria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    orden_mostrar INT DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado'))
);

CREATE INDEX idx_categorias_galeria_estado ON categorias_galeria(estado);
CREATE INDEX idx_categorias_galeria_slug ON categorias_galeria(slug);

-- ============================================
-- TABLA: imagenes_galeria
-- Imágenes de la galería
-- ============================================
CREATE TABLE imagenes_galeria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    miembro_id UUID REFERENCES miembros(id) ON DELETE SET NULL,
    categoria_id UUID REFERENCES categorias_galeria(id) ON DELETE SET NULL,
    titulo VARCHAR(200),
    imagen_url TEXT NOT NULL,
    miniatura_url TEXT,
    descripcion TEXT,
    destacado BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado')),
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_imagenes_galeria_miembro ON imagenes_galeria(miembro_id);
CREATE INDEX idx_imagenes_galeria_categoria ON imagenes_galeria(categoria_id);
CREATE INDEX idx_imagenes_galeria_estado ON imagenes_galeria(estado);

-- ============================================
-- TABLA: carries
-- Top Clan / Pros destacados
-- ============================================
CREATE TABLE carries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    miembro_id UUID UNIQUE NOT NULL REFERENCES miembros(id) ON DELETE CASCADE,
    titulo VARCHAR(100),
    especialidad VARCHAR(100),
    logros TEXT,
    orden INT DEFAULT 0,
    destacado BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado')),
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_carries_miembro ON carries(miembro_id);
CREATE INDEX idx_carries_estado ON carries(estado);
CREATE INDEX idx_carries_orden ON carries(orden);

-- ============================================
-- TABLA: tipos_vetado
-- Categorías de vetados (Traidor, Ficha, etc.)
-- ============================================
CREATE TABLE tipos_vetado (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    nivel_peligro INT DEFAULT 1 CHECK (nivel_peligro BETWEEN 1 AND 5),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado'))
);

CREATE INDEX idx_tipos_vetado_estado ON tipos_vetado(estado);

-- ============================================
-- TABLA: vetados
-- Personas vetadas/traidores/fichas enemigas
-- ============================================
CREATE TABLE vetados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    alias VARCHAR(100),
    imagen_url TEXT,
    tipo_id UUID REFERENCES tipos_vetado(id) ON DELETE SET NULL,
    razon TEXT NOT NULL,
    evidencia_url TEXT,
    notas TEXT,
    fecha_incidente DATE,
    reportado_por UUID REFERENCES miembros(id) ON DELETE SET NULL,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'eliminado')),
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vetados_tipo ON vetados(tipo_id);
CREATE INDEX idx_vetados_estado ON vetados(estado);
CREATE INDEX idx_vetados_reportado ON vetados(reportado_por);

-- ============================================
-- FUNCIÓN: Actualizar timestamp
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para miembros
CREATE TRIGGER trigger_actualizar_miembros
    BEFORE UPDATE ON miembros
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles_miembro ENABLE ROW LEVEL SECURITY;
ALTER TABLE plataformas_sociales ENABLE ROW LEVEL SECURITY;
ALTER TABLE enlaces_sociales_miembro ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_galeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagenes_galeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE carries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_vetado ENABLE ROW LEVEL SECURITY;
ALTER TABLE vetados ENABLE ROW LEVEL SECURITY;

-- Políticas para administradores (solo ellos mismos pueden ver su info)
CREATE POLICY "Admin ve su propio perfil" ON administradores 
    FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Admin actualiza su perfil" ON administradores 
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Políticas para permisos (solo el admin puede ver sus permisos)
CREATE POLICY "Admin ve sus permisos" ON permisos_admin 
    FOR SELECT USING (
        admin_id IN (SELECT id FROM administradores WHERE auth_user_id = auth.uid())
    );

-- Políticas de lectura pública (SELECT)
CREATE POLICY "Lectura pública miembros" ON miembros FOR SELECT USING (estado = 'activo');
CREATE POLICY "Lectura pública roles" ON roles FOR SELECT USING (estado = 'activo');
CREATE POLICY "Lectura pública roles_miembro" ON roles_miembro FOR SELECT USING (estado = 'activo');
CREATE POLICY "Lectura pública plataformas" ON plataformas_sociales FOR SELECT USING (estado = 'activo');
CREATE POLICY "Lectura pública enlaces" ON enlaces_sociales_miembro FOR SELECT USING (estado = 'activo');
CREATE POLICY "Lectura pública cat_clips" ON categorias_clips FOR SELECT USING (estado = 'activo');
CREATE POLICY "Lectura pública clips" ON clips FOR SELECT USING (estado = 'activo');
CREATE POLICY "Lectura pública cat_galeria" ON categorias_galeria FOR SELECT USING (estado = 'activo');
CREATE POLICY "Lectura pública imagenes" ON imagenes_galeria FOR SELECT USING (estado = 'activo');
CREATE POLICY "Lectura pública carries" ON carries FOR SELECT USING (estado = 'activo');
CREATE POLICY "Lectura pública tipos_vetado" ON tipos_vetado FOR SELECT USING (estado = 'activo');
CREATE POLICY "Lectura pública vetados" ON vetados FOR SELECT USING (estado = 'activo');

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================
