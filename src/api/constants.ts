// #COLORES
export const PRIMARY_COLOR = '#029E47';
// #API
export const MODE: 'QA' | 'PROD' = 'QA';
export const URL_API_PASARELA_MOVIL = 'http://localhost:15000';
export const URL_API_DLS =
  MODE === 'QA'
    ? 'https://apiqa.starken.cl/apiqa/apivalidacionpago'
    : 'https://apiprd.starken.cl/apiprd/apivalidacionpago';
