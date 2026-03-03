const { spawn } = require('child_process');

function start() {
    console.log('--- STARTING XSANZ BOT SYSTEM ---');
    const child = spawn('node', ['xsanz.js'], { // Mengacu pada file utama lu
        stdio: 'inherit',
        shell: true
    });

    child.on('close', (code) => {
        console.log(`Bot terhenti dengan kode: ${code}. Merestart...`);
        start();
    });
}

start();
