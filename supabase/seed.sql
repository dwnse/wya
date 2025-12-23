-- ============================================
-- WYA - DATOS INICIALES (SEED)
-- Ejecutar después de las migraciones
-- ============================================

-- ============================================
-- PLATAFORMAS SOCIALES
-- ============================================
INSERT INTO plataformas_sociales (nombre, icono_url, url_base) VALUES
    ('YouTube', '/images/ytlogo.png', 'https://www.youtube.com/'),
    ('Discord', '/images/discord.png', 'https://discord.gg/'),
    ('Twitch', '/images/twitch.png', 'https://www.twitch.tv/'),
    ('Twitter', '/images/twitter.png', 'https://twitter.com/'),
    ('Instagram', '/images/instagram.png', 'https://www.instagram.com/'),
    ('TikTok', '/images/tiktok.png', 'https://www.tiktok.com/@');

-- ============================================
-- ROLES
-- ============================================
INSERT INTO roles (nombre, descripcion, color, prioridad) VALUES
    ('Fundador', 'Fundadores del clan WYA', '#FFD700', 100),
    ('Admin', 'Administradores del clan', '#FF4500', 90),
    ('Moderador', 'Moderadores del servidor', '#9B59B6', 80),
    ('Pro Player', 'Jugadores profesionales del clan', '#E74C3C', 70),
    ('Miembro', 'Miembros activos del clan', '#3498DB', 50),
    ('Novato', 'Nuevos miembros', '#95A5A6', 10);

-- ============================================
-- TIPOS DE VETADO
-- ============================================
INSERT INTO tipos_vetado (nombre, descripcion, icono, nivel_peligro) VALUES
    ('Traidor', 'Personas que traicionaron al clan', '🗡️', 5),
    ('Ficha', 'Enemigos importantes a vigilar', '👁️', 4),
    ('Toxico', 'Comportamiento tóxico extremo', '☠️', 3),
    ('Scammer', 'Estafadores confirmados', '💰', 4),
    ('Cheater', 'Uso confirmado de trampas', '🎮', 3);

-- ============================================
-- CATEGORÍAS DE CLIPS
-- ============================================
INSERT INTO categorias_clips (nombre, slug, descripcion, orden_mostrar) VALUES
    ('Highlights', 'highlights', 'Las mejores jugadas', 1),
    ('Fails', 'fails', 'Los momentos más graciosos', 2),
    ('Torneos', 'torneos', 'Clips de competiciones oficiales', 3),
    ('Ranked', 'ranked', 'Partidas competitivas', 4);

-- ============================================
-- CATEGORÍAS DE GALERÍA
-- ============================================
INSERT INTO categorias_galeria (nombre, slug, descripcion, orden_mostrar) VALUES
    ('Wins', 'wins', 'Victorias del clan', 1),
    ('Giveaways', 'giveaways', 'Sorteos y premios', 2),
    ('Memes', 'memes', 'Los mejores memes del clan', 3),
    ('Eventos', 'eventos', 'Fotos de eventos', 4);

-- ============================================
-- MIEMBROS INICIALES
-- ============================================
INSERT INTO miembros (nombre_usuario, nombre_mostrar, avatar_url, biografia) VALUES
    ('cirze', 'Cirze', '/images/logo123.jpg', 'Miembro destacado del clan WYA'),
    ('teki', 'Teki', '/images/logo123.jpg', 'Pro player del clan WYA'),
    ('polco', 'Polco', '/images/logo123.jpg', 'Miembro del clan WYA');

-- ============================================
-- ENLACES SOCIALES DE MIEMBROS
-- ============================================
-- Obtener IDs de miembros y plataformas
DO $$
DECLARE
    v_youtube_id UUID;
    v_cirze_id UUID;
    v_teki_id UUID;
    v_polco_id UUID;
BEGIN
    -- Obtener ID de YouTube
    SELECT id INTO v_youtube_id FROM plataformas_sociales WHERE nombre = 'YouTube';
    
    -- Obtener IDs de miembros
    SELECT id INTO v_cirze_id FROM miembros WHERE nombre_usuario = 'cirze';
    SELECT id INTO v_teki_id FROM miembros WHERE nombre_usuario = 'teki';
    SELECT id INTO v_polco_id FROM miembros WHERE nombre_usuario = 'polco';
    
    -- Insertar enlaces
    INSERT INTO enlaces_sociales_miembro (miembro_id, plataforma_id, url_perfil, es_principal) VALUES
        (v_cirze_id, v_youtube_id, 'https://www.youtube.com/@Cirze-yz2ok', TRUE),
        (v_teki_id, v_youtube_id, 'https://www.youtube.com/channel/UCEA2B_LTkejAm9q4vlXKzwQ', TRUE),
        (v_polco_id, v_youtube_id, 'https://www.youtube.com/@polcoo.', TRUE);
END $$;

-- ============================================
-- ASIGNAR ROLES A MIEMBROS
-- ============================================
DO $$
DECLARE
    v_pro_id UUID;
    v_miembro_id UUID;
    v_cirze_id UUID;
    v_teki_id UUID;
    v_polco_id UUID;
BEGIN
    -- Obtener IDs de roles
    SELECT id INTO v_pro_id FROM roles WHERE nombre = 'Pro Player';
    SELECT id INTO v_miembro_id FROM roles WHERE nombre = 'Miembro';
    
    -- Obtener IDs de miembros
    SELECT id INTO v_cirze_id FROM miembros WHERE nombre_usuario = 'cirze';
    SELECT id INTO v_teki_id FROM miembros WHERE nombre_usuario = 'teki';
    SELECT id INTO v_polco_id FROM miembros WHERE nombre_usuario = 'polco';
    
    -- Asignar roles
    INSERT INTO roles_miembro (miembro_id, rol_id) VALUES
        (v_cirze_id, v_pro_id),
        (v_teki_id, v_pro_id),
        (v_polco_id, v_miembro_id);
END $$;

-- ============================================
-- CLIPS INICIALES
-- ============================================
DO $$
DECLARE
    v_highlights_id UUID;
    v_cirze_id UUID;
    v_teki_id UUID;
    v_polco_id UUID;
BEGIN
    SELECT id INTO v_highlights_id FROM categorias_clips WHERE slug = 'highlights';
    SELECT id INTO v_cirze_id FROM miembros WHERE nombre_usuario = 'cirze';
    SELECT id INTO v_teki_id FROM miembros WHERE nombre_usuario = 'teki';
    SELECT id INTO v_polco_id FROM miembros WHERE nombre_usuario = 'polco';
    
    INSERT INTO clips (miembro_id, categoria_id, titulo, youtube_url, destacado) VALUES
        (v_cirze_id, v_highlights_id, 'Cirze Clip 1', 'https://www.youtube.com/embed/kl6bre7c39s', TRUE),
        (v_cirze_id, v_highlights_id, 'Cirze Clip 2', 'https://www.youtube.com/embed/EqpfY4zAtWQ', FALSE),
        (v_teki_id, v_highlights_id, 'Teki Clip 1', 'https://www.youtube.com/embed/Ns6UHedNMGg', TRUE),
        (v_teki_id, v_highlights_id, 'Teki Clip 2', 'https://www.youtube.com/embed/9v7sKUM38Wc', FALSE),
        (v_polco_id, v_highlights_id, 'Polco Clip 1', 'https://www.youtube.com/embed/7z-htpzen44', TRUE),
        (v_polco_id, v_highlights_id, 'Polco Clip 2', 'https://www.youtube.com/embed/l9p9oLjBKEA', FALSE);
END $$;

-- ============================================
-- IMÁGENES DE GALERÍA INICIALES
-- ============================================
DO $$
DECLARE
    v_wins_id UUID;
    v_giveaways_id UUID;
    v_memes_id UUID;
BEGIN
    SELECT id INTO v_wins_id FROM categorias_galeria WHERE slug = 'wins';
    SELECT id INTO v_giveaways_id FROM categorias_galeria WHERE slug = 'giveaways';
    SELECT id INTO v_memes_id FROM categorias_galeria WHERE slug = 'memes';
    
    INSERT INTO imagenes_galeria (categoria_id, titulo, imagen_url) VALUES
        (v_wins_id, 'Win 1', '/images/win1.png'),
        (v_wins_id, 'Win 2', '/images/win2.png'),
        (v_wins_id, 'Win 3', '/images/win3.png'),
        (v_giveaways_id, 'Giveaway 1', '/images/gw1.png'),
        (v_giveaways_id, 'Giveaway 2', '/images/gw2.png'),
        (v_giveaways_id, 'Giveaway 3', '/images/gw3.png'),
        (v_memes_id, 'Meme 1', '/images/meme1.png'),
        (v_memes_id, 'Meme 2', '/images/meme2.png'),
        (v_memes_id, 'Meme 3', '/images/meme3.jpg');
END $$;

-- ============================================
-- CARRIES / TOP CLAN
-- ============================================
DO $$
DECLARE
    v_cirze_id UUID;
    v_teki_id UUID;
BEGIN
    SELECT id INTO v_cirze_id FROM miembros WHERE nombre_usuario = 'cirze';
    SELECT id INTO v_teki_id FROM miembros WHERE nombre_usuario = 'teki';
    
    INSERT INTO carries (miembro_id, titulo, especialidad, logros, orden, destacado) VALUES
        (v_cirze_id, 'Pro Player', 'Ranked Competitivo', 'Top 100 en temporada 5', 1, TRUE),
        (v_teki_id, 'Carry Master', 'Torneos', 'Ganador de 3 torneos oficiales', 2, TRUE);
END $$;

-- ============================================
-- FIN DEL SEED
-- ============================================
