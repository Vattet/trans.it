<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "Documentation de l'API Transit",
    description: "Documentation de l'API trans.it générée avec Swagger"
)]
#[OA\Server(
    url: "http://localhost:8000",
    description: "Local API Server"
)]
class OpenApi {}
