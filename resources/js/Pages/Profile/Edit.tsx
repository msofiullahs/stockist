import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import ImageUpload from '@/Components/ImageUpload';
import { useTranslation } from '@/utils/translation';

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        photo?: string | null;
    };
}

export default function ProfileEdit({ user }: Props) {
    const { t } = useTranslation();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [removePhoto, setRemovePhoto] = useState(false);

    const { data, setData, processing, errors } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('_method', 'PUT');

        if (imageFile) {
            formData.append('photo', imageFile);
        }
        if (removePhoto) {
            formData.append('remove_photo', '1');
        }

        router.post('/profile', formData, {
            forceFormData: true,
        });
    };

    const inputClass =
        'w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

    return (
        <AuthenticatedLayout>
            <Head title={t('edit_profile')} />

            <PageHeader
                title={t('edit_profile')}
                breadcrumbs={[
                    { label: t('dashboard'), href: '/dashboard' },
                    { label: t('profile') },
                ]}
            />

            <div className="mx-auto max-w-2xl">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Profile Photo */}
                        <div className="flex flex-col items-center">
                            <ImageUpload
                                label={t('profile_photo')}
                                currentImageUrl={!removePhoto ? (user.photo || null) : null}
                                onChange={(file) => {
                                    setImageFile(file);
                                    if (file) setRemovePhoto(false);
                                }}
                                onRemove={() => {
                                    setImageFile(null);
                                    setRemovePhoto(true);
                                }}
                                rounded
                                error={errors.photo}
                            />
                        </div>

                        {/* Name */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('name')} <span className="text-error-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={inputClass}
                                placeholder={t('your_name')}
                            />
                            {errors.name && <p className="mt-1 text-xs text-error-500">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('email')} <span className="text-error-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={inputClass}
                                placeholder={t('your_email')}
                            />
                            {errors.email && <p className="mt-1 text-xs text-error-500">{errors.email}</p>}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
                            >
                                {processing ? t('saving') : t('save_changes')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
