FROM node:16.14.0-alpine as builder
COPY package.json package-lock.json ./
