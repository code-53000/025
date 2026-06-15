FROM php:8.1-cli-alpine

RUN docker-php-ext-install pdo_mysql

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/html

COPY composer.json ./
RUN composer install --no-dev --optimize-autoloader || true

COPY . .

RUN if [ ! -d "storage/logs" ]; then mkdir -p storage/logs; fi

EXPOSE 80

CMD ["php", "-S", "0.0.0.0:80", "-t", "public", "public/router.php"]
