# SF Integration Readiness (One-by-One)

This file maps your SF portal API list to implemented endpoints in this project.

## Webhook URLs to register in SF portal

- Route/status push: `/api/webhooks/sf-status`
- Other SF callbacks (delivery/intercept/CEMP): `/api/webhooks/sf-events`

Use full HTTPS URL in SF console, for example:
- `https://your-domain.com/api/webhooks/sf-status`
- `https://your-domain.com/api/webhooks/sf-events`

## API Mapping Checklist

1. `EXP_RECE_CREATE_ORDER` (下單接口)
   - Implemented in `POST /api/sf` with `action: "order"`
2. `EXP_RECE_SEARCH_ORDER_RESP` (訂單結果查詢)
   - Implemented in `POST /api/sf` with `action: "query_order"`
3. `EXP_RECE_UPDATE_ORDER` (訂單確認/取消)
   - Implemented in `POST /api/sf` with `action: "update_order"`
4. `EXP_RECE_GET_SUB_MAILNO` (子母單號申請)
   - Implemented in `POST /api/sf` with `action: "get_sub_mailno"` and `msgData`
5. `EXP_RECE_DELIVERY_NOTICE` (派件通知)
   - Handled by `POST /api/webhooks/sf-events`
6. `EXP_RECE_WANTED_INTERCEPT` (妥投前攔截通知)
   - Handled by `POST /api/webhooks/sf-events`
7. `EXP_RECE_PRE_ORDER` (預下單)
   - Implemented in `POST /api/sf` with `action: "pre_order"` and `msgData`
8. `COM_RECE_CEMP_ORDER_UNAVAILABLE_*`
   - Handled by `POST /api/webhooks/sf-events`
9. `COM_RECE_CEMP_QUERY_COUPON_TEMP*`
   - Handled by `POST /api/webhooks/sf-events`
10. `COM_RECE_CEMP_ORDER_CANCEL_DISCO*`
    - Handled by `POST /api/webhooks/sf-events`

## Request Examples (pull APIs)

### Query order

```json
{
  "action": "query_order",
  "orderId": "ORD-12345"
}
```

### Update order (cancel)

```json
{
  "action": "update_order",
  "orderId": "ORD-12345",
  "dealType": 2
}
```

### Get sub-mail no / Pre-order

```json
{
  "action": "get_sub_mailno",
  "msgData": {
    "orderId": "ORD-12345",
    "applyNum": 1
  }
}
```

```json
{
  "action": "pre_order",
  "msgData": {
    "orderId": "ORD-12345",
    "monthlyCard": "your-monthly-card"
  }
}
```

## Notes

- SF callback signature verification is enabled for both webhook endpoints.
- Callback payloads are appended to `orders.sf_responses.callbacks` when order match is found.
- `query_order` and `query_routes` require admin read permission; update-like actions require admin update permission.
- Quick self-check command:
  - `npm run sf:self-test`
  - With webhook simulation: `npm run sf:self-test -- --base-url https://your-domain.com`

## Common failure codes and fixes

- `8114` (`传入了不可发货的月结卡号`)
  - Your `SF_MONTHLY_CARD` is not enabled for the selected SF environment.
  - Fix: ask SF to bind/enable the monthly card in current environment, then re-test.
- `6150` / `8018` after create-order failure
  - Follow-up query/update/sub-mail calls fail because no valid order was created.
  - Fix: resolve create-order first, then re-run.
- `A1004` (`无对应服务权限`)
  - API permission is not opened in SF Open Platform for this partner.
  - Fix: open subscription/permission for that service code (for example, `EXP_RECE_SEARCH_ROUTES`).

