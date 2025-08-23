// ADS Drone Design System Integration for MP4 to GIF Converter
// This file integrates Drone components and design tokens

class DroneUI {
    constructor() {
        this.droneConfig = {
            baseUrl: 'https://mcp-drone-js.sg.agoda.is/mcp/',
            theme: 'light',
            locale: 'en-US'
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('🚁 Initializing Drone Design System...');
            
            // Initialize Drone components
            await this.loadDroneComponents();
            
            // Apply Drone design tokens
            this.applyDesignTokens();
            
            // Setup component interactions
            this.setupInteractions();
            
            console.log('✅ Drone Design System initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Drone:', error);
            // Fallback to basic styling
            this.applyFallbackStyling();
        }
    }

    async loadDroneComponents() {
        // Simulate loading Drone components
        // In production, this would fetch from the drone-mcp server
        
        // Define Drone component structure
        this.components = {
            Button: {
                variants: ['primary', 'secondary', 'success', 'warning', 'error'],
                sizes: ['sm', 'md', 'lg', 'xl'],
                states: ['default', 'hover', 'active', 'disabled', 'loading']
            },
            Card: {
                variants: ['default', 'elevated', 'outlined', 'filled'],
                sizes: ['sm', 'md', 'lg']
            },
            Input: {
                variants: ['default', 'filled', 'outlined'],
                sizes: ['sm', 'md', 'lg'],
                states: ['default', 'focus', 'error', 'success']
            },
            Progress: {
                variants: ['linear', 'circular'],
                sizes: ['sm', 'md', 'lg'],
                colors: ['primary', 'success', 'warning', 'error']
            }
        };
    }

    applyDesignTokens() {
        // Apply Drone design tokens to CSS custom properties
        const root = document.documentElement;
        
        // Color tokens
        const colors = {
            '--drone-primary-50': '#eff6ff',
            '--drone-primary-100': '#dbeafe',
            '--drone-primary-500': '#3b82f6',
            '--drone-primary-600': '#2563eb',
            '--drone-primary-700': '#1d4ed8',
            '--drone-primary-900': '#1e3a8a',
            
            '--drone-success-50': '#f0fdf4',
            '--drone-success-500': '#22c55e',
            '--drone-success-600': '#16a34a',
            
            '--drone-warning-50': '#fffbeb',
            '--drone-warning-500': '#f59e0b',
            '--drone-warning-600': '#d97706',
            
            '--drone-error-50': '#fef2f2',
            '--drone-error-500': '#ef4444',
            '--drone-error-600': '#dc2626',
            
            '--drone-neutral-50': '#f9fafb',
            '--drone-neutral-100': '#f3f4f6',
            '--drone-neutral-200': '#e5e7eb',
            '--drone-neutral-300': '#d1d5db',
            '--drone-neutral-400': '#9ca3af',
            '--drone-neutral-500': '#6b7280',
            '--drone-neutral-600': '#4b5563',
            '--drone-neutral-700': '#374151',
            '--drone-neutral-800': '#1f2937',
            '--drone-neutral-900': '#111827'
        };

        // Typography tokens
        const typography = {
            '--drone-font-family': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '--drone-font-size-xs': '0.75rem',
            '--drone-font-size-sm': '0.875rem',
            '--drone-font-size-base': '1rem',
            '--drone-font-size-lg': '1.125rem',
            '--drone-font-size-xl': '1.25rem',
            '--drone-font-size-2xl': '1.5rem',
            '--drone-font-size-3xl': '1.875rem',
            '--drone-font-size-4xl': '2.25rem',
            
            '--drone-font-weight-normal': '400',
            '--drone-font-weight-medium': '500',
            '--drone-font-weight-semibold': '600',
            '--drone-font-weight-bold': '700',
            
            '--drone-line-height-tight': '1.25',
            '--drone-line-height-normal': '1.5',
            '--drone-line-height-relaxed': '1.75'
        };

        // Spacing tokens
        const spacing = {
            '--drone-space-1': '0.25rem',
            '--drone-space-2': '0.5rem',
            '--drone-space-3': '0.75rem',
            '--drone-space-4': '1rem',
            '--drone-space-5': '1.25rem',
            '--drone-space-6': '1.5rem',
            '--drone-space-8': '2rem',
            '--drone-space-10': '2.5rem',
            '--drone-space-12': '3rem',
            '--drone-space-16': '4rem',
            '--drone-space-20': '5rem'
        };

        // Border radius tokens
        const radius = {
            '--drone-radius-sm': '0.375rem',
            '--drone-radius-md': '0.5rem',
            '--drone-radius-lg': '0.75rem',
            '--drone-radius-xl': '1rem',
            '--drone-radius-2xl': '1.5rem',
            '--drone-radius-full': '9999px'
        };

        // Shadow tokens
        const shadows = {
            '--drone-shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            '--drone-shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            '--drone-shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            '--drone-shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
        };

        // Apply all tokens
        Object.entries({ ...colors, ...typography, ...spacing, ...radius, ...shadows }).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }

    setupInteractions() {
        // Setup Drone-style interactions
        this.setupButtonInteractions();
        this.setupCardInteractions();
        this.setupFormInteractions();
    }

    setupButtonInteractions() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            // Add Drone button states
            button.addEventListener('mouseenter', () => {
                button.classList.add('drone-hover');
            });
            
            button.addEventListener('mouseleave', () => {
                button.classList.remove('drone-hover');
            });
            
            button.addEventListener('mousedown', () => {
                button.classList.add('drone-active');
            });
            
            button.addEventListener('mouseup', () => {
                button.classList.remove('drone-active');
            });
        });
    }

    setupCardInteractions() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            // Add Drone card interactions
            card.addEventListener('mouseenter', () => {
                card.classList.add('drone-elevated');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('drone-elevated');
            });
        });
    }

    setupFormInteractions() {
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Add Drone input states
            input.addEventListener('focus', () => {
                input.classList.add('drone-focus');
            });
            
            input.addEventListener('blur', () => {
                input.classList.remove('drone-focus');
            });
            
            input.addEventListener('input', () => {
                if (input.value) {
                    input.classList.add('drone-filled');
                } else {
                    input.classList.remove('drone-filled');
                }
            });
        });
    }

    applyFallbackStyling() {
        console.log('🔄 Applying fallback styling...');
        
        // Apply basic Drone-inspired styling as fallback
        const root = document.documentElement;
        
        // Basic color fallback
        root.style.setProperty('--drone-primary-500', '#3b82f6');
        root.style.setProperty('--drone-success-500', '#22c55e');
        root.style.setProperty('--drone-error-500', '#ef4444');
        
        // Basic spacing fallback
        root.style.setProperty('--drone-space-4', '1rem');
        root.style.setProperty('--drone-space-6', '1.5rem');
        root.style.setProperty('--drone-space-8', '2rem');
    }

    // Drone component factory methods
    createButton(variant = 'primary', size = 'md', content = '', options = {}) {
        const button = document.createElement('button');
        button.className = `drone-btn drone-btn--${variant} drone-btn--${size}`;
        button.innerHTML = content;
        
        if (options.disabled) button.disabled = true;
        if (options.loading) button.classList.add('drone-loading');
        if (options.icon) button.classList.add('drone-btn--icon');
        
        return button;
    }

    createCard(variant = 'default', size = 'md') {
        const card = document.createElement('div');
        card.className = `drone-card drone-card--${variant} drone-card--${size}`;
        return card;
    }

    createInput(type = 'text', placeholder = '', options = {}) {
        const input = document.createElement('input');
        input.type = type;
        input.placeholder = placeholder;
        input.className = `drone-input drone-input--${options.variant || 'default'} drone-input--${options.size || 'md'}`;
        
        if (options.required) input.required = true;
        if (options.value) input.value = options.value;
        
        return input;
    }

    createProgress(variant = 'linear', color = 'primary', value = 0) {
        const progress = document.createElement('div');
        progress.className = `drone-progress drone-progress--${variant} drone-progress--${color}`;
        
        if (variant === 'linear') {
            const bar = document.createElement('div');
            bar.className = 'drone-progress__bar';
            bar.style.width = `${value}%`;
            progress.appendChild(bar);
        }
        
        return progress;
    }
}

// Initialize Drone UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.droneUI = new DroneUI();
});

// Export for use in other modules
export default DroneUI;
