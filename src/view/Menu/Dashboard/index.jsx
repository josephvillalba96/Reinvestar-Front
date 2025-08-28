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
      { name: 'DSCR', value: summary.dscr_requests, color: '#000' },
      { name: 'Fixflip', value: summary.fixflip_requests, color: '#666' },
      { name: 'Construction', value: summary.construction_requests, color: '#999' }
    ].filter(item => item.value > 0);
  };

  // Generate chart data for request status
  const getRequestStatusData = () => {
    const { summary } = dashboardData;
    return [
      { name: 'Pendientes', value: summary.pending_approval, color: '#000' },
      { name: 'En Proceso', value: summary.in_process, color: '#666' },
      { name: 'Aprobadas', value: summary.approved, color: '#999' },
      { name: 'Rechazadas', value: summary.rejected, color: '#ccc' }
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
      <div className={styles.loadingContainer}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando Dashboard...</p>
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
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0 my_title_color fw-bolder">Dashboard</h1>
              <p className="text-muted mb-0">Resumen ejecutivo de solicitudes</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/requests/new-request')}
              >
                Nueva Solicitud
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/requests')}
              >
                Ver Solicitudes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <i className="fas fa-file-alt"></i>
            </div>
            <div className={styles.metricContent}>
              <h6 className="text-muted mb-1">Total Solicitudes</h6>
              <h3 className="mb-0 fw-bold my_title_color">{summary.total_requests.toLocaleString()}</h3>
              <small className="text-success">
                <i className="fas fa-arrow-up me-1"></i>
                +12% este mes
              </small>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <i className="fas fa-clock"></i>
            </div>
            <div className={styles.metricContent}>
              <h6 className="text-muted mb-1">En Proceso</h6>
              <h3 className="mb-0 fw-bold my_title_color">{summary.in_process.toLocaleString()}</h3>
              <small className="text-warning">
                <i className="fas fa-arrow-down me-1"></i>
                -5% esta semana
              </small>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <i className="fas fa-check-circle"></i>
            </div>
            <div className={styles.metricContent}>
              <h6 className="text-muted mb-1">Aprobadas</h6>
              <h3 className="mb-0 fw-bold my_title_color">{summary.approved.toLocaleString()}</h3>
              <small className="text-success">
                <i className="fas fa-arrow-up me-1"></i>
                +8% este mes
              </small>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <i className="fas fa-percentage"></i>
            </div>
            <div className={styles.metricContent}>
              <h6 className="text-muted mb-1">Progreso Documentos</h6>
              <h3 className="mb-0 fw-bold my_title_color">{summary.document_progress}%</h3>
              <small className="text-info">
                <i className="fas fa-arrow-up me-1"></i>
                +15% esta semana
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="row mb-4">
        {/* Gráfico de dona - Tipos de solicitud */}
        <div className="col-lg-6 mb-4">
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h5 className="card-title mb-0 fw-bold my_title_color">
                Distribución por Tipo
              </h5>
            </div>
            <div className={styles.chartBody}>
              {requestTypeData.length > 0 ? (
                <div className="d-flex align-items-center justify-content-center">
                  <div className="position-relative me-4">
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#e5e7eb"
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
                          />
                        );
                      })}
                    </svg>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <div className="fw-bold fs-4 my_title_color">{summary.total_requests}</div>
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
                        <span className="me-2 my_title_color">{item.name}:</span>
                        <strong className="my_title_color">{item.value}</strong>
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
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h5 className="card-title mb-0 fw-bold my_title_color">
                Estados de Solicitudes
              </h5>
            </div>
            <div className={styles.chartBody}>
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
                          <strong className="my_title_color">{item.value}</strong>
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

      {/* Tablas de rendimiento */}
      <div className="row mb-4">
        {/* Rendimiento de vendedores */}
        <div className="col-lg-6 mb-4">
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h5 className="card-title mb-0 fw-bold my_title_color">
                Rendimiento de Vendedores
              </h5>
            </div>
            <div className={styles.tableBody}>
              {vendors_performance.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th className="my_title_color">Vendedor</th>
                        <th className="my_title_color">Total</th>
                        <th className="my_title_color">Aprobadas</th>
                        <th className="my_title_color">Tasa</th>
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
                              <span className="fw-medium my_title_color">{vendor.name}</span>
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
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-users fs-1 mb-3 d-block"></i>
                  No hay datos de vendedores
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carga de trabajo de procesadores */}
        <div className="col-lg-6 mb-4">
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h5 className="card-title mb-0 fw-bold my_title_color">
                Carga de Trabajo - Procesadores
              </h5>
            </div>
            <div className={styles.tableBody}>
              {processors_workload.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th className="my_title_color">Procesador</th>
                        <th className="my_title_color">Activas</th>
                        <th className="my_title_color">Completadas</th>
                        <th className="my_title_color">Total</th>
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
                              <span className="fw-medium my_title_color">{processor.name}</span>
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
                            <strong className="my_title_color">{processor.active_assignments + processor.completed_assignments}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-cogs fs-1 mb-3 d-block"></i>
                  No hay datos de procesadores
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="row mb-4">
        <div className="col-12">
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h5 className="card-title mb-0 fw-bold my_title_color">
                Actividad Reciente
              </h5>
            </div>
            <div className={styles.tableBody}>
              <div className="row">
                {recent_activity.slice(0, 6).map((activity, index) => (
                  <div key={index} className="col-md-6 mb-3">
                    <div className="d-flex align-items-start">
                      <div className={`bg-${activity.type === 'status_update' ? 'primary' : activity.type === 'document_upload' ? 'success' : 'warning'} rounded-circle d-flex align-items-center justify-content-center me-3`} style={{ width: '40px', height: '40px' }}>
                        <i className={`fas ${activity.type === 'status_update' ? 'fa-sync-alt' : activity.type === 'document_upload' ? 'fa-file-upload' : 'fa-plus-circle'} text-white`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-medium my_title_color">{activity.description}</p>
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
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h5 className="card-title mb-0 fw-bold my_title_color">
                Pipeline de Vendedores
              </h5>
            </div>
            <div className={styles.tableBody}>
              <div className="row">
                {/* DSCR Pipeline */}
                <div className="col-lg-4 mb-4">
                  <div className={styles.pipelineCard}>
                    <div className={styles.pipelineHeader}>
                      <h6 className="mb-0 fw-bold my_title_color">
                        DSCR
                        <span className="badge bg-primary ms-2">
                          {getPipelineTotal(vendor_pipeline.dscr)}
                        </span>
                      </h6>
                    </div>
                    <div className={styles.pipelineBody}>
                      {vendor_pipeline.dscr.length > 0 ? (
                        vendor_pipeline.dscr.map((stage, index) => (
                          <div key={index} className={styles.pipelineStage}>
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
                  <div className={styles.pipelineCard}>
                    <div className={styles.pipelineHeader}>
                      <h6 className="mb-0 fw-bold my_title_color">
                        Fixflip
                        <span className="badge bg-success ms-2">
                          {getPipelineTotal(vendor_pipeline.fixflip)}
                        </span>
                      </h6>
                    </div>
                    <div className={styles.pipelineBody}>
                      {vendor_pipeline.fixflip.length > 0 ? (
                        vendor_pipeline.fixflip.map((stage, index) => (
                          <div key={index} className={styles.pipelineStage}>
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
                  <div className={styles.pipelineCard}>
                    <div className={styles.pipelineHeader}>
                      <h6 className="mb-0 fw-bold my_title_color">
                        Construction
                        <span className="badge bg-warning ms-2">
                          {getPipelineTotal(vendor_pipeline.construction)}
                        </span>
                      </h6>
                    </div>
                    <div className={styles.pipelineBody}>
                      {vendor_pipeline.construction.length > 0 ? (
                        vendor_pipeline.construction.map((stage, index) => (
                          <div key={index} className={styles.pipelineStage}>
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
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h5 className="card-title mb-0 fw-bold my_title_color">
                  Línea de Tiempo de la Solicitud
                </h5>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setSelectedRequest(null)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className={styles.tableBody}>
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
                            <h6 className="mb-1 fw-bold my_title_color">{event.title || 'Sin título'}</h6>
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