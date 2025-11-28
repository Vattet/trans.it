# trans.it

## Installation du projet via Docker Hub

## 1. Présentation

Ce projet utilise trois services Docker :

- un backend Laravel,
    
- un frontend Next.js,
    
- une base de données MariaDB.
    

Les images Docker du frontend et du backend sont déjà disponibles sur Docker Hub.  
L'installation se fait simplement via docker pull et docker compose.

---

## 2. Prérequis

Avant de commencer, installez Docker, Docker Compose, Git.    

---

## 3. Récupération des images Docker Hub

Téléchargez les images nécessaires :

```
docker pull vatedvd/transit-backend:latest
docker pull vatedvd/transit-frontend:latest
docker pull mariadb:latest
```

---

## 4. Récupération du projet (GitHub)

Clonez le projet pour obtenir le fichier docker-compose.yml :

```
git clone git@github.com:Vattet/trans.it.git
```

Placez-vous ensuite dans le dossier :

```
cd trans.it
```

---

## 5. Lancement de l’application

Dans le dossier contenant le fichier docker-compose.yml, exécutez :

```
sudo docker compose up -d
```

Les services suivants se lanceront automatiquement :

- MariaDB
    
- API Laravel
    
- Frontend Next.js
    

---

## 6. Accès aux services

Une fois l’environnement démarré, les services sont accessibles aux adresses suivantes :

- Frontend : [http://localhost:3000](http://localhost:3000)
    
- Backend (API Laravel + Swagger) : [http://localhost:8000](http://localhost:8000)
    
- Base de données : port 3306
    

---

## 7. Accès administrateur

Un utilisateur administrateur est disponible pour tester l’application :

```
Email : admin@transit.it
Password : admin
```

---
## 8. Lien diagrammes + Présentation

draw.io : https://drive.google.com/file/d/1tfRwbqgYUqc-3FdjPXYj9X8YIoXLCVzU/view?usp=sharing

Slides : https://docs.google.com/presentation/d/1X_wOwDNsPk7qzkkvrcLObcKhAK4TpYSwJX9S_ZZU-KQ/edit?slide=id.p1#slide=id.p1
---

