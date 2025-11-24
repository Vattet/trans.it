FROM php:8.2-cli

# 1. Dépendances système
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev mariadb-client \
    && docker-php-ext-install pdo pdo_mysql zip

# 2. Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 3. Dossier de travail
WORKDIR /var/www

# 4. Copie du code (avant volume)
COPY . .

# 5. Installation des dépendances
RUN composer install --no-interaction --prefer-dist --no-dev

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
