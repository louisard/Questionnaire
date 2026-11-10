# Guide d'infrastructure et Déploiement Scaleway — Traiteur Annie

Ce document détaille les spécifications d'hébergement, la configuration de l'infrastructure sur Scaleway, la persistance PocketBase et la politique de sauvegarde / restauration.

---

## 1. Architecture Cible sur Scaleway

```
                                      [ Internet ]
                                           │
                                           ▼
                             [ Scaleway Load Balancer ]
                           (SSL Let's Encrypt / HTTPS)
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
       [ Frontend Statique (Nginx) ]                 [ Backend PocketBase ]
        cadrage.traiteur-annie.fr                 api-cadrage.traiteur-annie.fr
       (Scaleway Instance / Kapsule)             (Scaleway Instance / Container)
                    │                                             │
                    └─────────── REST API / JSON ─────────────────┘
                                                                  │
                                                        [ Scaleway Block Storage ]
                                                             (/pb_data - SQLite)
                                                                  │
                                                        [ Scaleway Object Storage ]
                                                           (S3 Backups quotidiens)
```

---

## 2. Déploiement du Frontend Statique (React / Vite)

### Étape 1 : Build de production
```bash
npm run build
```
Le dossier généré `dist/` contient l'ensemble des fichiers HTML, CSS, JavaScript et assets vectoriels minifiés.

### Étape 2 : Configuration Nginx (`nginx.conf`)
```nginx
server {
    listen 80;
    server_name cadrage.traiteur-annie.fr;

    root /var/www/traiteur-annie/dist;
    index index.html;

    # Support du routage SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache agressif pour les assets hashés par Vite
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Sécurité HTTP
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

---

## 3. Déploiement et Configuration de PocketBase sur Scaleway

PocketBase est un binaire Go autonome compilé incluant SQLite en mode WAL, l'authentification et une API REST temps réel.

### Déploiement via Docker sur une instance Scaleway DEV1-S ou Kapsule :
```dockerfile
# Dockerfile PocketBase
FROM alpine:latest

ARG PB_VERSION=0.22.20

RUN apk add --no-cache unzip ca-certificates wget

RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip -d /pb \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip

EXPOSE 8090

VOLUME /pb/pb_data

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
```

### Schéma de la collection `cadrage_sessions` :
* `session_id` : Text (Unique, Indexé)
* `version` : Text (ex: "1.0.0")
* `current_step` : Number
* `completed_steps` : JSON (Array d'entiers)
* `answers` : JSON (Dictionnaire complet des réponses)
* `client_updated_at` : Date / Text (Timestamp ISO)

---

## 4. Politique de Sauvegarde et Restauration

Conformément à l'exigence de protection des données :

1. **Sauvegardes automatiques PocketBase :**
   Activer le système de backup natif dans PocketBase Admin (`Settings > Backups`) avec une fréquence quotidienne (cron: `0 3 * * *`) et conservation de 14 jours.
2. **Archivage hors-site sur Scaleway Object Storage (S3) :**
   Script cron pour synchroniser le dossier `/pb/pb_data/backups/` vers un bucket S3 privé Scaleway (`fr-par` ou `nl-ams`) chiffré au repos :
   ```bash
   aws s3 sync /pb/pb_data/backups/ s3://traiteur-annie-backups/cadrage/ \
     --endpoint-url https://s3.fr-par.scw.cloud
   ```
3. **Procédure de Restauration :**
   En cas d'incident :
   ```bash
   # 1. Stopper PocketBase
   systemctl stop pocketbase
   # 2. Restaurer l'archive la plus récente
   cp /pb/pb_data/backups/pb_backup_YYYYMMDD.zip /tmp/
   unzip -o /tmp/pb_backup_YYYYMMDD.zip -d /pb/pb_data/
   # 3. Redémarrer le service
   systemctl start pocketbase
   ```
