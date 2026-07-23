import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-[12px] text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
	{
		variants: {
			variant: {
				default: 'bg-[var(--color-brand)] text-white shadow-[4px_4px_8px_#c5cad1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c5cad1,-6px_-6px_12px_#ffffff] hover:bg-[#1a1f21] active:shadow-[inset_2px_2px_5px_#c5cad1,inset_-2px_-2px_5px_#ffffff]',
				destructive: 'bg-[var(--color-danger)] text-white shadow-[4px_4px_8px_#c5cad1,-4px_-4px_8px_#ffffff] hover:bg-[#c0392b] active:shadow-[inset_2px_2px_5px_#c5cad1,inset_-2px_-2px_5px_#ffffff]',
				outline: 'bg-[var(--color-neu-surface)] text-[var(--color-brand)] shadow-[4px_4px_8px_#c5cad1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c5cad1,-6px_-6px_12px_#ffffff] active:shadow-[inset_2px_2px_5px_#c5cad1,inset_-2px_-2px_5px_#ffffff]',
				secondary: 'bg-[var(--color-neu-dark)] text-[var(--color-brand)] shadow-[4px_4px_8px_#c5cad1,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c5cad1,-6px_-6px_12px_#ffffff]',
				ghost: 'bg-transparent hover:bg-[var(--color-neu-dark)]/30',
				link: 'text-[var(--color-brand-accent)] underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-[10px] px-3',
				lg: 'h-11 rounded-[14px] px-8',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button';
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants };
