const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{.*?Gift,.*?\} from 'lucide-react';/g, (match) => match.replace('Gift, ', ''));
content = content.replace(/import \{.*?Info,.*?\} from 'lucide-react';/g, (match) => match.replace('Info, ', ''));
content = content.replace(/import \{.*?User,.*?\} from 'lucide-react';/g, (match) => match.replace('User, ', ''));
content = content.replace(/import \{.*?ChevronRight,.*?\} from 'lucide-react';/g, (match) => match.replace('ChevronRight, ', ''));
content = content.replace(/import \{.*?Coins,.*?\} from 'lucide-react';/g, (match) => match.replace('Coins, ', ''));
content = content.replace(/const SmartAlerts = lazy\(\(\) => import\('\.\/features\/dashboard\/components\/SmartAlerts'\)\.then\(m => \(\{ default: m\.SmartAlerts \}\)\)\);\n/g, '');

content = content.replace(/const persona = usePersona\(\);\n/g, '// const persona = usePersona();\n');
content = content.replace(/const motivationBanner = PersonalizationEngine\.getMotivationBanner\(profile\);\n/g, '// const motivationBanner = PersonalizationEngine.getMotivationBanner(profile);\n');
content = content.replace(/const \{ insights \} = useBehaviourInsights\(\);\n/g, '// const { insights } = useBehaviourInsights();\n');
content = content.replace(/const \{ recommendations \} = useRecommendations\(profile\);\n/g, '// const { recommendations } = useRecommendations(profile);\n');
content = content.replace(/const \{ tipOfTheDay \} = useKnowledgeGraph\(\);\n/g, '// const { tipOfTheDay } = useKnowledgeGraph();\n');
content = content.replace(/const \[deleteCardLabel, setDeleteCardLabel\] = useState<string>\(''\);\n/g, '// const [deleteCardLabel, setDeleteCardLabel] = useState<string>(\'\');\n');
content = content.replace(/const activeCard     = userCards.find\(\(c\) => c.id === activeCardId\) \|\| userCards\[0\];\n/g, '// const activeCard     = userCards.find((c) => c.id === activeCardId) || userCards[0];\n');
content = content.replace(/const liveBalance    = activeAccount \? activeAccount.currentBalance : 0;\n/g, '// const liveBalance    = activeAccount ? activeAccount.currentBalance : 0;\n');
content = content.replace(/const availablePoints = rewards.totalPoints - rewards.redeemedPoints;\n/g, '// const availablePoints = rewards.totalPoints - rewards.redeemedPoints;\n');

fs.writeFileSync(file, content);
console.log("Successfully fixed App.tsx warnings");
