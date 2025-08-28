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
      { name: 'DSCR', value: summary.dscr_requests, color: '#FFC862' },
      { name: 'Fixflip', value: summary.fixflip_requests, color: '#1B2559' },
      { name: 'Construction', value: summary.construction_requests, color: '#2c3e50' }
    ].filter(item => item.value > 0);
  };

  // Generate chart data for request status
  const getRequestStatusData = () => {
    const { summary } = dashboardData;
    return [
      { name: 'Pendientes', value: summary.pending_approval, color: '#FFC862' },
      { name: 'En Proceso', value: summary.in_process, color: '#1B2559' },
      { name: 'Aprobadas', value: summary.approved, color: '#10b981' },
      { name: 'Rechazadas', value: summary.rejected, color: '#ef4444' }
    ].filter(item => item.value > 0);
  };

  // Generate line chart data for request trends (simulated monthly data)
  const getRequestTrendData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const { summary } = dashboardData;
    
    // Simulate trend data based on current totals
    return months.map((month, index) => ({
      month,
      dscr: Math.floor((summary.dscr_requests / 6) * (index + 1) + Math.random() * 5),
      fixflip: Math.floor((summary.fixflip_requests / 6) * (index + 1) + Math.random() * 3),
      construction: Math.floor((summary.construction_requests / 6) * (index + 1) + Math.random() * 2)
    }));
  };

  // Generate line chart data for pipeline trends
  const getPipelineTrendData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const { vendor_pipeline } = dashboardData;
    
    return months.map((month, index) => ({
      month,
      dscr: Math.floor((getPipelineTotal(vendor_pipeline.dscr) / 6) * (index + 1) + Math.random() * 3),
      fixflip: Math.floor((getPipelineTotal(vendor_pipeline.fixflip) / 6) * (index + 1) + Math.random() * 2),
      construction: Math.floor((getPipelineTotal(vendor_pipeline.construction) / 6) * (index + 1) + Math.random() * 1)
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
  const requestTrendData = getRequestTrendData();
  const pipelineTrendData = getPipelineTrendData();

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0 my_title_color fw-bolder">Dashboard Ejecutivo</h1>
              <p className="text-muted mb-0">Resumen integral de solicitudes y rendimiento</p>
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

      {/* Primera fila - Métricas principales */}
      <div className="row mb-4">
        {/* Total Solicitudes - Métrica principal */}
        <div className="col-lg-3 mb-4">
          <div className={styles.mainMetricCard}>
            <div className={styles.metricIcon}>
              <i className="fas fa-chart-line"></i>
            </div>
            <div className={styles.metricContent}>
              <h3 className={styles.metricValue}>{summary.total_requests.toLocaleString()}</h3>
              <p className={styles.metricTitle}>Total Solicitudes</p>
              <small className={styles.metricSubtitle}>Todas las solicitudes</small>
            </div>
          </div>
        </div>

        {/* Solicitudes En Proceso */}
        <div className="col-lg-3 mb-4">
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{backgroundColor: '#FFC862'}}>
              <i className="fas fa-clock text-white"></i>
            </div>
            <div className={styles.metricContent}>
              <h4 className={styles.metricValue}>{summary.in_process.toLocaleString()}</h4>
              <p className={styles.metricTitle}>En Proceso</p>
              <small className={styles.metricSubtitle}>Solicitudes activas</small>
            </div>
          </div>
        </div>

        {/* Solicitudes Aprobadas */}
        <div className="col-lg-3 mb-4">
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{backgroundColor: '#10b981'}}>
              <i className="fas fa-check text-white"></i>
            </div>
            <div className={styles.metricContent}>
              <h4 className={styles.metricValue}>{summary.approved.toLocaleString()}</h4>
              <p className={styles.metricTitle}>Aprobadas</p>
              <small className={styles.metricSubtitle}>Solicitudes aprobadas</small>
            </div>
          </div>
        </div>

        {/* Solicitudes Pendientes */}
        <div className="col-lg-3 mb-4">
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{backgroundColor: '#f59e0b'}}>
              <i className="fas fa-hourglass-half text-white"></i>
            </div>
            <div className={styles.metricContent}>
              <h4 className={styles.metricValue}>{summary.pending_approval.toLocaleString()}</h4>
              <p className={styles.metricTitle}>Pendientes</p>
              <small className={styles.metricSubtitle}>Esperando aprobación</small>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila - Gráfico combinado de tendencias de solicitudes */}
      <div className="row mb-4">
        {/* Tendencias Combinadas - Un solo gráfico */}
        <div className="col-12 mb-4">
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h5 className={styles.chartTitle}>
                <i className="fas fa-chart-line me-2" style={{color: '#FFC862'}}></i>
                Tendencias de Solicitudes por Tipo
              </h5>
              <p className={styles.chartSubtitle}>Evolución mensual comparativa de DSCR, Fixflip y Construction</p>
            </div>
            <div className={styles.combinedLineChart}>
              <svg width="100%" height="300" viewBox="0 0 800 300">
                <defs>
                  <linearGradient id="dscrGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFC862" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#FFC862" stopOpacity="0.05"/>
                  </linearGradient>
                  <linearGradient id="fixflipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1B2559" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#1B2559" stopOpacity="0.05"/>
                  </linearGradient>
                  <linearGradient id="constructionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2c3e50" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#2c3e50" stopOpacity="0.05"/>
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                <g className="grid-lines">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={`grid-${i}`}
                      x1={50 + (i * 120)}
                      y1="50"
                      x2={50 + (i * 120)}
                      y2="250"
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  ))}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={`hgrid-${i}`}
                      x1="50"
                      y1={50 + (i * 50)}
                      x2="770"
                      y2={50 + (i * 50)}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  ))}
                </g>

                {/* Month labels */}
                {requestTrendData.map((point, index) => (
                  <text
                    key={`month-${index}`}
                    x={50 + (index * 120)}
                    y="280"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6c757d"
                    fontWeight="500"
                  >
                    {point.month}
                  </text>
                ))}

                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const maxValue = Math.max(
                    ...requestTrendData.map(p => Math.max(p.dscr, p.fixflip, p.construction))
                  );
                  const value = Math.round((maxValue / 4) * (4 - i));
                  return (
                    <text
                      key={`y-${i}`}
                      x="35"
                      y={55 + (i * 50)}
                      textAnchor="end"
                      fontSize="11"
                      fill="#6c757d"
                    >
                      {value}
                    </text>
                  );
                })}

                {/* DSCR Line and Area */}
                <path
                  d={requestTrendData.map((point, index) => {
                    const x = 50 + (index * 120);
                    const maxValue = Math.max(
                      ...requestTrendData.map(p => Math.max(p.dscr, p.fixflip, p.construction))
                    );
                    const y = 250 - (point.dscr / maxValue) * 200;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#FFC862"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={requestTrendData.map((point, index) => {
                    const x = 50 + (index * 120);
                    const maxValue = Math.max(
                      ...requestTrendData.map(p => Math.max(p.dscr, p.fixflip, p.construction))
                    );
                    const y = 250 - (point.dscr / maxValue) * 200;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ') + ' L 770 250 L 50 250 Z'}
                  fill="url(#dscrGradient)"
                />
                {requestTrendData.map((point, index) => {
                  const x = 50 + (index * 120);
                  const maxValue = Math.max(
                    ...requestTrendData.map(p => Math.max(p.dscr, p.fixflip, p.construction))
                  );
                  const y = 250 - (point.dscr / maxValue) * 200;
                  return (
                    <circle
                      key={`dscr-${index}`}
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#FFC862"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Fixflip Line and Area */}
                <path
                  d={requestTrendData.map((point, index) => {
                    const x = 50 + (index * 120);
                    const maxValue = Math.max(
                      ...requestTrendData.map(p => Math.max(p.dscr, p.fixflip, p.construction))
                    );
                    const y = 250 - (point.fixflip / maxValue) * 200;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#1B2559"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={requestTrendData.map((point, index) => {
                    const x = 50 + (index * 120);
                    const maxValue = Math.max(
                      ...requestTrendData.map(p => Math.max(p.dscr, p.fixflip, p.construction))
                    );
                    const y = 250 - (point.fixflip / maxValue) * 200;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ') + ' L 770 250 L 50 250 Z'}
                  fill="url(#fixflipGradient)"
                />
                {requestTrendData.map((point, index) => {
                  const x = 50 + (index * 120);
                  const maxValue = Math.max(
                    ...requestTrendData.map(p => Math.max(p.dscr, p.fixflip, p.construction))
                  );
                  const y = 250 - (point.fixflip / maxValue) * 200;
                  return (
                    <circle
                      key={`fixflip-${index}`}
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#1B2559"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Construction Line and Area */}
                <path
                  d={requestTrendData.map((point, index) => {
                    const x = 50 + (index * 120);
                    const maxValue = Math.max(
                      ...requestTrendData.map(p => Math.max(p.dscr, p.fixflip, p.construction))
                    );
                    const y = 250 - (point.construction / maxValue) * 200;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#2c3e50"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={requestTrendData.map((point, index) => {
                    const x = 50 + (index * 120);
                    const maxValue = Math.max(
                      ...requestTrendData.map(p => Math.max(p.dscr, p.fixflip, p.construction))
                    );
                    const y = 250 - (point.construction / maxValue) * 200;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ') + ' L 770 250 L 50 250 Z'}
                  fill="url(#constructionGradient)"
                />
                {requestTrendData.map((point, index) => {
                  const x = 50 + (index * 120);
                  const maxValue = Math.max(
                    ...requestTrendData.map(p => Math.max(p.dscr, p.fixflip, p.construction))
                  );
                  const y = 250 - (point.construction / maxValue) * 200;
                  return (
                    <circle
                      key={`construction-${index}`}
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#2c3e50"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
              
              {/* Legend */}
              <div className={styles.combinedChartLegend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendColor} style={{backgroundColor: '#FFC862'}}></span>
                  <span>DSCR: {summary.dscr_requests}</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendColor} style={{backgroundColor: '#1B2559'}}></span>
                  <span>Fixflip: {summary.fixflip_requests}</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendColor} style={{backgroundColor: '#2c3e50'}}></span>
                  <span>Construction: {summary.construction_requests}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tercera fila - Distribución y estados */}
      <div className="row mb-4">
        {/* Distribución por Tipo - Gráfico de dona */}
        <div className="col-lg-6 mb-4">
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h5 className={styles.chartTitle}>
                <i className="fas fa-chart-pie me-2" style={{color: '#FFC862'}}></i>
                Distribución por Tipo
              </h5>
              <p className={styles.chartSubtitle}>Solicitudes por categoría</p>
            </div>
            <div className={styles.pieChart}>
              {requestTypeData.length > 0 ? (
                <>
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="40"/>
                    {requestTypeData.map((item, index) => {
                      const total = requestTypeData.reduce((sum, d) => sum + d.value, 0);
                      const percentage = (item.value / total) * 100;
                      const circumference = 2 * Math.PI * 80;
                      const strokeDasharray = (percentage / 100) * circumference;
                      const strokeDashoffset = circumference - strokeDasharray;
                      const rotation = requestTypeData
                        .slice(0, index)
                        .reduce((sum, d) => sum + (d.value / total) * 360, 0);
                      
                      return (
                        <circle
                          key={item.name}
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="40"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          transform={`rotate(${rotation} 100 100)`}
                        />
                      );
                    })}
                  </svg>
                  <div className={styles.pieLegend}>
                    {requestTypeData.map((item) => (
                      <div key={item.name} className={styles.legendItem}>
                        <span className={styles.legendColor} style={{backgroundColor: item.color}}></span>
                        <span>{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-chart-pie fs-1 mb-3 d-block"></i>
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estados de Solicitudes - Gráfico de barras */}
        <div className="col-lg-6 mb-4">
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h5 className={styles.chartTitle}>
                <i className="fas fa-chart-bar me-2" style={{color: '#1B2559'}}></i>
                Estados de Solicitudes
              </h5>
              <p className={styles.chartSubtitle}>Distribución por estado</p>
            </div>
            <div className={styles.barChart}>
              {requestStatusData.length > 0 ? (
                requestStatusData.map((item) => {
                  const maxValue = Math.max(...requestStatusData.map(d => d.value));
                  const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                  
                  return (
                    <div key={item.name} className={styles.barGroup}>
                      <div className={styles.barLabel}>{item.name}</div>
                      <div className={styles.barContainer}>
                        <div 
                          className={styles.bar} 
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: item.color
                          }}
                        >
                          {item.value}
                        </div>
                      </div>
                    </div>
                  );
                })
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

      {/* Cuarta fila - KPIs adicionales */}
      <div className="row mb-4">
        {/* Progreso Documentos */}
        <div className="col-lg-3 mb-4">
          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{backgroundColor: '#10b981'}}>
              <i className="fas fa-file-alt text-white"></i>
            </div>
            <div className={styles.kpiContent}>
              <h4 className={styles.kpiValue}>{summary.document_progress}%</h4>
              <p className={styles.kpiTitle}>Progreso Documentos</p>
              <small className={styles.kpiSubtitle}>Completitud general</small>
            </div>
          </div>
        </div>

        {/* Solicitudes Rechazadas */}
        <div className="col-lg-3 mb-4">
          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{backgroundColor: '#ef4444'}}>
              <i className="fas fa-times text-white"></i>
            </div>
            <div className={styles.kpiContent}>
              <h4 className={styles.kpiValue}>{summary.rejected.toLocaleString()}</h4>
              <p className={styles.kpiTitle}>Rechazadas</p>
              <small className={styles.kpiSubtitle}>Solicitudes rechazadas</small>
            </div>
          </div>
        </div>

        {/* Rendimiento Vendedores */}
        <div className="col-lg-3 mb-4">
          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{backgroundColor: '#FFC862'}}>
              <i className="fas fa-users text-white"></i>
            </div>
            <div className={styles.kpiContent}>
              <h4 className={styles.kpiValue}>{vendors_performance.length}</h4>
              <p className={styles.kpiTitle}>Vendedores Activos</p>
              <small className={styles.kpiSubtitle}>Total de vendedores</small>
            </div>
          </div>
        </div>

        {/* Procesadores Activos */}
        <div className="col-lg-3 mb-4">
          <div className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{backgroundColor: '#1B2559'}}>
              <i className="fas fa-cogs text-white"></i>
            </div>
            <div className={styles.kpiContent}>
              <h4 className={styles.kpiValue}>{processors_workload.length}</h4>
              <p className={styles.kpiTitle}>Procesadores</p>
              <small className={styles.kpiSubtitle}>Total de procesadores</small>
            </div>
          </div>
        </div>
      </div>

      {/* Quinta fila - Gráficos de rendimiento */}
      <div className="row mb-4">
        {/* Rendimiento de Vendedores */}
        <div className="col-lg-6 mb-4">
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h5 className={styles.chartTitle}>
                <i className="fas fa-chart-bar me-2" style={{color: '#FFC862'}}></i>
                Rendimiento de Vendedores
              </h5>
              <p className={styles.chartSubtitle}>Tasa de aprobación por vendedor</p>
            </div>
            <div className={styles.performanceChart}>
              {vendors_performance.slice(0, 8).map((vendor, index) => (
                <div key={vendor.id} className={styles.performanceBar}>
                  <div className={styles.barLabel}>{vendor.name?.substring(0, 15) || 'Vendedor ' + (index + 1)}</div>
                  <div className={styles.barContainer}>
                    <div 
                      className={styles.bar} 
                      style={{
                        height: `${Math.min((vendor.approval_rate || 0) * 2, 100)}px`,
                        backgroundColor: index % 2 === 0 ? '#FFC862' : '#1B2559'
                      }}
                    >
                      {vendor.approval_rate || 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Carga de Trabajo Procesadores */}
        <div className="col-lg-6 mb-4">
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h5 className={styles.chartTitle}>
                <i className="fas fa-chart-bar me-2" style={{color: '#1B2559'}}></i>
                Carga de Trabajo Procesadores
              </h5>
              <p className={styles.chartSubtitle}>Asignaciones activas por procesador</p>
            </div>
            <div className={styles.performanceChart}>
              {processors_workload.slice(0, 8).map((processor, index) => (
                <div key={processor.id} className={styles.performanceBar}>
                  <div className={styles.barLabel}>{processor.name?.substring(0, 15) || 'Procesador ' + (index + 1)}</div>
                  <div className={styles.barContainer}>
                    <div 
                      className={styles.bar} 
                      style={{
                        height: `${Math.min((processor.active_assignments || 0) * 10, 100)}px`,
                        backgroundColor: index % 2 === 0 ? '#1B2559' : '#FFC862'
                      }}
                    >
                      {processor.active_assignments || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline de Vendedores - Mantener funcionalidad existente */}
      <div className="row mb-4">
        <div className="col-12">
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h5 className="card-title mb-0 fw-bold my_title_color">
                <i className="fas fa-project-diagram me-2"></i>
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
                        <i className="fas fa-chart-line me-2" style={{color: '#FFC862'}}></i>
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
                        <i className="fas fa-chart-line me-2" style={{color: '#1B2559'}}></i>
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
                        <i className="fas fa-chart-line me-2" style={{color: '#2c3e50'}}></i>
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

      {/* Línea de tiempo de la solicitud seleccionada - Mantener funcionalidad existente */}
      {selectedRequest && timeline.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h5 className="card-title mb-0 fw-bold my_title_color">
                  <i className="fas fa-clock me-2"></i>
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