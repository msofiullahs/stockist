import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { useTranslation } from '@/utils/translation';

interface ImageUploadProps {
    value?: string | File | null;
    currentImageUrl?: string | null;
    onChange: (file: File | null) => void;
    onRemove?: () => void;
    label?: string;
    helpText?: string;
    error?: string;
    className?: string;
    rounded?: boolean;
}

export default function ImageUpload({
    currentImageUrl,
    onChange,
    onRemove,
    label,
    helpText,
    error,
    className = '',
    rounded = false,
}: ImageUploadProps) {
    const { t } = useTranslation();
    const resolvedHelpText = helpText ?? t('image_help_text');
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
        onChange(file);
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleRemove = () => {
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
        onChange(null);
        onRemove?.();
    };

    const displayImage = preview || currentImageUrl;

    return (
        <div className={className}>
            {label && (
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            {displayImage ? (
                <div className="relative inline-block">
                    <img
                        src={displayImage}
                        alt={t('image_preview')}
                        className={`h-40 w-40 border border-gray-200 object-cover ${rounded ? 'rounded-full' : 'rounded-lg'}`}
                    />
                    <div className="absolute -right-2 -top-2 flex gap-1">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm transition-colors hover:bg-brand-600"
                            title={t('change_image')}
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-error-500 text-white shadow-sm transition-colors hover:bg-error-600"
                            title={t('remove_image')}
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-8 transition-colors ${
                        rounded ? 'h-40 w-40 rounded-full' : 'rounded-lg'
                    } ${
                        isDragging
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-gray-100'
                    }`}
                >
                    <svg className={`mb-2 h-8 w-8 ${isDragging ? 'text-brand-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {!rounded && (
                        <>
                            <p className="text-sm font-medium text-gray-600">
                                {isDragging ? t('drop_image_here') : t('click_or_drag_image')}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">{resolvedHelpText}</p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />

            {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
        </div>
    );
}
