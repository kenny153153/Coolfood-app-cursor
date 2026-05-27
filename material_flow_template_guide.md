# Material Flow Template Guide

Use `material_flow_master_template.csv` as the only file to fill.

## Goal

Reduce manual work for Tab1-4 and Product/Catalog setup by using one row per sellable item.

## Mapping (one row -> multiple tabs)

- `ingredient_code`, `ingredient_name` -> Tab1 (ingredients)
- `processing_method_code`, `processing_name`, `yield_rate` -> Tab2 (material_process_specs)
- `pricing_mode`, `target_channel`, `spec_weight`, `spec_unit`, `pack_label`, `packaging_fee` -> Tab3 (material_pack_specs)
- `catalog_targets`, `commercial_name`, `legacy_sku_filter`, `cost_override`, `is_active` -> Tab4 router push
- `marketing_collections`, `manual_price_factor` -> Product/Catalog layer

## Fill rules

- `catalog_targets` uses `|` separator, example: `coolfood_wholesale|coolfood_retail`
- Keep `target_channel=both` when you want both wholesale and retail pack visibility
- `yield_rate` should be decimal, recommended range `0.50` to `1.00`
- `manual_price_factor` default is `1.00`
- Leave `cost_override` empty to use computed base cost from Tab4
- `is_active` must be `true` or `false`

## Recommended workflow

1. Fill rows in `material_flow_master_template.csv`
2. Verify codes with `material_flow_dictionary.csv`
3. Import in batches (10-30 rows), review errors, then continue
4. In Product/Catalog, use `[tab4] / [舊]` source label to remove old rows safely

## Important

This template guarantees field structure consistency, but mother-material and cutting-method correctness still depends on your chosen values.
