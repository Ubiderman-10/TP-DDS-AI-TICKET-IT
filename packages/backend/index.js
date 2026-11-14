import app, { servicios } from './app.js';
import { seed } from './seed.js';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 3000;

export default app;

// Si este archivo se ejecuta directamente (node index.js), carga datos de ejemplo y arranca el servidor.
const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
    seed(servicios);
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`AI Ticket It backend escuchando en http://localhost:${PORT}`);
    });
}