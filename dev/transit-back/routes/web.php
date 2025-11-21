<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
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