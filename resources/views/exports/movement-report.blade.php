<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Movement Report</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        h1 { font-size: 18px; margin-bottom: 5px; }
        .meta { color: #666; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; }
        .type-in { color: #16a34a; }
        .type-out { color: #dc2626; }
    </style>
</head>
<body>
    <h1>Stock Movement Report</h1>
    <p class="meta">Period: {{ $dateFrom }} to {{ $dateTo }} | Generated: {{ $date }}</p>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Warehouse</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Notes</th>
                <th>User</th>
            </tr>
        </thead>
        <tbody>
            @foreach($movements as $m)
            <tr>
                <td>{{ $m->date->format('Y-m-d') }}</td>
                <td>{{ $m->product?->name }}</td>
                <td>{{ $m->product?->sku }}</td>
                <td>{{ $m->warehouse?->name }}</td>
                <td class="type-{{ $m->type }}">{{ strtoupper($m->type) }}</td>
                <td>{{ $m->quantity }}</td>
                <td>{{ $m->notes }}</td>
                <td>{{ $m->user?->name }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
