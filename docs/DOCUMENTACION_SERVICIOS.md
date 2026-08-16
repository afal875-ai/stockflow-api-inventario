# Documentación de servicios web — StockFlow API

## 1. Información general

- **Evidencia:** GA7-220501096-AA5-EV03
- **Aprendiz:** Andres Felipe Avendaño Lopez
- **Ficha:** 3235904
- **URL local:** `http://localhost:3000/api/v1`
- **Formato:** JSON codificado en UTF-8
- **Versión:** 1.0.0
- **Contrato formal:** `docs/openapi.yaml`

Todas las solicitudes que envían datos deben incluir `Content-Type: application/json`. Cada respuesta incorpora `X-Request-Id`, útil para rastrear una operación. Las fechas usan ISO 8601 en UTC.

## 2. Convenciones de respuesta

Respuesta individual correcta:

```json
{
  "data": {
    "id": "2b911fd4-ce85-43fb-a5a1-a7de2554d16b",
    "sku": "TEC-001",
    "name": "Teclado mecánico"
  }
}
```

Respuesta de colección:

```json
{
  "data": [],
  "count": 0
}
```

Respuesta de error:

```json
{
  "error": "AppError",
  "code": "INSUFFICIENT_STOCK",
  "message": "No hay existencias suficientes para registrar la salida.",
  "details": {
    "availableQuantity": 4,
    "requestedQuantity": 9
  },
  "requestId": "74066c49-eaa0-4b49-b03a-0e7d41644410"
}
```

## 3. Catálogo resumido

| N.º | Método | Recurso | Propósito | Éxito | Errores controlados |
|---:|---|---|---|---:|---|
| 1 | GET | `/health` | Comprobar disponibilidad | 200 | — |
| 2 | GET | `/products` | Listar, buscar y filtrar | 200 | — |
| 3 | POST | `/products` | Crear producto | 201 | 409, 422 |
| 4 | GET | `/products/{id}` | Consultar producto | 200 | 404 |
| 5 | PUT | `/products/{id}` | Actualizar producto | 200 | 404, 409, 422 |
| 6 | PATCH | `/products/{id}` | Actualizar parcialmente | 200 | 404, 409, 422 |
| 7 | DELETE | `/products/{id}` | Eliminar producto | 204 | 404 |
| 8 | GET | `/products/summary` | Consultar indicadores | 200 | — |
| 9 | GET | `/products/categories` | Listar categorías | 200 | — |
| 10 | POST | `/products/{id}/movements` | Registrar entrada/salida | 201 | 404, 409, 422 |
| 11 | GET | `/products/{id}/movements` | Historial del producto | 200 | 404 |
| 12 | GET | `/movements` | Consultar movimientos | 200 | 422 |

## 4. Detalle de servicios

### 4.1 Comprobar estado

`GET /health`

No recibe parámetros. Retorna `200` cuando la aplicación está disponible.

```json
{
  "status": "ok",
  "service": "stockflow-api",
  "version": "1.0.0"
}
```

### 4.2 Listar y filtrar productos

`GET /products`

Parámetros opcionales:

- `q`: coincidencia parcial por SKU, nombre o categoría.
- `category`: categoría exacta, sin distinguir mayúsculas.
- `status`: `available`, `low` u `out`.

Ejemplo: `GET /products?q=mouse&status=low`

Retorna `200` y una colección ordenada por nombre. Cada producto incluye `status`, calculado a partir de `quantity` y `minStock`.

### 4.3 Crear producto

`POST /products`

```json
{
  "sku": "MON-001",
  "name": "Monitor 24 pulgadas",
  "description": "Monitor Full HD con conexión HDMI.",
  "category": "Monitores",
  "quantity": 7,
  "minStock": 2,
  "unitPrice": 620000
}
```

Retorna `201` con el producto creado. Un SKU repetido retorna `409`; campos inválidos retornan `422` con la lista de observaciones.

### 4.4 Consultar producto

`GET /products/{id}`

`id` es el UUID generado al crear el registro. Retorna `200`; si no existe, `404`.

### 4.5 Actualizar producto

`PUT /products/{id}` o `PATCH /products/{id}`

Ambos métodos conservan los campos omitidos. `PATCH` comunica mejor una actualización parcial.

```json
{
  "unitPrice": 190000,
  "minStock": 6
}
```

Retorna `200`, actualiza `updatedAt` y recalcula el estado. Puede retornar `404`, `409` o `422`.

### 4.6 Eliminar producto

`DELETE /products/{id}`

Retorna `204` sin cuerpo. El historial ya registrado conserva el nombre y SKU del producto para auditoría. Un identificador inexistente retorna `404`.

### 4.7 Consultar resumen

`GET /products/summary`

Retorna `200` con referencias, unidades, valor estimado, productos con stock bajo y productos agotados.

```json
{
  "data": {
    "totalProducts": 4,
    "totalUnits": 31,
    "inventoryValue": 6161000,
    "lowStock": 1,
    "outOfStock": 1
  }
}
```

### 4.8 Consultar categorías

`GET /products/categories`

Retorna `200` con categorías únicas ordenadas alfabéticamente.

### 4.9 Registrar movimiento

`POST /products/{id}/movements`

Entrada:

```json
{
  "type": "entry",
  "quantity": 5,
  "note": "Compra a proveedor OC-1042"
}
```

Salida:

```json
{
  "type": "exit",
  "quantity": 2,
  "note": "Entrega del pedido PV-205"
}
```

Retorna `201` con el movimiento y el producto actualizado. Producto y movimiento se escriben juntos. Si la salida supera las unidades disponibles, retorna `409` y no modifica los datos. Cantidad no entera, cantidad cero, tipo diferente de `entry`/`exit` u observación mayor de 160 caracteres retornan `422`.

### 4.10 Consultar historial de un producto

`GET /products/{id}/movements`

Retorna `200`, ordenando el historial de más reciente a más antiguo. Si el producto no existe, retorna `404`.

### 4.11 Consultar todos los movimientos

`GET /movements`

Filtros opcionales: `productId`, `type`, `from` y `to`. Las fechas deben ser valores ISO 8601 válidos.

Ejemplo: `GET /movements?type=entry&from=2026-08-01T00:00:00.000Z`

## 5. Códigos HTTP

| Código | Significado en StockFlow |
|---:|---|
| 200 | Consulta o actualización correcta |
| 201 | Recurso creado correctamente |
| 204 | Eliminación correcta sin cuerpo |
| 404 | Producto o ruta inexistente |
| 409 | SKU duplicado o existencias insuficientes |
| 422 | Datos o filtros que incumplen reglas |
| 500 | Error inesperado controlado por el middleware |

## 6. Reglas de negocio

1. El SKU se normaliza a mayúsculas y debe ser único.
2. El SKU admite entre 3 y 20 letras, números o guiones.
3. Nombre y categoría tienen entre 3 y 80/40 caracteres respectivamente.
4. Cantidad e inventario mínimo son enteros no negativos; el precio es no negativo.
5. `quantity = 0` produce estado `out`.
6. `0 < quantity <= minStock` produce estado `low`.
7. Los demás productos tienen estado `available`.
8. Las entradas y salidas operativas se registran como movimientos; la edición directa queda disponible para una corrección administrativa. Una salida nunca puede producir saldo negativo.
9. Las mutaciones se serializan y se guardan mediante archivo temporal y renombrado atómico.

## 7. Prueba manual

1. Ejecute `npm install` y `npm start`.
2. Importe `docs/StockFlow.postman_collection.json` en Postman o abra `docs/COLECCION_API.http`.
3. Ejecute primero **Crear producto**; copie el `id` devuelto.
4. Use ese identificador para registrar una entrada y una salida.
5. Consulte el producto, el historial y el resumen para comprobar los cambios.
6. Pruebe una salida mayor al saldo y confirme que recibe `409` sin alterar las existencias.
