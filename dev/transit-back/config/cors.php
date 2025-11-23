<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    // C'est ici qu'on définit quelles routes acceptent les requêtes externes
    'paths' => [
        'api/*', 
        'sanctum/csrf-cookie',
        'public/*',      // <--- TRES IMPORTANT pour tes téléchargements
        'storage/*',     // <--- Au cas où tu accèdes aux fichiers directement
    ],

    'allowed_methods' => ['*'], // Autorise POST, GET, OPTIONS, etc.

    'allowed_origins' => [
        'http://localhost:3000', // Ton Frontend React
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // Important pour les cookies/auth

];