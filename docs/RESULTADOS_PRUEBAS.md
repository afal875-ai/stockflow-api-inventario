# Resultados de verificación

## Identificación

- **Evidencia:** GA7-220501096-AA5-EV03
- **Proyecto:** StockFlow API
- **Fecha de ejecución:** 11 de agosto de 2026
- **Entorno:** Node.js 26.5.0

## Resumen

| Verificación | Resultado |
|---|---|
| Pruebas automatizadas | 15 aprobadas, 0 fallidas |
| Suites | 3 aprobadas |
| Análisis estático ESLint | Sin observaciones |
| Contrato OpenAPI YAML | Estructura YAML válida |
| Colección Postman JSON | JSON válido |
| Archivo de datos | JSON válido |

## Casos automatizados ejecutados

### API HTTP

1. Estado del servicio y cabecera de trazabilidad.
2. Creación y actualización parcial de producto.
3. Entrada de inventario y rechazo de salida sin saldo.
4. Conflicto por SKU duplicado y ruta inexistente.

### Servicio de movimientos

1. Entrada que aumenta existencias.
2. Salida que reduce saldo y conserva historial.
3. Salida excesiva rechazada sin modificar datos.
4. Validación de tipo, cantidad y observación.
5. Filtro de movimientos por tipo.

### Servicio de productos

1. Creación con normalización del SKU.
2. Rechazo de SKU duplicado.
3. Rechazo de campos inválidos y cantidades negativas.
4. Actualización de existencias y cálculo de stock bajo.
5. Cálculo del resumen del inventario.
6. Eliminación de producto.

## Comandos para reproducir

```bash
npm install
npm test
npm run lint
```

Las pruebas crean directorios temporales y no cambian `data/inventory.json`.
