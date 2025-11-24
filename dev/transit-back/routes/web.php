<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\LienController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ParametreUserController;

Route::get('/', function () {
    return redirect('/api/documentation');
});

Route::get('/api/documents', [DocumentController::class, 'getAll']);
Route::get('/api/documents/{id}', [DocumentController::class, 'show']);
Route::get('/api/documents/{id}/link', [LienController::class, 'getByDocument']);
Route::post('/api/documents', [DocumentController::class, 'store']);
Route::put('/api/documents/{id}', [DocumentController::class, 'update']);
Route::delete('/api/documents/{id}', [DocumentController::class, 'destroy']);

Route::get('/api/users/{id}/documents', [DocumentController::class, 'getAllByUser']);
Route::get('/api/users', [UserController::class, 'getAll']);
Route::get('/api/users/{id}', [UserController::class, 'show']);
Route::post('/api/users', [UserController::class, 'store']);
Route::post('/api/users/login', [UserController::class, 'login']);
Route::put('/api/users/{id}', [UserController::class, 'update']);
Route::delete('/api/users/{id}', [UserController::class, 'destroy']);

Route::post('/api/links', [LienController::class, 'store']);
Route::get('/api/links', [LienController::class, 'getAll']);
Route::get('/api/users/{id}/links', [LienController::class, 'getAllByUser']);
Route::put('/api/links/{id}', [LienController::class, 'update']);
Route::delete('/api/links/{id}', [LienController::class, 'destroy']);
Route::get('/api/public/links/{code}', [LienController::class, 'getByCode']);
Route::post('/public/download/{code}', [LienController::class, 'downloadFile']);
Route::get('/public/download/{code}', [LienController::class, 'downloadFileV2']);

Route::get('/user-params/{id}', [ParametreUserController::class, 'getById']);
Route::get('/users/{id}/params', [ParametreUserController::class, 'getByUserId']);

Route::post('/user-params', [ParametreUserController::class, 'store']);
Route::put('/users/{id}/params', [ParametreUserController::class, 'update']);

Route::delete('/user-params/{id}', [ParametreUserController::class, 'deleteByParamId']);
Route::delete('/users/{id}/params', [ParametreUserController::class, 'deleteByUserId']);

Route::get('/api/admin/stats', [AdminController::class, 'getStats']);


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