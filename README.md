# StockFlow API — servicios web de inventario

Proyecto desarrollado para la evidencia **GA7-220501096-AA5-EV03: Diseño y desarrollo de servicios web – proyecto**.

| Dato | Información |
|---|---|
| Aprendiz | Andres Felipe Avendaño Lopez |
| Ficha | 3235904 |
| Programa | Análisis y Desarrollo de Software |
| Proyecto | StockFlow — gestión de inventario |
| Tecnología | Node.js 20+, Express 5 y API REST |

## Resultado

La solución expone servicios versionados para crear, consultar, actualizar y eliminar productos; buscar y filtrar el catálogo; obtener categorías e indicadores; y registrar entradas o salidas con historial. La persistencia JSON facilita la evaluación local y está aislada en una capa reemplazable por una base de datos.

## Inicio rápido

Requisitos: Node.js 20 o superior y npm 10 o superior.

```bash
npm install
npm start
```

Abra estas direcciones:

- Aplicación web: <http://localhost:3000>
- Catálogo visual de servicios: <http://localhost:3000/api-docs.html>
- Verificación de estado: <http://localhost:3000/api/v1/health>
- Contrato OpenAPI: <http://localhost:3000/docs/openapi.yaml>

## Verificación

```bash
npm test
npm run lint
```

Las pruebas usan archivos temporales y no modifican los datos de demostración.

## Servicios principales

| Método | Ruta | Función |
|---|---|---|
| GET | `/api/v1/health` | Comprobar disponibilidad |
| GET / POST | `/api/v1/products` | Listar o crear productos |
| GET / PUT / PATCH / DELETE | `/api/v1/products/{id}` | Administrar un producto |
| GET | `/api/v1/products/summary` | Consultar indicadores |
| GET | `/api/v1/products/categories` | Consultar categorías |
| POST | `/api/v1/products/{id}/movements` | Registrar entrada o salida |
| GET | `/api/v1/products/{id}/movements` | Consultar historial del producto |
| GET | `/api/v1/movements` | Consultar todos los movimientos |

## Documentos incluidos

- [`docs/DOCUMENTACION_SERVICIOS.md`](docs/DOCUMENTACION_SERVICIOS.md): descripción detallada de cada servicio, reglas, solicitudes y respuestas.
- [`docs/openapi.yaml`](docs/openapi.yaml): contrato OpenAPI 3.0 importable en Swagger Editor, Postman o Insomnia.
- [`docs/StockFlow.postman_collection.json`](docs/StockFlow.postman_collection.json): colección lista para importar en Postman.
- [`docs/COLECCION_API.http`](docs/COLECCION_API.http): solicitudes ejecutables desde clientes compatibles con archivos HTTP.
- [`docs/INFORME_TECNICO.md`](docs/INFORME_TECNICO.md): análisis, diseño, arquitectura, seguridad, pruebas y trazabilidad.
- [`docs/RESULTADOS_PRUEBAS.md`](docs/RESULTADOS_PRUEBAS.md): registro de las verificaciones ejecutadas.
- [`docs/GUIA_VERSIONAMIENTO.md`](docs/GUIA_VERSIONAMIENTO.md): comandos para publicar el repositorio Git.
- [`ENLACE_REPOSITORIO.txt`](ENLACE_REPOSITORIO.txt): archivo solicitado para registrar el enlace remoto.

## Estructura

```text
.
├── data/inventory.json             # Datos de demostración
├── docs/                           # Contrato y documentación de servicios
├── public/                         # Interfaz web y catálogo visual de API
├── src/
│   ├── controllers/                # Entrada y salida HTTP
│   ├── middleware/                 # Errores, seguridad y trazabilidad
│   ├── repositories/               # Persistencia atómica
│   ├── routes/                     # Endpoints REST
│   ├── services/                   # Reglas de negocio
│   └── utils/                      # Errores controlados
└── tests/                          # Pruebas unitarias y de integración
```

## Versionamiento

La entrega contiene un repositorio Git local con historial. Para cumplir el enlace remoto, publique el proyecto en GitHub, GitLab o Bitbucket y reemplace `PENDIENTE_DE_PUBLICACION` en `ENLACE_REPOSITORIO.txt` antes de cargar la evidencia en la plataforma.

## Autor

**Andres Felipe Avendaño Lopez** — Ficha 3235904.
