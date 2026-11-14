// Datos de ejemplo para la demo. Se cargan solo al arrancar el servidor (index.js),
// nunca desde app.js, para no contaminar los tests.
export function seed({ categoriaService, usuarioService, eventoService }) {
  const musica = categoriaService.crear({ nombre: 'Música', descripcion: 'Recitales y festivales' });
  const teatro = categoriaService.crear({ nombre: 'Teatro', descripcion: 'Obras y espectáculos' });
  const humor = categoriaService.crear({ nombre: 'Humor', descripcion: 'Stand up y comedia' });
  categoriaService.crear({ nombre: 'Deportes', descripcion: 'Eventos deportivos' });

  // Un mismo Usuario puede organizar eventos y comprar los de otros (según el diagrama de clases).
  const ana = usuarioService.crearUsuario({ nombre: 'Ana', apellido: 'Organizadora' });
  const martin = usuarioService.crearUsuario({ nombre: 'Martín', apellido: 'Productor' });
  usuarioService.crearUsuario({ nombre: 'Carlos', apellido: 'Comprador' });
  usuarioService.crearUsuario({ nombre: 'Lucía', apellido: 'Compradora' });

  const enDias = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

  eventoService.crearEvento(
    { nombre: 'Confeti Fest', descripcion: 'Festival de música con bandas locales', fecha: enDias(30), multimedia: ['https://example.com/confeti.jpg'] },
    ana.id,
    musica.id,
    [
      { nombre: 'General', descripcion: 'Campo', precio: 5000, cupo: 100 },
      { nombre: 'VIP', descripcion: 'Zona preferencial', precio: 12000, cupo: 20 }
    ]
  );

  eventoService.crearEvento(
    { nombre: 'Hamlet', descripcion: 'Obra de teatro clásica', fecha: enDias(10), multimedia: ['https://example.com/hamlet.jpg'] },
    ana.id,
    teatro.id,
    [
      { nombre: 'Platea', descripcion: 'Butacas de platea', precio: 8000, cupo: 50 },
      { nombre: 'Pullman', descripcion: 'Primer piso', precio: 6000, cupo: 30 }
    ]
  );

  eventoService.crearEvento(
    { nombre: 'Stand Up Night', descripcion: 'Noche de stand up con humoristas', fecha: enDias(20), multimedia: ['https://example.com/standup.jpg'] },
    martin.id,
    humor.id,
    [{ nombre: 'General', descripcion: 'Mesas compartidas', precio: 4000, cupo: 60 }]
  );
}