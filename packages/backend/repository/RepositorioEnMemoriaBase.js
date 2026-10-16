export class RepositorioEnMemoriaBase {
  constructor() {
    this._coleccion = [];
    this._siguienteId = 1;
  }

  getAll() {
    return this._coleccion.map((item) => ({ ...item }));
  }

  getById(id) {
    return this._coleccion.find((item) => item.id === id) ?? null;
  }

  save(entity) {
    entity.id = this._siguienteId++;
    this._coleccion.push(entity);
    return entity;
  }

  delete(id) {
    const index = this._coleccion.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    return this._coleccion.splice(index, 1)[0];
  }

  exists(id) {
    return this._coleccion.some((item) => item.id === id);
  }
}
