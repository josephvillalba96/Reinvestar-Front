import React, { useState, useEffect } from 'react';
import { getVendorPipeline, getCoordinatorDashboard, getRequestTimeline } from '../../../Api/pipeline';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    summary: {
      total_requests: 0,
      dscr_requests: 0,
      construction_requests: 0,
      fixflip_requests: 0,
      pending_approval: 0,
      in_process: 0,
      approved: 0,
      rejected: 0,
      document_progress: 0
    },
    recent_activity: [],
    vendors_performance: [],
    processors_workload: [],
    vendor_pipeline: {
      dscr: [],
      fixflip: [],
      construction: []
    }
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardData, pipelineData] = await Promise.all([
        getCoordinatorDashboard(),
        getVendorPipeline()
      ]);
      
      setDashboardData({
        summary: dashboardData?.summary || {
          total_requests: 0,
          dscr_requests: 0,
          construction_requests: 0,
          fixflip_requests: 0,
          pending_approval: 0,
          in_process: 0,
          approved: 0,
          rejected: 0,
          document_progress: 0
        },
        recent_activity: Array.isArray(dashboardData?.recent_activity) ? dashboardData.recent_activity : [],
        vendors_performance: Array.isArray(dashboardData?.vendors_performance) ? dashboardData.vendors_performance : [],
        processors_workload: Array.isArray(dashboardData?.processors_workload) ? dashboardData.processors_workload : [],
        vendor_pipeline: {
          dscr: Array.isArray(pipelineData?.dscr) ? pipelineData.dscr : [],
          fixflip: Array.isArray(pipelineData?.fixflip) ? pipelineData.fixflip : [],
          construction: Array.isArray(pipelineData?.construction) ? pipelineData.construction : []
        }
      });
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeline = async (type, id) => {
    try {
      const timelineData = await getRequestTimeline(type, id);
      setTimeline(Array.isArray(timelineData) ? timelineData : []);
      setSelectedRequest({ type, id });
    } catch (err) {
      console.error('Error al cargar la línea de tiempo:', err);
      setTimeline([]);
    }
  };

  // Calculate totals for pipeline data
  const getPipelineTotal = (pipelineData) => {
    return pipelineData.reduce((sum, stage) => sum + (stage.count || 0), 0);
  };

  const getPipelineAmount = (pipelineData) => {
    return pipelineData.reduce((sum, stage) => sum + (stage.total_amount || 0), 0);
  };

  // Generate chart data for request types
  const getRequestTypeData = () => {
    const { summary } = dashboardData;
    return [
      { name: 'DSCR', value: summary.dscr_requests, color: '#0d6efd' },
      { name: 'Fixflip', value: summary.fixflip_requests, color: '#198754' },
      { name: 'Construction', value: summary.construction_requests, color: '#fd7e14' }
    ].filter(item => item.value > 0);
  };

  // Generate chart data for request status
  const getRequestStatusData = () => {
    const { summary } = dashboardData;
    return [
      { name: 'Pendientes', value: summary.pending_approval, color: '#ffc107' },
      { name: 'En Proceso', value: summary.in_process, color: '#0d6efd' },
      { name: 'Aprobadas', value: summary.approved, color: '#198754' },
      { name: 'Rechazadas', value: summary.rejected, color: '#dc3545' }
    ].filter(item => item.value > 0);
  };

  // Generate line chart data for pipeline trends
  const getPipelineTrendData = () => {
    const { vendor_pipeline } = dashboardData;
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    
    return months.map((month, index) => ({
      month,
      dscr: Math.floor(Math.random() * 50) + 10, // Simulated data
      fixflip: Math.floor(Math.random() * 30) + 5,
      construction: Math.floor(Math.random() * 20) + 3
    }));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-outline-danger" onClick={loadDashboardData}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { summary, recent_activity, vendors_performance, processors_workload, vendor_pipeline } = dashboardData;
  const requestTypeData = getRequestTypeData();
  const requestStatusData = getRequestStatusData();
  const pipelineTrendData = getPipelineTrendData();

  return (
    <div className={`${styles.dashboardContainer} container-fluid`}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0 text-dark fw-bold">Dashboard</h1>
              <p className="text-muted mb-0">Resumen ejecutivo de solicitudes</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/requests/new-request')}
              >
                <i className="fas fa-plus me-2"></i>
                Nueva Solicitud
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/requests')}
              >
                <i className="fas fa-list me-2"></i>
                Ver Solicitudes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary rounded-3 p-3">
                    <i className="fas fa-file-alt text-white fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Solicitudes</h6>
                  <h3 className="mb-0 fw-bold text-dark">{summary.total_requests.toLocaleString()}</h3>
                  <small className="text-success">
                    <i className="fas fa-arrow-up me-1"></i>
                    +12% este mes
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning rounded-3 p-3">
                    <i className="fas fa-clock text-white fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">En Proceso</h6>
                  <h3 className="mb-0 fw-bold text-dark">{summary.in_process.toLocaleString()}</h3>
                  <small className="text-warning">
                    <i className="fas fa-arrow-down me-1"></i>
                    -5% esta semana
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success rounded-3 p-3">
                    <i className="fas fa-check-circle text-white fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Aprobadas</h6>
                  <h3 className="mb-0 fw-bold text-dark">{summary.approved.toLocaleString()}</h3>
                  <small className="text-success">
                    <i className="fas fa-arrow-up me-1"></i>
                    +8% este mes
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info rounded-3 p-3">
                    <i className="fas fa-percentage text-white fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Progreso Documentos</h6>
                  <h3 className="mb-0 fw-bold text-dark">{summary.document_progress}%</h3>
                  <small className="text-info">
                    <i className="fas fa-arrow-up me-1"></i>
                    +15% esta semana
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="row mb-4">
        {/* Gráfico de dona - Tipos de solicitud */}
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0 fw-bold">
                <i className="fas fa-chart-pie me-2 text-primary"></i>
                Distribución por Tipo
              </h5>
            </div>
            <div className="card-body">
              {requestTypeData.length > 0 ? (
                <div className="d-flex align-items-center justify-content-center">
                  <div className="position-relative me-4">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#e9ecef"
                        strokeWidth="10"
                      />
                      {requestTypeData.map((item, index) => {
                        const total = requestTypeData.reduce((sum, d) => sum + d.value, 0);
                        const percentage = (item.value / total) * 100;
                        const circumference = 2 * Math.PI * 50;
                        const strokeDasharray = (percentage / 100) * circumference;
                        const strokeDashoffset = circumference - strokeDasharray;
                        const rotation = requestTypeData
                          .slice(0, index)
                          .reduce((sum, d) => sum + (d.value / total) * 360, 0);
                        
                        return (
                          <circle
                            key={item.name}
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke={item.color}
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform={`rotate(${rotation} 60 60)`}
                            className="transition-all"
                          />
                        );
                      })}
                    </svg>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <div className="fw-bold fs-4">{summary.total_requests}</div>
                      <small className="text-muted">Total</small>
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    {requestTypeData.map((item) => (
                      <div key={item.name} className="d-flex align-items-center mb-2">
                        <div 
                          className="me-2" 
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: item.color,
                            borderRadius: '2px'
                          }}
                        ></div>
                        <span className="me-2">{item.name}:</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-chart-pie fs-1 mb-3 d-block"></i>
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de barras - Estados de solicitudes */}
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0 fw-bold">
                <i className="fas fa-chart-bar me-2 text-success"></i>
                Estados de Solicitudes
              </h5>
            </div>
            <div className="card-body">
              {requestStatusData.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {requestStatusData.map((item) => {
                    const maxValue = Math.max(...requestStatusData.map(d => d.value));
                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    
                    return (
                      <div key={item.name} className="d-flex align-items-center">
                        <div className="me-3" style={{ width: '80px' }}>
                          <small className="text-muted">{item.name}</small>
                        </div>
                        <div className="flex-grow-1 me-3">
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar" 
                              style={{ 
                                width: `${percentage}%`, 
                                backgroundColor: item.color 
                              }}
                            ></div>
                          </div>
                        </div>
                        <div style={{ width: '40px', textAlign: 'right' }}>
                          <strong>{item.value}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-chart-bar fs-1 mb-3 d-block"></i>
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de línea - Tendencias */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0 fw-bold">
                <i className="fas fa-chart-line me-2 text-info"></i>
                Tendencias de Solicitudes
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                <svg width="100%" height="180" viewBox="0 0 800 180">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={i}
                      x1={i * 133.33}
                      y1="0"
                      x2={i * 133.33}
                      y2="180"
                      stroke="#e9ecef"
                      strokeWidth="1"
                    />
                  ))}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 45}
                      x2="800"
                      y2={i * 45}
                      stroke="#e9ecef"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* DSCR Line */}
                  <polyline
                    points={pipelineTrendData.map((d, i) => `${i * 133.33 + 66.67},${180 - (d.dscr / 60) * 180}`).join(' ')}
                    fill="none"
                    stroke="#0d6efd"
                    strokeWidth="3"
                  />
                  
                  {/* Fixflip Line */}
                  <polyline
                    points={pipelineTrendData.map((d, i) => `${i * 133.33 + 66.67},${180 - (d.fixflip / 60) * 180}`).join(' ')}
                    fill="none"
                    stroke="#198754"
                    strokeWidth="3"
                  />
                  
                  {/* Construction Line */}
                  <polyline
                    points={pipelineTrendData.map((d, i) => `${i * 133.33 + 66.67},${180 - (d.construction / 60) * 180}`).join(' ')}
                    fill="none"
                    stroke="#fd7e14"
                    strokeWidth="3"
                  />
                  
                  {/* Data points */}
                  {pipelineTrendData.map((d, i) => (
                    <g key={i}>
                      <circle
                        cx={i * 133.33 + 66.67}
                        cy={180 - (d.dscr / 60) * 180}
                        r="4"
                        fill="#0d6efd"
                      />
                      <circle
                        cx={i * 133.33 + 66.67}
                        cy={180 - (d.fixflip / 60) * 180}
                        r="4"
                        fill="#198754"
                      />
                      <circle
                        cx={i * 133.33 + 66.67}
                        cy={180 - (d.construction / 60) * 180}
                        r="4"
                        fill="#fd7e14"
                      />
                    </g>
                  ))}
                  
                  {/* Labels */}
                  {pipelineTrendData.map((d, i) => (
                    <text
                      key={i}
                      x={i * 133.33 + 66.67}
                      y="195"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#6c757d"
                    >
                      {d.month}
                    </text>
                  ))}
                </svg>
              </div>
              <div className="d-flex justify-content-center gap-4 mt-3">
                <div className="d-flex align-items-center">
                  <div className="me-2" style={{ width: '12px', height: '12px', backgroundColor: '#0d6efd' }}></div>
                  <small>DSCR</small>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-2" style={{ width: '12px', height: '12px', backgroundColor: '#198754' }}></div>
                  <small>Fixflip</small>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-2" style={{ width: '12px', height: '12px', backgroundColor: '#fd7e14' }}></div>
                  <small>Construction</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablas de rendimiento */}
      <div className="row mb-4">
        {/* Rendimiento de vendedores */}
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0 fw-bold">
                <i className="fas fa-users me-2 text-primary"></i>
                Rendimiento de Vendedores
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Vendedor</th>
                      <th>Total</th>
                      <th>Aprobadas</th>
                      <th>Tasa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors_performance.map((vendor) => (
                      <tr key={vendor.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                              <i className="fas fa-user text-white small"></i>
                            </div>
                            <span className="fw-medium">{vendor.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{vendor.total_requests}</span>
                        </td>
                        <td>
                          <span className="badge bg-success">{vendor.approved_requests}</span>
                        </td>
                        <td>
                          <span className={`badge ${vendor.approval_rate > 80 ? 'bg-success' : vendor.approval_rate > 60 ? 'bg-warning' : 'bg-danger'}`}>
                            {vendor.approval_rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {vendors_performance.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          <i className="fas fa-users fs-1 mb-3 d-block"></i>
                          No hay datos de vendedores
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Carga de trabajo de procesadores */}
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0 fw-bold">
                <i className="fas fa-cogs me-2 text-success"></i>
                Carga de Trabajo - Procesadores
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Procesador</th>
                      <th>Activas</th>
                      <th>Completadas</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processors_workload.map((processor) => (
                      <tr key={processor.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                              <i className="fas fa-user-cog text-white small"></i>
                            </div>
                            <span className="fw-medium">{processor.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${processor.active_assignments > 5 ? 'bg-danger' : processor.active_assignments > 2 ? 'bg-warning' : 'bg-success'}`}>
                            {processor.active_assignments}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-info">{processor.completed_assignments}</span>
                        </td>
                        <td>
                          <strong className="text-dark">{processor.active_assignments + processor.completed_assignments}</strong>
                        </td>
                      </tr>
                    ))}
                    {processors_workload.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          <i className="fas fa-cogs fs-1 mb-3 d-block"></i>
                          No hay datos de procesadores
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0 fw-bold">
                <i className="fas fa-history me-2 text-info"></i>
                Actividad Reciente
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                {recent_activity.slice(0, 6).map((activity, index) => (
                  <div key={index} className="col-md-6 mb-3">
                    <div className="d-flex align-items-start">
                      <div className={`bg-${activity.type === 'status_update' ? 'primary' : activity.type === 'document_upload' ? 'success' : 'warning'} rounded-circle d-flex align-items-center justify-content-center me-3`} style={{ width: '40px', height: '40px' }}>
                        <i className={`fas ${activity.type === 'status_update' ? 'fa-sync-alt' : activity.type === 'document_upload' ? 'fa-file-upload' : 'fa-plus-circle'} text-white`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-medium">{activity.description}</p>
                        <small className="text-muted">
                          <i className="fas fa-clock me-1"></i>
                          {new Date(activity.timestamp).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
                {recent_activity.length === 0 && (
                  <div className="col-12 text-center text-muted py-4">
                    <i className="fas fa-inbox fs-1 mb-3 d-block"></i>
                    No hay actividad reciente
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline de Vendedores */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="card-title mb-0 fw-bold">
                <i className="fas fa-sitemap me-2 text-primary"></i>
                Pipeline de Vendedores
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                {/* DSCR Pipeline */}
                <div className="col-lg-4 mb-4">
                  <div className="card border h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 fw-bold">
                        <i className="fas fa-home me-2 text-primary"></i>
                        DSCR
                        <span className="badge bg-primary ms-2">
                          {getPipelineTotal(vendor_pipeline.dscr)}
                        </span>
                      </h6>
                    </div>
                    <div className="card-body">
                      {vendor_pipeline.dscr.length > 0 ? (
                        vendor_pipeline.dscr.map((stage, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                            <div>
                              <small className="text-muted d-block">{stage.stage || 'Sin etapa'}</small>
                              <strong className="text-success">${(stage.total_amount || 0).toLocaleString()}</strong>
                            </div>
                            <span className="badge bg-primary">{stage.count || 0}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted py-3">
                          <i className="fas fa-chart-line fs-3 mb-2 d-block"></i>
                          No hay datos de pipeline DSCR
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fixflip Pipeline */}
                <div className="col-lg-4 mb-4">
                  <div className="card border h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 fw-bold">
                        <i className="fas fa-tools me-2 text-success"></i>
                        Fixflip
                        <span className="badge bg-success ms-2">
                          {getPipelineTotal(vendor_pipeline.fixflip)}
                        </span>
                      </h6>
                    </div>
                    <div className="card-body">
                      {vendor_pipeline.fixflip.length > 0 ? (
                        vendor_pipeline.fixflip.map((stage, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                            <div>
                              <small className="text-muted d-block">{stage.stage || 'Sin etapa'}</small>
                              <strong className="text-success">${(stage.total_amount || 0).toLocaleString()}</strong>
                            </div>
                            <span className="badge bg-success">{stage.count || 0}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted py-3">
                          <i className="fas fa-chart-line fs-3 mb-2 d-block"></i>
                          No hay datos de pipeline Fixflip
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Construction Pipeline */}
                <div className="col-lg-4 mb-4">
                  <div className="card border h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 fw-bold">
                        <i className="fas fa-building me-2 text-warning"></i>
                        Construction
                        <span className="badge bg-warning ms-2">
                          {getPipelineTotal(vendor_pipeline.construction)}
                        </span>
                      </h6>
                    </div>
                    <div className="card-body">
                      {vendor_pipeline.construction.length > 0 ? (
                        vendor_pipeline.construction.map((stage, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                            <div>
                              <small className="text-muted d-block">{stage.stage || 'Sin etapa'}</small>
                              <strong className="text-success">${(stage.total_amount || 0).toLocaleString()}</strong>
                            </div>
                            <span className="badge bg-warning">{stage.count || 0}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted py-3">
                          <i className="fas fa-chart-line fs-3 mb-2 d-block"></i>
                          No hay datos de pipeline Construction
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Línea de tiempo de la solicitud seleccionada */}
      {selectedRequest && timeline.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 fw-bold">
                  <i className="fas fa-clock me-2 text-info"></i>
                  Línea de Tiempo de la Solicitud
                </h5>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setSelectedRequest(null)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="card-body">
                <div className="timeline">
                  {timeline.map((event, index) => (
                    <div key={index} className="d-flex mb-3">
                      <div className="flex-shrink-0">
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px' }}>
                          <i className="fas fa-calendar text-white small"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1 fw-bold">{event.title || 'Sin título'}</h6>
                            <p className="mb-1 text-muted">{event.description || 'Sin descripción'}</p>
                            {event.status && (
                              <span className={`badge ${event.status === 'approved' ? 'bg-success' : event.status === 'rejected' ? 'bg-danger' : event.status === 'pending' ? 'bg-warning' : 'bg-info'}`}>
                                {event.status}
                              </span>
                            )}
                          </div>
                          <small className="text-muted">
                            {event.timestamp ? new Date(event.timestamp).toLocaleDateString() : 'Fecha no disponible'}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 