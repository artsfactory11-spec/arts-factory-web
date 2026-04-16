import fs from 'fs';
import path from 'path';

const srcDir = 'f:/20251223-artfactory/src';

const replacements = [
    { from: /text-gray-500/g, to: 'text-gray-700' },
    { from: /text-gray-400/g, to: 'text-gray-600' },
    { from: /text-gray-300/g, to: 'text-gray-500' },
    { from: /text-gray-200/g, to: 'text-gray-400' },
    { from: /placeholder:text-gray-300/g, to: 'placeholder:text-gray-500' },
    { from: /placeholder:text-gray-400/g, to: 'placeholder:text-gray-600' }
];

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file).replace(/\\/g, '/');
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (/\.(tsx|ts|js|jsx)$/.test(file)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            for (const r of replacements) {
                if (r.from.test(content)) {
                    content = content.replace(r.from, r.to);
                    modified = true;
                }
            }
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDir(srcDir);
