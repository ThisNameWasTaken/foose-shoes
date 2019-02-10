# FooseShoes 👠

## 💻 Start dev server

```sh
npm start
```

## 🛠️ Build for production

```sh
npm run build
```

## ⚙️ Serve production build

```sh
npm run serve
```

**[CHANGELOG](./CHANGELOG.md)**

**[ROADMAP](./ROADMAP.md)**

**[CONTRIBUTING](./CONTRIBUTING.md)**

## Importing files

**Note:** This guide assumes the fallowing folder structure:

```sh
src/
├── images/
│   └── image.png
├── js/
│   └── index.js
├── styles/
│   └── index.scss
└── views/
    └── index.html
```

### Importing SASS files

```html
<link rel="stylesheet" href="../styles/index.scss">
```

### Importing JS files

```html
<script async defer href="../js/index.js"></script>
```

### Importing Images

```html
  <img src="../images/image.png" alt="the coolest image you have ever came across"/>
```
