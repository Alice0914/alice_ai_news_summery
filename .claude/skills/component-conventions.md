# Component Conventions

## Import Order (Required)

```jsx
// 1. React core
import React, { useState, useEffect, useRef } from 'react';

// 2. External libraries
import { useTranslation } from 'react-i18next';
import { Search, ArrowRight, X } from 'lucide-react';

// 3. Internal modules — constants/utils
import { CATEGORIES, CATEGORY_ID_MAP } from '../../constants';
import { getLocalizedLabel } from '../../utils/localization';

// 4. Internal modules — components
import AsyncImage from '../common/AsyncImage';

// 5. Assets
import logo from '../../assets/logo.png';
```

## Component Writing Pattern

```jsx
// Standard pattern: function component + default export
const ComponentName = ({ prop1, prop2, onAction }) => {
  const { t, i18n } = useTranslation();
  
  // State
  const [value, setValue] = useState(null);
  
  // Effects
  useEffect(() => { /* ... */ }, []);
  
  // Handlers
  const handleClick = () => { /* ... */ };
  
  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

## Tailwind CSS Rules

### Color Palette (Dark Theme)
```
Background:  bg-[#0f111a]          (main background)
             bg-[#1a1d2d]          (card/modal background)
             bg-[#141724]          (secondary background)
             bg-white/[0.03]       (subtle card)
             bg-white/[0.05~0.08]  (hover state)
             bg-black/40           (overlay)

Text:        text-white             (headings)
             text-white/60          (body text)
             text-white/40          (secondary text)
             text-slate-400~500     (inactive)
             text-blue-400          (links/emphasis)

Border:      border-white/5~10      (default)
             border-blue-500/30     (active/focus)
             border-slate-500~700   (selected)

Accents:     text-blue-400, bg-blue-600              (primary actions)
             text-purple-400, bg-purple-600           (secondary actions)
             text-pink-300~400, bg-pink-500/10        (service tags)
             text-emerald-300~400, bg-emerald-500/10  (core element tags)
             text-rose-500                            (likes)
```

### Common Patterns
```jsx
// Button — primary
className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-blue-900/20"

// Button — secondary
className="px-4 py-3 rounded-xl font-bold border border-slate-700 bg-slate-800 text-slate-500 hover:text-slate-400 transition-all"

// Card
className="bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300"

// Input field
className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-all"

// Tag/badge
className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-[10px] font-medium border border-blue-500/20"

// Modal overlay
className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
```

## Internationalization (i18n) Usage

```jsx
const { t, i18n } = useTranslation();

// Basic translation
<h1>{t('app_title')}</h1>

// With variables
<span>{t('count_selected', { count: 5 })}</span>

// Language-specific branching (when no translation key exists)
<span>{i18n.language === 'ko' ? '출처' : 'Source'}</span>

// Localizing category/service labels to Korean
import { CATEGORY_ID_MAP, SERVICE_ID_MAP, CORE_ID_MAP } from '../constants';
const getLocalizedTag = (tag) => {
  if (i18n.language !== 'ko') return tag;
  return CATEGORY_ID_MAP[tag] || SERVICE_ID_MAP[tag] || CORE_ID_MAP[tag] || tag;
};
```

> **Important**: When adding translation keys, always update both `src/locales/en.json` and `ko.json`!

## Icon Usage

```jsx
// lucide-react (primary icon library)
import { Search, ArrowRight, Heart, Bookmark } from 'lucide-react';
<Search className="w-5 h-5" />
<Heart className={`w-3 h-3 ${isLiked ? 'fill-current text-rose-500' : 'text-white/60'}`} />

// Custom icons (src/components/icons/)
import DiscordIcon from '../icons/DiscordIcon';
import YoutubeIcon from '../icons/YoutubeIcon';
<DiscordIcon className="w-5 h-5" />
```

## Responsive Design

```jsx
// Mobile-first, then tablet/desktop
className="text-base sm:text-lg lg:text-xl"
className="grid grid-cols-1 sm:grid-cols-2 gap-2"
className="p-4 md:p-6 lg:p-8"

// Safe area (mobile notch)
className="pb-safe"  // padding-bottom: env(safe-area-inset-bottom, 20px)

// Full height (mobile)
className="min-h-[100dvh]"
```
