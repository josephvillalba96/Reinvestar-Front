import React, { useState, useEffect } from 'react';
import styles from './style.module.css';
import Notification from '../../../components/Notification';
import { createCompany, getCompanies, updateCompany, deleteCompany } from '../../../Api/admin';
import { getTypesDocument, createTypeDocument, updateTypeDocument, deleteTypeDocument } from '../../../Api/typesDocument';
import * as emailTemplateApi from '../../../Api/emailTemplate';

const Parameters = () => {
  // Estado para el tab activo
  const [activeTab, setActiveTab] = useState('general');

  const [params, setParams] = useState({
    general: {
      defaultCurrency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeZone: 'America/New_York'
    },
    dscr: {
      minAmount: '',
      maxAmount: '',
      minRatio: ''
    },
    fixflip: {
      minAmount: '',
      maxAmount: '',
      maxLTV: ''
    },
    construction: {
      minAmount: '',
      maxAmount: '',
      maxTerm: ''
    },
    documents: {
      maxSize: '',
      allowedFormats: '',
      requiredDocs: ''
    }
  });

  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: '',
    status: true
  });
  const [editingCompany, setEditingCompany] = useState(null);
  const [loading, setLoading] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Nuevos estados para tipos de documentos
  const [documentTypes, setDocumentTypes] = useState([]);
  const [newDocumentType, setNewDocumentType] = useState({
    name: ''
  });
  const [editingDocumentType, setEditingDocumentType] = useState(null);

  // Nuevos estados para plantillas de correo
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [templateTypes, setTemplateTypes] = useState([]);
  // Modificar el estado newTemplate para que sirva también para edición
  const [templateForm, setTemplateForm] = useState({
    id: null,
    name: '',
    description: '',
    subject: '',
    content: '',
    template_type: '',
    is_active: true
  });
  const [isEditing, setIsEditing] = useState(false);

  // Estado para el modal de preview
  const [previewModal, setPreviewModal] = useState({
    show: false,
    data: null
  });

  const resetTemplateForm = () => {
    setTemplateForm({
      id: null,
      name: '',
      description: '',
      subject: '',
      content: '',
      template_type: '',
      is_active: true
    });
    setIsEditing(false);
  };

  useEffect(() => {
    loadCompanies();
    loadDocumentTypes();
    loadEmailTemplates();
    loadTemplateTypes();
    const savedParams = localStorage.getItem('appParameters');
    if (savedParams) {
      setParams(JSON.parse(savedParams));
    }
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      setNotification({
        show: true,
        message: 'Error al cargar empresas: ' + error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      setLoading(true);
      const data = await getTypesDocument();
      // Manejar la nueva estructura de datos con items, total, page, etc.
      if (data && data.items && Array.isArray(data.items)) {
        setDocumentTypes(data.items);
      } else if (Array.isArray(data)) {
        setDocumentTypes(data);
      } else {
        setDocumentTypes([]);
      }
    } catch (error) {
      setNotification({
        show: true,
        message: 'Error al cargar tipos de documentos: ' + error.message,
        type: 'error'
      });
      setDocumentTypes([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const loadEmailTemplates = async () => {
    try {
      setLoading(true);
      const data = await emailTemplateApi.getEmailTemplates();
      // Asegurar que data sea siempre un array
      setEmailTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotification({
        show: true,
        message: 'Error al cargar plantillas de correo: ' + error.message,
        type: 'error'
      });
      setEmailTemplates([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateTypes = async () => {
    try {
      const types = await emailTemplateApi.getAvailableTemplateTypes();
      // Asegurar que types sea siempre un array
      setTemplateTypes(Array.isArray(types) ? types : []);
    } catch (error) {
      console.error('Error cargando tipos de plantillas:', error);
      setTemplateTypes([]); // Establecer array vacío en caso de error
    }
  };

  const handleChange = (section, field, value) => {
    setParams(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    localStorage.setItem('appParameters', JSON.stringify(params));
    setNotification({
      show: true,
      message: 'Parámetros guardados correctamente',
      type: 'success'
    });
  };

  const handleCancel = () => {
    const savedParams = localStorage.getItem('appParameters');
    if (savedParams) {
      setParams(JSON.parse(savedParams));
    }
    setNotification({
      show: true,
      message: 'Cambios descartados',
      type: 'info'
    });
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createCompany(newCompany);
      setNotification({
        show: true,
        message: 'Empresa creada exitosamente',
        type: 'success'
      });
      setNewCompany({ name: '', description: '', status: true });
      loadCompanies();
    } catch (error) {
      setNotification({
        show: true,
        message: 'Error al crear empresa: ' + error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = async (companyId) => {
    try {
      setLoading(true);
      await updateCompany(companyId, editingCompany);
      setNotification({
        show: true,
        message: 'Empresa actualizada exitosamente',
        type: 'success'
      });
      setEditingCompany(null);
      loadCompanies();
    } catch (error) {
      setNotification({
        show: true,
        message: 'Error al actualizar empresa: ' + error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('¿Está seguro de eliminar esta empresa?')) return;
    try {
      setLoading(true);
      await deleteCompany(companyId);
      setNotification({
        show: true,
        message: 'Empresa eliminada exitosamente',
        type: 'success'
      });
      loadCompanies();
    } catch (error) {
      setNotification({
        show: true,
        message: 'Error al eliminar empresa: ' + error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocumentType = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createTypeDocument(newDocumentType);
      setNotification({
        show: true,
        message: 'Tipo de documento creado exitosamente',
        type: 'success'
      });
      setNewDocumentType({ name: '' });
      loadDocumentTypes();
    } catch (error) {
      setNotification({
        show: true,
        message: 'Error al crear tipo de documento: ' + error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDocumentType = async (typeId) => {
    try {
      setLoading(true);
      // Solo enviar el campo name que es el que está disponible
      const updateData = { name: editingDocumentType.name };
      await updateTypeDocument(typeId, updateData);
      setNotification({
        show: true,
        message: 'Tipo de documento actualizado exitosamente',
        type: 'success'
      });
      setEditingDocumentType(null);
      loadDocumentTypes();
    } catch (error) {
      setNotification({
        show: true,
        message: 'Error al actualizar tipo de documento: ' + error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocumentType = async (typeId) => {
    if (!window.confirm('¿Está seguro de eliminar este tipo de documento?')) return;
    try {
      setLoading(true);
      await deleteTypeDocument(typeId);
      setNotification({
        show: true,
        message: 'Tipo de documento eliminado exitosamente',
        type: 'success'
      });
      loadDocumentTypes();
    } catch (error) {
      setNotification({
        show: true,
        message: 'Error al eliminar tipo de documento: ' + error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateTemplate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditing) {
        await emailTemplateApi.updateEmailTemplate(templateForm.id, templateForm);
        setNotification({
          show: true,
          message: 'Plantilla de correo actualizada exitosamente',
          type: 'success'
        });
      } else {
        await emailTemplateApi.createEmailTemplate(templateForm);
        setNotification({
          show: true,
          message: 'Plantilla de correo creada exitosamente',
          type: 'success'
        });
      }
      resetTemplateForm();
      loadEmailTemplates();
    } catch (error) {
      setNotification({
        show: true,
        message: `Error al ${isEditing ? 'actualizar' : 'crear'} plantilla: ${error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template) => {
    setTemplateForm({
      id: template.id,
      name: template.name,
      description: template.description,
      subject: template.subject,
      content: template.content,
      template_type: template.template_type,
      is_active: template.is_active
    });
    setIsEditing(true);
    // Hacer scroll al formulario
    document.querySelector('#templateForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePreviewTemplate = async (template) => {
    try {
      const preview = await emailTemplateApi.previewTemplateEmail({
        template_id: template.id,
        variables: {} // Aquí podrías agregar variables de ejemplo
      });
      
      // Mostrar el preview en el modal
      setPreviewModal({
        show: true,
        data: {
          templateName: template.name,
          subject: preview.subject,
          content: preview.content,
          variablesUsed: preview.variables_used || []
        }
      });
      
    } catch (error) {
      setNotification({
        show: true,
        message: 'Error al generar preview: ' + error.message,
        type: 'error'
      });
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('¿Está seguro de eliminar esta plantilla de correo?')) return;
    try {
      setLoading(true);
      await emailTemplateApi.deleteEmailTemplate(templateId);
      setNotification({
        show: true,
        message: 'Plantilla de correo eliminada exitosamente',
        type: 'success'
      });
      loadEmailTemplates();
    } catch (error) {
      setNotification({
        show: true,
        message: 'Error al eliminar plantilla de correo: ' + error.message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para renderizar el contenido de cada tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <section className={styles.section}>
            <h1 className={styles.mainTitle}>Parámetros Generales</h1>
          <div className={styles.parameterGroup}>
              <div className={styles.parameterItem}>
                <label>Moneda por defecto:</label>
                <input 
                  type="text" 
                  className={styles.input}
                  value={params.general.defaultCurrency}
                  onChange={(e) => handleChange('general', 'defaultCurrency', e.target.value)}
                />
              </div>
              <div className={styles.parameterItem}>
                <label>Formato de fecha:</label>
                <input 
                  type="text" 
                  className={styles.input}
                  value={params.general.dateFormat}
                  onChange={(e) => handleChange('general', 'dateFormat', e.target.value)}
                />
              </div>
              <div className={styles.parameterItem}>
                <label>Zona horaria:</label>
                <input 
                  type="text" 
                  className={styles.input}
                  value={params.general.timeZone}
                  onChange={(e) => handleChange('general', 'timeZone', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.parameterGroup}>
              <h2 className={styles.sectionTitle}>DSCR</h2>
            <div className={styles.parameterItem}>
              <label>Monto mínimo:</label>
              <input 
                type="number" 
                className={styles.input}
                value={params.dscr.minAmount}
                onChange={(e) => handleChange('dscr', 'minAmount', e.target.value)}
              />
            </div>
            <div className={styles.parameterItem}>
              <label>Monto máximo:</label>
              <input 
                type="number" 
                className={styles.input}
                value={params.dscr.maxAmount}
                onChange={(e) => handleChange('dscr', 'maxAmount', e.target.value)}
              />
            </div>
            <div className={styles.parameterItem}>
              <label>Ratio DSCR mínimo:</label>
              <input 
                type="number" 
                step="0.01" 
                className={styles.input}
                value={params.dscr.minRatio}
                onChange={(e) => handleChange('dscr', 'minRatio', e.target.value)}
              />
          </div>
        </div>

            <div className={styles.parameterGroup}>
          <h2 className={styles.sectionTitle}>Fixflip</h2>
            <div className={styles.parameterItem}>
              <label>Monto mínimo:</label>
              <input 
                type="number" 
                className={styles.input}
                value={params.fixflip.minAmount}
                onChange={(e) => handleChange('fixflip', 'minAmount', e.target.value)}
              />
            </div>
            <div className={styles.parameterItem}>
              <label>Monto máximo:</label>
              <input 
                type="number" 
                className={styles.input}
                value={params.fixflip.maxAmount}
                onChange={(e) => handleChange('fixflip', 'maxAmount', e.target.value)}
              />
            </div>
            <div className={styles.parameterItem}>
              <label>LTV máximo (%):</label>
              <input 
                type="number" 
                className={styles.input}
                value={params.fixflip.maxLTV}
                onChange={(e) => handleChange('fixflip', 'maxLTV', e.target.value)}
              />
          </div>
        </div>

            <div className={styles.parameterGroup}>
          <h2 className={styles.sectionTitle}>Construction</h2>
            <div className={styles.parameterItem}>
              <label>Monto mínimo:</label>
              <input 
                type="number" 
                className={styles.input}
                value={params.construction.minAmount}
                onChange={(e) => handleChange('construction', 'minAmount', e.target.value)}
              />
            </div>
            <div className={styles.parameterItem}>
              <label>Monto máximo:</label>
              <input 
                type="number" 
                className={styles.input}
                value={params.construction.maxAmount}
                onChange={(e) => handleChange('construction', 'maxAmount', e.target.value)}
              />
            </div>
            <div className={styles.parameterItem}>
              <label>Plazo máximo (meses):</label>
              <input 
                type="number" 
                className={styles.input}
                value={params.construction.maxTerm}
                onChange={(e) => handleChange('construction', 'maxTerm', e.target.value)}
              />
          </div>
        </div>

            <div className={styles.parameterGroup}>
          <h2 className={styles.sectionTitle}>Documentos</h2>
            <div className={styles.parameterItem}>
              <label>Tamaño máximo (MB):</label>
                <input 
                  type="number" 
                  className={styles.input}
                  value={params.documents.maxSize}
                  onChange={(e) => handleChange('documents', 'maxSize', e.target.value)}
                />
            </div>
            <div className={styles.parameterItem}>
              <label>Formatos permitidos:</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Ej: .pdf, .jpg, .png"
                  value={params.documents.allowedFormats}
                  onChange={(e) => handleChange('documents', 'allowedFormats', e.target.value)}
                />
            </div>
            <div className={styles.parameterItem}>
              <label>Documentos obligatorios:</label>
                <textarea 
                  className={styles.textarea} 
                  placeholder="Lista separada por comas"
                  value={params.documents.requiredDocs}
                  onChange={(e) => handleChange('documents', 'requiredDocs', e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.saveButton} onClick={handleSave}>Guardar Cambios</button>
              <button className={styles.cancelButton} onClick={handleCancel}>Cancelar</button>
            </div>
          </section>
        );

      case 'companies':
        return (
          <section className={styles.section}>
            <h1 className={styles.mainTitle}>Empresas</h1>
            
            {/* Formulario para crear nueva empresa */}
            <form onSubmit={handleCreateCompany} className={styles.companyForm}>
              <h3>Crear Nueva Empresa</h3>
              <div className={styles.formGroup}>
                <label>Nombre:</label>
                <input
                  type="text"
                  className={styles.input}
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Descripción:</label>
                <textarea
                  className={styles.textarea}
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({...newCompany, description: e.target.value})}
                  required
                ></textarea>
              </div>
              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? 'Creando...' : 'Crear Empresa'}
              </button>
            </form>

            {/* Lista de empresas */}
            <div className={styles.companiesList}>
              <h3>Empresas Existentes</h3>
              {loading ? (
                <p>Cargando empresas...</p>
              ) : (
                <table className={styles.companyTable}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(companies) && companies.map(company => (
                      <tr key={company.id}>
                        <td>
                          {editingCompany?.id === company.id ? (
                            <input
                              type="text"
                              className={styles.input}
                              value={editingCompany.name}
                              onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})}
                            />
                          ) : (
                            company.name
                          )}
                        </td>
                        <td>
                          {editingCompany?.id === company.id ? (
                            <textarea
                              className={styles.textarea}
                              value={editingCompany.description}
                              onChange={(e) => setEditingCompany({...editingCompany, description: e.target.value})}
                            ></textarea>
                          ) : (
                            company.description
                          )}
                        </td>
                        <td>{company.status ? 'Activo' : 'Inactivo'}</td>
                        <td>
                          {editingCompany?.id === company.id ? (
                            <>
                              <button
                                className={styles.saveButton}
                                onClick={() => handleUpdateCompany(company.id)}
                                disabled={loading}
                              >
                                Guardar
                              </button>
                              <button
                                className={styles.cancelButton}
                                onClick={() => setEditingCompany(null)}
                                disabled={loading}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className={styles.editButton}
                                onClick={() => setEditingCompany(company)}
                                disabled={loading}
                              >
                                Editar
                              </button>
                              <button
                                className={styles.deleteButton}
                                onClick={() => handleDeleteCompany(company.id)}
                                disabled={loading}
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        );

      case 'documents':
        return (
          <section className={styles.section}>
            <h1 className={styles.mainTitle}>Tipos de Documentos</h1>
            
            {/* Formulario para crear nuevo tipo de documento */}
            <form onSubmit={handleCreateDocumentType} className={styles.companyForm}>
              <h3>Crear Nuevo Tipo de Documento</h3>
              <div className={styles.formGroup}>
                <label>Nombre:</label>
                <input
                  type="text"
                  className={styles.input}
                  value={newDocumentType.name}
                  onChange={(e) => setNewDocumentType({...newDocumentType, name: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? 'Creando...' : 'Crear Tipo de Documento'}
              </button>
            </form>

            {/* Lista de tipos de documentos */}
            <div className={styles.companiesList}>
              <h3>Tipos de Documentos Existentes</h3>
              {loading ? (
                <p>Cargando tipos de documentos...</p>
              ) : (
                <table className={styles.companyTable}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Fecha de Creación</th>
                      <th>Fecha de Actualización</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(documentTypes) && documentTypes.map(type => (
                      <tr key={type.id}>
                        <td>{type.id}</td>
                        <td>
                          {editingDocumentType?.id === type.id ? (
                            <input
                              type="text"
                              className={styles.input}
                              value={editingDocumentType.name}
                              onChange={(e) => setEditingDocumentType({...editingDocumentType, name: e.target.value})}
                            />
                          ) : (
                            type.name
                          )}
                        </td>
                        <td>{type.created_at ? new Date(type.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td>{type.updated_at ? new Date(type.updated_at).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          {editingDocumentType?.id === type.id ? (
                            <>
                              <button
                                className={styles.saveButton}
                                onClick={() => handleUpdateDocumentType(type.id)}
                                disabled={loading}
                              >
                                Guardar
                              </button>
                              <button
                                className={styles.cancelButton}
                                onClick={() => setEditingDocumentType(null)}
                                disabled={loading}
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className={styles.editButton}
                                onClick={() => setEditingDocumentType(type)}
                                disabled={loading}
                              >
                                Editar
                              </button>
                              <button
                                className={styles.deleteButton}
                                onClick={() => handleDeleteDocumentType(type.id)}
                                disabled={loading}
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        );

      case 'templates':
        return (
          <section className={styles.section}>
            <h1 className={styles.mainTitle}>Plantillas de Correo</h1>
            
            {/* Formulario para crear/editar plantilla */}
            <form id="templateForm" onSubmit={handleCreateOrUpdateTemplate} className={styles.companyForm}>
              <h3>{isEditing ? 'Editar Plantilla de Correo' : 'Crear Nueva Plantilla de Correo'}</h3>
              <div className={styles.formGroup}>
                <label>Nombre:</label>
                <input
                  type="text"
                  className={styles.input}
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tipo de Plantilla:</label>
                <select
                  className={styles.input}
                  value={templateForm.template_type}
                  onChange={(e) => setTemplateForm({...templateForm, template_type: e.target.value})}
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  {Array.isArray(templateTypes) && templateTypes.map((type, index) => (
                    <option key={index} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Asunto:</label>
                <input
                  type="text"
                  className={styles.input}
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Contenido:</label>
                <textarea
                  className={styles.textarea}
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                  required
                  rows={10}
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <label>Descripción:</label>
                <textarea
                  className={styles.textarea}
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={templateForm.is_active}
                    onChange={(e) => setTemplateForm({...templateForm, is_active: e.target.checked})}
                  />
                  Plantilla activa
                </label>
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.saveButton} disabled={loading}>
                  {loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Plantilla' : 'Crear Plantilla')}
                </button>
                {isEditing && (
                  <button 
                    type="button" 
                    className={styles.cancelButton} 
                    onClick={resetTemplateForm}
                    disabled={loading}
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>
            </form>

            {/* Lista de plantillas */}
            <div className={styles.companiesList}>
              <h3>Plantillas Existentes</h3>
              {loading ? (
                <p>Cargando plantillas...</p>
              ) : (
                <table className={styles.companyTable}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Tipo</th>
                      <th>Asunto</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(emailTemplates) && emailTemplates.map(template => (
                      <tr key={template.id}>
                        <td>{template.name}</td>
                        <td>{template.template_type}</td>
                        <td>{template.subject}</td>
                        <td>{template.description}</td>
                        <td>{template.is_active ? 'Activo' : 'Inactivo'}</td>
                        <td>
                          <button
                            className={styles.editButton}
                            onClick={() => handleEditTemplate(template)}
                            disabled={loading}
                            title="Editar"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className={styles.previewButton}
                            onClick={() => handlePreviewTemplate(template)}
                            disabled={loading}
                            title="Vista previa"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDeleteTemplate(template.id)}
                            disabled={loading}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${styles.container} internal_layout`}>
      {/* Header con tabs */}
      <div className={styles.tabsHeader}>
        <h1 className={styles.pageTitle}>Parámetros del Sistema</h1>
        
        {/* Tabs de navegación */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === 'general' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="bi bi-gear-fill me-2"></i>
            Parámetros Generales
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'companies' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            <i className="bi bi-building me-2"></i>
            Empresas
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'documents' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            Tipos de Documentos
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'templates' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <i className="bi bi-envelope me-2"></i>
            Plantillas de Correo
          </button>
        </div>
      </div>

      {/* Contenido del tab activo */}
      <div className={styles.tabContent}>
        {renderTabContent()}
      </div>

      {notification.show && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(prev => ({...prev, show: false}))}
        />
      )}

      {/* Modal de Preview de Plantilla */}
      {previewModal.show && previewModal.data && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  📧 Preview: {previewModal.data.templateName}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setPreviewModal({ show: false, data: null })}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <h6>📝 Asunto:</h6>
                  <div className="p-2 bg-light border rounded">
                    {previewModal.data.subject}
                  </div>
                </div>
                
                <div className="mb-3">
                  <h6>📄 Contenido:</h6>
                  <div 
                    className="p-3 bg-light border rounded" 
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: previewModal.data.content }}
                  ></div>
                </div>
                
                {previewModal.data.variablesUsed.length > 0 && (
                  <div className="mb-3">
                    <h6>🔧 Variables Utilizadas:</h6>
                    <div className="p-2 bg-light border rounded">
                      {previewModal.data.variablesUsed.map((variable, index) => (
                        <span key={index} className="badge bg-primary me-1">
                          {`{${variable}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Nota:</strong> Las variables como {`{full_name}`}, {`{email}`}, etc. serán reemplazadas con datos reales cuando se envíe el correo.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setPreviewModal({ show: false, data: null })}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parameters;
