<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Stock Report</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        h1 { font-size: 18px; margin-bottom: 5px; }
        .meta { color: #666; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; }
        .low { color: #dc2626; font-weight: bold; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <h1>Stock Report</h1>
    <p class="meta">Generated: {{ $date }}</p>
    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit</th>
                <th class="text-right">Stock</th>
                <th class="text-right">Cost Price</th>
                <th class="text-right">Stock Value</th>
            </tr>
        </thead>
        <tbody>
            @foreach($products as $product)
            <tr>
                <td>{{ $product['name'] }}</td>
                <td>{{ $product['sku'] }}</td>
                <td>{{ $product['category'] }}</td>
                <td>{{ $product['unit'] }}</td>
                <td class="text-right">{{ $product['current_stock'] }}</td>
                <td class="text-right">{{ $product['cost_price'] }}</td>
                <td class="text-right">{{ $product['stock_value'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
