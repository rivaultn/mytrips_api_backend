# MyTrips backend

Une Web API RESTful permettant la manipulation des données et l'importation de photos (supportant l'import par morceaux)
 à l'application front-end MyTrips


## Prérequis

- Git [home](git-home) (téléchargement, documentation) plus d'informations sur git [ici](git-github).

- [NodeJs](https://nodejs.org/en/)

- [MongoDB](https://github.com/mongodb/mongo)

- Typescript et Typescript node

    `npm install -g typescript ts-node`
 
## Installation
### 1. Récupérer le code

Via Git, en clonant ce dépôt (`git clone https://github.com/rivaultn/mytrips_api_backend.git`)

### 2. Installer les dépendances

- Installer les dépendances (`npm install`).

### 3. Créer un fichier de variable d'environnement

Créer un fichier `.env` à la racine du projet suivant le template du fichier `.env.default` et correspondant aux variables suivantes

Le port d'écoute du serveur
`PORT=`

L'adresse de la base de données mongoDB
`MONGO_URL=`

L'adrese du dossier où seront stockées les photos importées
`UPLOADED_FILES_PATH=`

L'adresse de la photo par défault en cas d'erreur
`NO_IMAGE_FOUND_PATH=`

Le nom du dossier où seront stockées les partitions des photos en cas d'import par morceaux
`CHUNK_DIR_NAME=`


L'attribute correspondant au nom du fichier importé
`FILE_INPUT_NAME=`

La taille maximum des photos importées
`MAX_FILE_SIZE=`

### 3 bis facultatif. Serveur HTTPS

Pour faire fonctionner l'API avec le protocole HTTPS, il suffit de générer un fichier `key.pem` et `cert.pem` dans le 
dossier `config` puis d'activer le serveur https dans le fichier `server.ts`

### 4. Exécuter le projet

- Exécuter le projet en mode développement (`npm run dev`).
- Exécuter le projet en mode production (`npm run prod`).

# Build with

* [NodeJs](https://nodejs.org/en/)
* [ExpressJs](https://github.com/expressjs/express)
* [MongoDB](https://github.com/mongodb/mongo)
* [Mongoose](https://github.com/Automattic/mongoose)
* [Typescript](https://github.com/Microsoft/TypeScript)

## Authors

* **Nicolas Rivault** - [rivaultn](https://github.com/rivaultn)
