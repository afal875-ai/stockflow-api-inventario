# Guía de versionamiento y publicación

## Estado de la entrega

El proyecto se entrega como repositorio Git local sobre la rama `main`. El historial permite comprobar la evolución del análisis, la implementación y la documentación.

## Publicar en un repositorio remoto

1. Cree un repositorio vacío en GitHub, GitLab o Bitbucket, sin agregar README ni licencia desde el portal.
2. Desde la carpeta `ANDRES_FELIPE_AVENDANO_LOPEZ_AA5_EV03`, ejecute:

```bash
git remote add origin URL_DEL_REPOSITORIO
git push -u origin main
```

3. Abra `ENLACE_REPOSITORIO.txt` y cambie `PENDIENTE_DE_PUBLICACION` por la URL real.
4. Confirme el cambio y vuelva a comprimir la carpeta:

```bash
git add ENLACE_REPOSITORIO.txt
git commit -m "docs: registrar enlace del repositorio remoto"
git push
```

## Flujo recomendado para futuras mejoras

```bash
git switch -c feature/nombre-mejora
git add .
git commit -m "feat: describir mejora"
git push -u origin feature/nombre-mejora
```

Mensajes sugeridos: `feat` para funcionalidad, `fix` para correcciones, `docs` para documentación y `test` para pruebas.
