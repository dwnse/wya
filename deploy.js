import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Iniciando despliegue manual...');

try {
    // 1. Construir el proyecto
    console.log('📦 Construyendo proyecto...');
    execSync('npm run build', { stdio: 'inherit' });

    // 2. Entrar a la carpeta dist
    process.chdir('dist');

    // 3. Crear repositoiro git temporal
    console.log('Git init...');

    // Limpiar git anterior si existe para evitar conflictos
    if (fs.existsSync('.git')) {
        fs.rmSync('.git', { recursive: true, force: true });
    }

    execSync('git init', { stdio: 'inherit' });
    execSync('git checkout -b deployment', { stdio: 'inherit' });
    execSync('git add -A', { stdio: 'inherit' });
    execSync('git commit -m "deploy"', { stdio: 'inherit' });

    // 4. Push forzado a la rama deployment
    console.log('📤 Subiendo a GitHub...');
    execSync('git push -f https://github.com/koouhz/wya.git deployment', { stdio: 'inherit' });

    console.log('✅ Despliegue completado con éxito!');
} catch (e) {
    console.error('❌ Error en el despliegue:', e.message);
    process.exit(1);
}
