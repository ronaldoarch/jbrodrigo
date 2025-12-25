<?php
/**
 * Configuração de CORS
 * 
 * NOTA: CORS está sendo gerenciado pelo Apache via .htaccess
 * Este arquivo é mantido apenas para compatibilidade, mas não envia headers
 * para evitar duplicação de headers CORS.
 * 
 * Se precisar usar CORS via PHP (sem Apache), descomente o código abaixo.
 */

// CORS está sendo gerenciado pelo Apache .htaccess
// Não enviar headers aqui para evitar duplicação

// Se precisar processar requisições OPTIONS manualmente (sem Apache):
// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
//     http_response_code(200);
//     exit;
// }

