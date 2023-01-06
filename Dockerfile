FROM php:8.1.4-fpm-alpine3.14

RUN docker-php-ext-install mysqli pdo pdo_mysql 
