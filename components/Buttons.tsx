import React from 'react';

export interface PrimaryButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
    as?: 'button' | 'a';
    href?: string;
    download?: boolean | string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ onClick, disabled, children, className = '', as = 'button', href, download }) => {
    const commonProps = {
        onClick,
        disabled,
        className: `w-full flex items-center justify-center gap-2 rounded-lg bg-[#007AFF] px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#006ae6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007AFF] disabled:opacity-50 disabled:cursor-not-allowed ${className}`,
    };
    if (as === 'a') {
        return <a href={href} download={download} {...commonProps}>{children}</a>;
    }
    return <button {...commonProps}>{children}</button>;
};

export interface SecondaryButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    as?: 'button' | 'a';
    href?: string;
    download?: boolean | string;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ onClick, children, className = '', disabled, as = 'button', href, download }) => {
    const commonProps = {
        onClick,
        disabled,
        className: `w-full flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-[#1D1D1F] transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${className}`,
    };

    if (as === 'a') {
        // We remove onClick for anchor tags to avoid potential conflicts, href should handle navigation.
        const { onClick: _, ...anchorProps } = commonProps;
        return <a href={href} download={download} {...anchorProps}>{children}</a>;
    }

    return <button {...commonProps}>{children}</button>;
};