import { Head, Link, useForm, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import ImageUpload from '@/Components/ImageUpload';
import NumericInput from '@/Components/NumericInput';
import { Product, Category, Supplier } from '@/types';
import { useTranslation } from '@/utils/translation';

interface Props {
    product?: Product;
    categories: Category[];
    suppliers: Supplier[];
}

export default function ProductForm({ product, categories, suppliers }: Props) {
    const isEditing = !!product;
    const { t } = useTranslation();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);

    const { data, setData, processing, errors } = useForm({
        name: product?.name || '',
        sku: product?.sku || '',
        description: product?.description || '',
        category_id: product?.category_id || '',
        supplier_id: product?.supplier_id || '',
        unit: product?.unit || 'pcs',
        cost_price: product?.cost_price ? String(product.cost_price) : '',
        selling_price: product?.selling_price ? String(product.selling_price) : '',
        minimum_stock: product?.minimum_stock ? String(product.minimum_stock) : '',
        is_active: product?.is_active ?? true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === 'boolean') {
                formData.append(key, value ? '1' : '0');
            } else {
                formData.append(key, String(value));
            }
        });

        if (imageFile) {
            formData.append('image', imageFile);
        }
        if (removeImage) {
            formData.append('remove_image', '1');
        }

        if (isEditing) {
            formData.append('_method', 'PUT');
            router.post(`/products/${product!.id}`, formData, {
                forceFormData: true,
            });
        } else {
            router.post('/products', formData, {
                forceFormData: true,
            });
        }
    };

    const inputClass =
        'w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

    return (
        <AuthenticatedLayout>
            <Head title={isEditing ? t('edit_product') : t('add_product')} />

            <PageHeader
                title={isEditing ? t('edit_product') : t('new_product')}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('products'), href: '/products' },
                    { label: isEditing ? t('edit') : t('create') },
                ]}
            />

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <form onSubmit={submit} className="space-y-6">
                    {/* Product Image */}
                    <ImageUpload
                        label={t('product_image')}
                        currentImageUrl={!removeImage ? (product?.image || null) : null}
                        onChange={(file) => {
                            setImageFile(file);
                            if (file) setRemoveImage(false);
                        }}
                        onRemove={() => {
                            setImageFile(null);
                            setRemoveImage(true);
                        }}
                        error={errors.image}
                    />

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('product_name')} <span className="text-error-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={inputClass}
                                placeholder={t('enter_product_name')}
                            />
                            {errors.name && <p className="mt-1 text-xs text-error-500">{errors.name}</p>}
                        </div>

                        {/* SKU */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('sku')} <span className="text-error-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                className={inputClass}
                                placeholder={t('enter_sku')}
                            />
                            {errors.sku && <p className="mt-1 text-xs text-error-500">{errors.sku}</p>}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('category')}</label>
                            <select
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className={inputClass}
                            >
                                <option value="">{t('category')}</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.category_id && <p className="mt-1 text-xs text-error-500">{errors.category_id}</p>}
                        </div>

                        {/* Supplier */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('supplier')}</label>
                            <select
                                value={data.supplier_id}
                                onChange={(e) => setData('supplier_id', e.target.value)}
                                className={inputClass}
                            >
                                <option value="">{t('supplier')}</option>
                                {suppliers.map((sup) => (
                                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                                ))}
                            </select>
                            {errors.supplier_id && <p className="mt-1 text-xs text-error-500">{errors.supplier_id}</p>}
                        </div>

                        {/* Unit */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('unit')}</label>
                            <select
                                value={data.unit}
                                onChange={(e) => setData('unit', e.target.value)}
                                className={inputClass}
                            >
                                <option value="pcs">{t('unit_pieces')}</option>
                                <option value="kg">{t('unit_kilogram')}</option>
                                <option value="g">{t('unit_gram')}</option>
                                <option value="l">{t('unit_liter')}</option>
                                <option value="ml">{t('unit_milliliter')}</option>
                                <option value="m">{t('unit_meter')}</option>
                                <option value="box">{t('unit_box')}</option>
                                <option value="pack">{t('unit_pack')}</option>
                            </select>
                            {errors.unit && <p className="mt-1 text-xs text-error-500">{errors.unit}</p>}
                        </div>

                        {/* Minimum Stock */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('minimum_stock')}</label>
                            <NumericInput
                                value={data.minimum_stock}
                                onChange={(val) => setData('minimum_stock', val)}
                                className={inputClass}
                                placeholder="0"
                            />
                            {errors.minimum_stock && <p className="mt-1 text-xs text-error-500">{errors.minimum_stock}</p>}
                        </div>

                        {/* Cost Price */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('cost_price')}</label>
                            <NumericInput
                                decimal
                                value={data.cost_price}
                                onChange={(val) => setData('cost_price', val)}
                                className={inputClass}
                                placeholder="0.00"
                            />
                            {errors.cost_price && <p className="mt-1 text-xs text-error-500">{errors.cost_price}</p>}
                        </div>

                        {/* Selling Price */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('selling_price')}</label>
                            <NumericInput
                                decimal
                                value={data.selling_price}
                                onChange={(val) => setData('selling_price', val)}
                                className={inputClass}
                                placeholder="0.00"
                            />
                            {errors.selling_price && <p className="mt-1 text-xs text-error-500">{errors.selling_price}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className={inputClass}
                            rows={3}
                            placeholder={t('enter_description')}
                        />
                        {errors.description && <p className="mt-1 text-xs text-error-500">{errors.description}</p>}
                    </div>

                    {/* Is Active */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500/20"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">{t('active')}</label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                        >
                            {processing ? t('saving') : isEditing ? t('edit_product') : t('add_product')}
                        </button>
                        <Link
                            href="/products"
                            className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            {t('cancel')}
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
