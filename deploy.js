import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Iniciando despliegue manual...');

try {
    console.log('📦 Construyendo proyecto...');
    execSync('npm run build', { stdio: 'inherit' });
    process.chdir('dist');
    console.log('Git init...');
    if (fs.existsSync('.git')) {
        fs.rmSync('.git', { recursive: true, force: true });
    }

    execSync('git init', { stdio: 'inherit' });
    execSync('git checkout -b deployment', { stdio: 'inherit' });
    execSync('git add -A', { stdio: 'inherit' });
    execSync('git commit -m "deploy"', { stdio: 'inherit' });
    console.log('📤 Subiendo a GitHub...');
    execSync('git push -f https://github.com/koouhz/wya.git deployment', { stdio: 'inherit' });

    console.log('✅ Despliegue completado con éxito!');
} catch (e) {
    console.error('❌ Error en el despliegue:', e.message);
    process.exit(1);
}
