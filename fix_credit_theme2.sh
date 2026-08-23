#!/bin/bash

FILE="src/pages/app/CreditPage.tsx"

# Remaining Backgrounds
sed -i '' 's/bg-\[#242D29\]/bg-gray-200/g' "$FILE"
sed -i '' 's/bg-\[#384640\]/bg-gray-300/g' "$FILE"
sed -i '' 's/bg-\[#737C77\]/bg-white/g' "$FILE"

# Text
sed -i '' 's/text-gray-300/text-gray-400/g' "$FILE"

