// normalize.js
// helper para normalizar strings antes da comparação
export function normalizeAnswer(s) {
  if (s == null) return '';
  let out = String(s).toLowerCase().trim();
  // remover acentos
  out = out.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  // remover pontuação básica
  out = out.replace(/[\.,;:!\?"'()\[\]-]/g, '');
  // colapsar múltiplos espaços
  out = out.replace(/\s+/g, ' ');
  return out;
}

export default { normalizeAnswer };
