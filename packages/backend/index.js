import app from './app.js';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 3000;

export default app;

// Si este archivo se ejecuta directamente (node index.js), arranca el servidor.
const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
    app.listen(PORT, () => {
        console.log(`AI Ticket It backend escuchando en http://localhost:${PORT}`);
    });
}

