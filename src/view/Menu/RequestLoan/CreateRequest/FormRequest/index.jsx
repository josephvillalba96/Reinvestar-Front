
const FormRequest = () => {
  return (
    <>
      <div
        className="container-fluid p-4"
      >
        <div className="row">
          {/* Primera fila */}
          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">
              Tipo de producto
            </label>
            <select className="form-select">
              <option value="">Seleccionar...</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="terreno">Terreno</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">
              Fecha de diligenciamiento
            </label>
            <input type="date" className="form-control" />
          </div>

          <div className="col-md-4 mb-3">{/* Espaciador */}</div>
        </div>

        <div className="row">
          {/* Segunda fila */}
          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">
              Nombre del cliente
            </label>
            <input type="text" className="form-control" placeholder="" />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">
              Correo electrónico
            </label>
            <input type="email" className="form-control" placeholder="" />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">
              Número de teléfono
            </label>
            <input type="tel" className="form-control" placeholder="" />
          </div>
        </div>

        <div className="row">
          {/* Tercera fila */}
          <div className="col-md-6 mb-3">
            <label className="form-label text-muted small">
              Dirección de la propiedad
            </label>
            <input type="text" className="form-control" placeholder="" />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label text-muted small">
              ¿Compra o refinanciación?
            </label>
            <input type="text" className="form-control" placeholder="" />
          </div>
        </div>

        <div className="row">
          {/* Fila de checkboxes */}
          <div className="col-md-2 mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="hipoteca"
              />
              <label
                className="form-check-label text-muted small"
                htmlFor="hipoteca"
              >
                ¿Tiene hipoteca?
              </label>
            </div>
          </div>

          <div className="col-md-2 mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="morosidad"
              />
              <label
                className="form-check-label text-muted small"
                htmlFor="morosidad"
              >
                ¿Tiene morosidad?
              </label>
            </div>
          </div>

          <div className="col-md-2 mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="impuestos"
              />
              <label
                className="form-check-label text-muted small"
                htmlFor="impuestos"
              >
                ¿Paga impuestos?
              </label>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="hoi" />
              <label
                className="form-check-label text-muted small"
                htmlFor="hoi"
              >
                ¿HOI vigente?
              </label>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="llc" />
              <label
                className="form-check-label text-muted small"
                htmlFor="llc"
              >
                ¿Sujeto bajo LLC?
              </label>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Quinta fila */}
          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">FICO Score</label>
            <input type="number" className="form-control" placeholder="" />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">
              Estado de residencia
            </label>
            <select className="form-select">
              <option value="">Seleccionar estado...</option>
              <option value="ca">California</option>
              <option value="ny">New York</option>
              <option value="tx">Texas</option>
              <option value="fl">Florida</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">
              Uso de la propiedad
            </label>
            <input type="text" className="form-control" placeholder="" />
          </div>
        </div>

        <div className="row">
          {/* Sexta fila */}
          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">
              Monto de alquiler
            </label>
            <input type="number" className="form-control" placeholder="" />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">
              Penalidad por prepago (años)
            </label>
            <input type="number" className="form-control" placeholder="" />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">
              Importe del pago mensual
            </label>
            <input type="number" className="form-control" placeholder="" />
          </div>
        </div>

        <div className="row">
          {/* Séptima fila */}
          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">
              Valor de tasación
            </label>
            <input type="number" className="form-control" placeholder="" />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">
              N° de unidades de propiedad
            </label>
            <select className="form-select">
              <option value="">Seleccionar...</option>
              <option value="1">1 unidad</option>
              <option value="2">2 unidades</option>
              <option value="3">3 unidades</option>
              <option value="4">4+ unidades</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label text-muted small">Notas</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder=""
            ></textarea>
          </div>
        </div>

        <div className="row">
          {/* Octava fila */}
          <div className="col-md-6 mb-3">
            <label className="form-label text-muted small">
              Porcentaje DSCR
            </label>
            <input
              type="number"
              className="form-control"
              placeholder=""
              step="0.01"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label text-muted small">
              Tipo de transacción
            </label>
            <select className="form-select">
              <option value="">Seleccionar tipo...</option>
              <option value="compra">Compra</option>
              <option value="refinanciacion">Refinanciación</option>
              <option value="cashout">Cash-out</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-12 mt-4">
            <button
              type="submit"
              className="btn btn-primary px-5 py-2 fw-bold"
              style={{
                backgroundColor: "#1e3a8a",
                borderColor: "#1e3a8a",
                borderRadius: "25px",
                minWidth: "200px",
              }}
            >
              <span className="text-white">CREAR</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormRequest; 
