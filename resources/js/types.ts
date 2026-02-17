export interface User {
    id: number;
    name: string;
    email: string;
    photo?: string;
    roles: string[];
    permissions: string[];
}

export interface AppSettings {
    app_name: string;
    currency: string;
    currency_symbol: string;
    theme: 'light' | 'dark';
    languages: string;
    locale: string;
    mail_enabled: string;
    mail_mailer: string;
    mail_host: string;
    mail_port: string;
    mail_username: string;
    mail_password: string;
    mail_encryption: string;
    mail_from_address: string;
    mail_from_name: string;
}

export interface Language {
    code: string;
    name: string;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success?: string;
        error?: string;
    };
    settings: AppSettings;
    translations: Record<string, string>;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parent_id?: number;
    parent?: Category;
    products_count?: number;
}

export interface Supplier {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    contact_person?: string;
    is_active: boolean;
    products_count?: number;
}

export interface Warehouse {
    id: number;
    name: string;
    location?: string;
    address?: string;
    is_active: boolean;
    products_count?: number;
}

export interface Product {
    id: number;
    name: string;
    sku: string;
    description?: string;
    category?: string;
    supplier?: string;
    category_id?: number;
    supplier_id?: number;
    unit: string;
    cost_price: number;
    selling_price: number;
    current_stock: number;
    minimum_stock: number;
    is_active: boolean;
    is_low_stock: boolean;
    image?: string;
}

export interface StockMovement {
    id: number;
    product: string;
    sku: string;
    warehouse: string;
    type: 'in' | 'out' | 'transfer' | 'adjustment';
    quantity: number;
    notes?: string;
    user: string;
    date: string;
    created_at: string;
}

export interface PurchaseOrder {
    id: number;
    order_number: string;
    supplier?: { id: number; name: string };
    user?: { id: number; name: string };
    status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';
    total_amount: number;
    items_count?: number;
    order_date: string;
    expected_date?: string;
    received_date?: string;
    notes?: string;
    items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
    id: number;
    product: Product;
    quantity: number;
    unit_price: number;
    total_price: number;
    received_quantity: number;
}

export interface StockAdjustment {
    id: number;
    product: string;
    sku: string;
    warehouse: string;
    adjustment_type: string;
    quantity_before: number;
    quantity_after: number;
    difference: number;
    reason?: string;
    user: string;
    date: string;
}

export interface DashboardStats {
    totalProducts: number;
    totalCategories: number;
    totalSuppliers: number;
    totalWarehouses: number;
    pendingOrders: number;
    lowStockCount: number;
}

export interface StorageUsage {
    app_size: number;
    db_size: number;
    total_used: number;
    capacity: number;
    capacity_mb: number;
    percentage: number;
}
