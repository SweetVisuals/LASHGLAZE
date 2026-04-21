
const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\Shadow\\Desktop\\LashGlaze\\src\\pages\\AdminDashboard.tsx', 'utf8');

function countTags(code) {
    let divOpen = 0;
    let divClose = 0;
    let lines = code.split('\n');
    lines.forEach((line, i) => {
        let open = (line.match(/<div(\s|>)/g) || []).length;
        let close = (line.match(/<\/div>/g) || []).length;
        divOpen += open;
        divClose += close;
        if (open > 0 || close > 0) {
            // console.log(`Line ${i+1}: Open ${open}, Close ${close} | Total: ${divOpen - divClose}`);
        }
    });
    console.log(`Final Balance: Open ${divOpen}, Close ${divClose} | Diff: ${divOpen - divClose}`);
}

countTags(content);
