import React from 'react';
import style from './Product.module.css'; // Asegúrate de tener un archivo CSS para estilos
import Edit from '../../../assets/editIcon.svg'; 

const Productos = () => {
  const productos = [
    {
      titulo: 'DSCR',
      descripcion:
        'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet Neque porro quisquam est qui dolorem ipsum quia dolor sit amet',
    },
    {
      titulo: 'Nueva Construcción',
      descripcion:
        'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet Neque porro quisquam est qui dolorem ipsum quia dolor sit amet',
    },
    {
      titulo: 'Fix & Flip',
      descripcion:
        'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet Neque porro quisquam est qui dolorem ipsum quia dolor sit amet',
    },
    {
      titulo: 'Otro producto',
      descripcion:
        'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet Neque porro quisquam est qui dolorem ipsum quia dolor sit amet',
    },
  ];

  return (
  <div className={`${"container p-3"} internal_layout`} style={{paddingTop: undefined}}>
      <h2 className="fw-bold fs-1 mb-5">Productos</h2>
      <div className="row g-5">
        {productos.map((producto, index) => (
          <div className="col-md-6" key={index} style={{ width: '36%'}}>
            <div className="card shadow-sm border-0 h-100" style={{ backgroundColor: '#F3F5F7', borderRadius: '29px', padding: '20px' }}>
              <div className="card-body position-relative">
                <div className='d-flex justify-content-between align-items-center mb-3'>
                    <h5 className="card-title fw-bolder fs-4 my_title_color">{producto.titulo}</h5>
                    <img src={Edit} alt="icon-edit" />
                </div>
                <p className="card-text text-muted">{producto.descripcion}</p>
                <span className="position-absolute top-0 end-0 m-3">
                  <i className="bi bi-pencil-square text-primary"></i>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Productos;
