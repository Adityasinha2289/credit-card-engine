import os
import re

MAPPING = {
    # Text
    r'text-ink-primary': 'text-text-primary',
    r'text-ink-secondary': 'text-text-secondary',
    r'text-ink-tertiary': 'text-text-muted',
    r'text-ink-disabled': 'text-text-muted',
    
    # Backgrounds
    r'bg-canvas-50': 'bg-surface-primary',
    r'bg-canvas-100': 'bg-surface-primary',
    r'bg-canvas-200/50': 'bg-surface-secondary',
    r'bg-canvas-200/40': 'bg-surface-secondary',
    r'bg-canvas-200/80': 'bg-surface-secondary',
    r'bg-canvas-200': 'bg-surface-secondary',
    r'bg-canvas-300': 'bg-surface-elevated',
    
    # Borders
    r'border-canvas-200/\d+': 'border-border-subtle',
    r'border-canvas-200': 'border-border-subtle',
    r'border-canvas-300': 'border-border-subtle',
    r'border-white/\[?0\.0[4-6]\]?': 'border-border-subtle',
    r'border-white/5': 'border-border-subtle',
    r'border-white/10': 'border-border-subtle',
    
    # Brand
    r'bg-brand-500/10': 'bg-brand-emerald-muted',
    r'bg-brand-500/20': 'bg-brand-emerald-muted',
    r'bg-brand-500': 'bg-brand-emerald',
    r'text-brand-500': 'text-brand-emerald',
    r'border-brand-500/20': 'border-border-emerald',
    r'border-brand-500/30': 'border-border-emerald',
    r'border-brand-500': 'border-brand-emerald',
    r'ring-brand-500/50': 'ring-brand-emerald-glow',
    r'ring-brand-500': 'ring-brand-emerald',
    r'shadow-ag-glow-primary': 'shadow-[0_0_20px_rgba(4,59,39,0.3)]',
}

def migrate_safe(filepath):
    # skip public-platform since it was already manually designed correctly
    if 'public-platform' in filepath:
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    for pattern, replacement in MAPPING.items():
        content = re.sub(pattern, replacement, content)
        
    content = content.replace('dark:bg-surface-primary', '')
    content = content.replace('dark:bg-surface-secondary', '')
    content = content.replace('dark:border-border-subtle', '')
    
    # clean up any leftover spaces within classnames (like `class="  flex"`)
    content = re.sub(r'class(Name)?=" +', 'className="', content)
    content = re.sub(r' +"', '"', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            migrate_safe(os.path.join(root, file))
