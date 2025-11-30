import db from './db.js';

async function checkAvatars() {
  try {
    const rows = await db.query('SELECT id, nome, caminho_imagem, public_url FROM avatars ORDER BY id');
    console.log('=== AVATARES NO BANCO ===');
    console.log(JSON.stringify(rows, null, 2));
    console.log('\nTotal de avatares:', rows.length);
    
    // Verificar duplicatas por caminho_imagem
    const paths = {};
    rows.forEach(r => {
      const path = r.caminho_imagem;
      if (!paths[path]) paths[path] = [];
      paths[path].push(r.id);
    });
    
    console.log('\n=== VERIFICAÇÃO DE DUPLICATAS ===');
    Object.entries(paths).forEach(([path, ids]) => {
      if (ids.length > 1) {
        console.log(`DUPLICATA: ${path} aparece ${ids.length} vezes (IDs: ${ids.join(', ')})`);
      }
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  }
}

checkAvatars();
