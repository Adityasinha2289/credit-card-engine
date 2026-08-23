#!/bin/bash

FILE="src/pages/app/CreditPage.tsx"

# Backgrounds
sed -i '' 's/bg-\[#0F1412\]/bg-white/g' "$FILE"
sed -i '' 's/bg-\[#131917\]/bg-gray-50/g' "$FILE"
sed -i '' 's/bg-\[#181F1C\]/bg-gray-100/g' "$FILE"

# Borders
sed -i '' 's/border-\[#242D29\]/border-gray-200/g' "$FILE"
sed -i '' 's/border-\[#384640\]/border-gray-300/g' "$FILE"
sed -i '' 's/border-\[#0F1412\]/border-white/g' "$FILE"

# Accents (Emerald to Brand)
sed -i '' 's/text-emerald-400/text-[#237E45]/g' "$FILE"
sed -i '' 's/bg-emerald-500\/10/bg-[#237E45]\/10/g' "$FILE"
sed -i '' 's/bg-emerald-500\/20/bg-[#237E45]\/20/g' "$FILE"
sed -i '' 's/bg-emerald-500\/50/bg-[#237E45]\/50/g' "$FILE"
sed -i '' 's/border-emerald-500\/30/border-[#237E45]\/30/g' "$FILE"
sed -i '' 's/border-emerald-500\/50/border-[#237E45]\/50/g' "$FILE"
sed -i '' 's/border-emerald-500\/20/border-[#237E45]\/20/g' "$FILE"
sed -i '' 's/bg-emerald-400/bg-[#237E45]/g' "$FILE"
sed -i '' 's/bg-emerald-500/bg-[#237E45]/g' "$FILE"
sed -i '' 's/text-emerald-500\/70/text-[#237E45]\/70/g' "$FILE"
sed -i '' 's/text-emerald-500/text-[#237E45]/g' "$FILE"

# Modal
sed -i '' 's/bg-\[#070A08\]\/80/bg-gray-900\/60/g' "$FILE"

