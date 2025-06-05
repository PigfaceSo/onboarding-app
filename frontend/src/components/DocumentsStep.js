import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DocumentsStep = ({ villaId }) => {
  const [documents, setDocuments] = useState([]);
  const [uploadingStates, setUploadingStates] = useState({}); // Store uploading state per document type
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  // From user spec (Section 9)
  const requiredDocumentConfigs = [
    { type: 'contract', name: 'Property Contract', required: true, description: 'Signed property management agreement or title deed.' },
    { type: 'insurance', name: 'Insurance Certificate', required: true, description: 'Valid property insurance policy.' },
    { type: 'inventory', name: 'Inventory List', required: false, description: 'Detailed list of villa inventory (if available).' },
    { type: 'utilities', name: 'Utilities Information', required: false, description: 'Details of utility accounts (electricity, water, internet).' },
    { type: 'emergency', name: 'Emergency Contacts', required: true, description: 'List of emergency contact numbers for the property.' },
    { type: 'house_rules', name: 'House Rules', required: false, description: 'Guest house rules document.' },
  ];

  const fetchDocuments = useCallback(async () => {
    if (!villaId) return;
    try {
      const response = await axios.get(`${API_URL}/villas/${villaId}/documents`);
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again.');
    }
  }, [villaId, API_URL]);

  useEffect(() => {
    if (villaId) {
      fetchDocuments();
    }
  }, [villaId, fetchDocuments]);

  const handleFileUpload = async (documentType, file, isRequired) => {
    if (!file) return;
    if (!villaId) {
      alert('Villa ID is not available. Cannot upload document.');
      return;
    }

    setUploadingStates(prev => ({ ...prev, [documentType]: true }));
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    // Description from config, or allow user to add more specific one if UI supports
    const docConfig = requiredDocumentConfigs.find(d => d.type === documentType);
    formData.append('description', docConfig?.name || documentType);
    formData.append('is_required', isRequired);
    // formData.append('uploaded_by', 'current_user_id'); // Placeholder for user tracking

    try {
      await axios.post(`${API_URL}/villas/${villaId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchDocuments(); // Refresh the documents list
      alert(`${docConfig?.name || documentType} uploaded successfully!`);
    } catch (err) {
      console.error(`Error uploading ${documentType}:`, err);
      const errorMsg = err.response?.data?.error || `Failed to upload ${docConfig?.name || documentType}.`;
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setUploadingStates(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const getDocumentStatus = (documentType) => {
    return documents.find(doc => doc.document_type === documentType);
  };

  if (!villaId) return <p>Please complete previous steps to get a Villa ID for document uploads.</p>;

  return (
    <div className="documents-step">
      <h2>Documents Upload</h2>
      <p>Please upload the required documents for villa onboarding. Required documents are marked with <span className="required">*</span>.</p>
      {error && <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>{error}</p>}
      
      <div className="documents-list-upload">
        {requiredDocumentConfigs.map(docConfig => {
          const uploadedDoc = getDocumentStatus(docConfig.type);
          const isUploading = uploadingStates[docConfig.type];
          
          return (
            <div key={docConfig.type} className={`document-upload-item ${uploadedDoc ? 'uploaded' : ''}`}>
              <div className="document-item-info">
                <h4>{docConfig.name} {docConfig.required && <span className="required">*</span>}</h4>
                <p className="document-item-description">{docConfig.description}</p>
                {uploadedDoc && (
                  <div className="uploaded-file-details">
                    <span className="file-name-display">✓ {uploadedDoc.file_name}</span>
                    <span className="upload-date-display">
                      (Uploaded: {new Date(uploadedDoc.uploaded_at).toLocaleDateString()})
                    </span>
                  </div>
                )}
              </div>
              
              <div className="upload-action-area">
                <input
                  type="file"
                  id={`file-${docConfig.type}`}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xls,.xlsx"
                  onChange={(e) => handleFileUpload(docConfig.type, e.target.files[0], docConfig.required)}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
                <label htmlFor={`file-${docConfig.type}`} className={`btn ${uploadedDoc ? 'btn-secondary' : 'btn-primary'} upload-label`} disabled={isUploading}>
                  {isUploading ? 'Uploading...' : (uploadedDoc ? 'Replace File' : 'Upload File')}
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsStep;
