import React, { useState, useEffect } from 'react';
import styles from './style.module.css';
import { 
  getDocumentObservations,
  createDocumentObservation,
  deleteDocumentObservation
} from '../../Api/documents';

const DocumentObservations = ({ documentId, requestId, requestType }) => {
  const [observations, setObservations] = useState([]);
  const [newObservation, setNewObservation] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && documentId) {
      fetchObservations();
    }
  }, [isOpen, documentId]);

  const fetchObservations = async () => {
    try {
      setLoading(true);
      const data = await getDocumentObservations(documentId);
      setObservations(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar observaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddObservation = async () => {
    if (!newObservation.trim()) return;

    try {
      setLoading(true);
      const observation = await createDocumentObservation({
        status: "PENDIENTE_REVISION",
        comment: newObservation,
        document_id: documentId,
        user_id: user.id // Asumiendo que tenemos acceso al objeto user
      });
      setObservations([...observations, observation]);
      setNewObservation('');
      setError(null);
    } catch (err) {
      setError('Error al agregar observación');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteObservation = async (observationId) => {
    try {
      setLoading(true);
      await deleteDocumentObservation(observationId);
      setObservations(observations.filter(obs => obs.id !== observationId));
      setError(null);
    } catch (err) {
      setError('Error al eliminar observación');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        {observations.length > 0 ? `Observaciones (${observations.length})` : 'Observación'}
      </button>

      {isOpen && (
        <div className={styles.observationsPanel}>
          <div className={styles.observationsList}>
            {loading && observations.length === 0 ? (
              <p>Cargando observaciones...</p>
            ) : observations.length === 0 ? (
              <p>No hay observaciones</p>
            ) : (
              observations.map(obs => (
                <div key={obs.id} className={styles.observationItem}>
                      <p>{obs.comment}</p>
                      <small>
                        Estado: {obs.status.replace('_', ' ')} | 
                        Creado: {new Date(obs.created_at).toLocaleString()}
                      </small>
                  {obs.status === 'active' && (
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDeleteObservation(obs.id)}
                      disabled={loading}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className={styles.newObservation}>
            <textarea
              className={styles.observationInput}
              value={newObservation}
              onChange={(e) => setNewObservation(e.target.value)}
              placeholder="Escribe una nueva observación..."
              disabled={loading}
            />
            <button
              className={styles.addButton}
              onClick={handleAddObservation}
              disabled={!newObservation.trim() || loading}
            >
              Agregar Observación
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentObservations;
