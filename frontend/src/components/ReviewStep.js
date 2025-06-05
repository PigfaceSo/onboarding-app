import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ReviewStep = ({ data, villaId }) => {
  const [fullVillaData, setFullVillaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  const fetchFullVillaData = useCallback(async () => {
    if (!villaId) {
      // Use data from props if villaId is not available (e.g., before first save)
      // This is a fallback; ideally, review step is active only with a villaId.
      setFullVillaData(data);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/villas/${villaId}/onboarding`);
      setFullVillaData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching full villa data for review:', err);
      setError('Failed to load complete villa data for review. Please ensure previous steps are saved.');
    } finally {
      setLoading(false);
    }
  }, [villaId, API_URL, data]);

  useEffect(() => {
    fetchFullVillaData();
  }, [fetchFullVillaData]);

  if (loading) return <p>Loading review data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!fullVillaData) return <p>No data available for review. Please complete previous steps.</p>;

  // Prioritize fetched data if villaId was present, otherwise use prop data
  const sourceData = villaId && fullVillaData?.villa ? fullVillaData : data;

  const { villa, owner, checklistItems, documents: allDocuments, progressSteps } = sourceData || {};

  const generalDocuments = allDocuments?.filter(doc => !(doc.mime_type && doc.mime_type.startsWith('image/'))) || [];
  const uploadedPhotos = allDocuments?.filter(doc => doc.mime_type && doc.mime_type.startsWith('image/')) || [];

  return (
    <div className="review-step" style={{padding: '10px'}}>
      <h2>Review Onboarding Information</h2>
      <p>Please review all the information below before completing the onboarding process.</p>

      {villa && (
        <div className="review-section">
          <h3>Villa Details</h3>
          <p><strong>Name:</strong> {villa.name || 'N/A'}</p>
          <p><strong>Address:</strong> {`${villa.address || ''}, ${villa.city || ''}, ${villa.postal_code || ''}`.replace(/^, |, $/g, '') || 'N/A'}</p>
          <p><strong>Type:</strong> {villa.property_type || 'N/A'}</p>
          <p><strong>Specs:</strong> {villa.bedrooms || 'N/A'} bed, {villa.bathrooms || 'N/A'} bath, Max {villa.max_guests || 'N/A'} guests</p>
          <p><strong>Onboarding Status:</strong> <span style={{fontWeight: 'bold', color: villa.onboarding_status === 'completed' ? 'green' : (villa.onboarding_status === 'pending' ? 'orange' : 'grey')}}>{villa.onboarding_status || 'Unknown'}</span></p>
        </div>
      )}

      {owner && (
        <div className="review-section">
          <h3>Owner Details</h3>
          <p><strong>Name:</strong> {owner.first_name || ''} {owner.last_name || ''}</p>
          <p><strong>Email:</strong> {owner.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {owner.phone || 'N/A'}</p>
          <p><strong>Address:</strong> {`${owner.address || ''}, ${owner.city || ''}, ${owner.country || ''}`.replace(/^, |, $/g, '') || 'N/A'}</p>
        </div>
      )}

      {checklistItems && checklistItems.length > 0 && (
        <div className="review-section">
          <h3>Facilities Checklist Summary</h3>
          <p>{checklistItems.filter(item => item.is_present).length} items marked as Present.</p>
          <p>{checklistItems.filter(item => !item.is_present && item.item_id).length} items marked as Missing (or not yet checked).</p>
          {/* Consider listing items with notes or missing items for more detail */}
        </div>
      )}

      {generalDocuments.length > 0 && (
        <div className="review-section">
          <h3>Uploaded Documents</h3>
          <ul>
            {generalDocuments.map(doc => (
              <li key={doc.id}>{doc.document_type || 'Document'} - {doc.file_name || 'N/A'}</li>
            ))}
          </ul>
        </div>
      )}

      {uploadedPhotos.length > 0 && (
        <div className="review-section">
          <h3>Uploaded Photos</h3>
          <div className="photos-list-review" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {uploadedPhotos.map(photo => (
              <div key={photo.id} className="photo-item-review" style={{ width: 'calc(25% - 10px)', textAlign: 'center' }}>
                <img 
                  src={`${API_URL}/${photo.file_path}`.replace(/\\/g, '/')}
                  alt={photo.description || photo.document_type}
                  style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '5px' }}
                />
                <p style={{fontSize: '0.8em', margin: 0}}>{(photo.document_type || 'Photo').replace('Photo - ', '')}</p>
                {photo.description && <p style={{fontSize: '0.7em', color: '#555', margin: 0}}>{photo.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {progressSteps && progressSteps.length > 0 && (
         <div className="review-section">
            <h3>Onboarding Progress</h3>
            <ul>
                {progressSteps.map(step => (
                    <li key={step.id} style={{ color: step.status === 'completed' ? 'green' : (step.status === 'pending' ? 'orange' : 'grey') }}>
                        {step.step_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: {step.status}
                        {step.completed_at && ` (Completed: ${new Date(step.completed_at).toLocaleDateString()})`}
                    </li>
                ))}
            </ul>
         </div>
      )}

      <p style={{marginTop: '20px', fontWeight: 'bold'}}>
        If all information is correct, proceed to complete the onboarding.
      </p>
    </div>
  );
};

export default ReviewStep;
