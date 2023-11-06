# Installing dependencies:

FROM node:20.9-alpine AS install-dependencies

WORKDIR /user/src/app/server

RUN npm install --ignore-scripts -g npm@10.2.3

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY . .

# Creating a build:

FROM node:20.9-alpine AS create-build

WORKDIR /user/src/app/server

RUN npm install --ignore-scripts -g npm@10.2.3

COPY --from=install-dependencies /user/src/app/server ./

RUN npm run build

# Running the application:

FROM node:20.9-alpine AS run

WORKDIR /user/src/app/server

RUN npm install --ignore-scripts -g npm@10.2.3

RUN addgroup -S nonroot_g \
    && adduser -S nonroot_u -G nonroot_g

COPY --from=install-dependencies /user/src/app/server/node_modules ./node_modules
COPY --from=create-build /user/src/app/server/dist ./dist
COPY package.json ./

RUN npm prune --production

USER nonroot_u

CMD ["npm", "run", "start:prod"]
