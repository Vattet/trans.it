<?php

use App\Http\Controllers\LienController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return redirect('/api/documentation');
});


Route::middleware('auth:sanctum')->group(function () {

    Route::get('/api/documents/{id}', [DocumentController::class, 'show']);
    Route::post('/api/documents', [DocumentController::class, 'store']);
    Route::put('/api/documents/{id}', [DocumentController::class, 'update']);
    Route::delete('/api/documents/{id}', [DocumentController::class, 'destroy']);

    Route::get('/api/users/{id}', [UserController::class, 'show']);
    Route::post('/api/users', [UserController::class, 'store']);
    Route::put('/api/users/{id}', [UserController::class, 'update']);
    Route::delete('/api/users/{id}', [UserController::class, 'destroy']);
    Route::get('/documents/{id}/link', [LienController::class, 'getByDocument']);

    Route::post('/links', [LienController::class, 'store']);
    Route::put('/links/{id}', [LienController::class, 'update']);
    Route::delete('/links/{id}', [LienController::class, 'destroy']);
});

/*

---

# Users

```
GET    /api/users/{id}
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
```

# Documents

```
GET    /api/documents/{id}
POST   /api/documents
PUT    /api/documents/{id}
DELETE /api/documents/{id}
```

# Liens

```
GET    /api/documents/{id}/link
POST   /api/links
PUT    /api/links/{id}
DELETE /api/links/{id}
```

# Parametre_User

```
GET    /api/user-params/{id}
GET    /api/users/{id}/params
POST   /api/user-params
PUT    /api/users/{id}/params
```

# Parametre_Document

```
GET    /api/documents/{id}/params
POST   /api/document-params
PUT    /api/document-params/{id}
```

# Historique

```
GET    /api/histories/{id}
GET    /api/links/{id}/histories
POST   /api/histories
```

---
*/