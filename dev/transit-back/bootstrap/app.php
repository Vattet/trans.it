<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // ❌ Désactivation totale du CSRF
        $middleware->validateCsrfTokens(except: [
            '*', // Toutes les routes ignorent le CSRF
        ]);

        // ❌ Suppression du middleware Sanctum stateful (cookies front→back)
        $middleware->web(remove: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
    })
    ->withMiddleware(function (Middleware $middleware): void {

        // ✔️ Remplacement du middleware Sanctum : aucune gestion de cookies/session
        $middleware->alias([
            'auth:sanctum' => \Illuminate\Auth\Middleware\Authenticate::class,
            'abilities' => \Laravel\Sanctum\Http\Middleware\CheckAbilities::class,
            'ability' => \Laravel\Sanctum\Http\Middleware\CheckForAnyAbility::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();
