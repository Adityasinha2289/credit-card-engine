const fs = require('fs');

function replaceInFile(file, replacements) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    for (const [from, to] of replacements) {
        content = content.split(from).join(to);
    }
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
}

// mockCards.ts
replaceInFile('src/features/card-intelligence/mockCards.ts', [
    ['"general"', '"other"'],
    ['"electronics"', '"shopping"'],
    ['"Rupay"', '"RuPay"'],
    ['"mid_tier"', '"premium"'] // assuming mid_tier isn't valid
]);

// mockMerchants.ts
replaceInFile('src/features/merchant-intelligence/mockMerchants.ts', [
    ['"fuel"', '"transport"'], 
    ['"medical"', '"health"'],
    ['"Rupay"', '"RuPay"']
]);

const addNodeImports = "import * as fs from 'fs';\nimport * as path from 'path';\n";
['src/features/recommendation/evaluation/benchmarkLoader.ts',
 'src/features/recommendation/evaluation/evaluationEngine.ts',
 'src/features/recommendation/evaluation/evaluationReporter.ts'].forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        if (!content.includes("import * as fs")) {
            fs.writeFileSync(f, addNodeImports + content);
            console.log('Fixed imports', f);
        }
    }
});
