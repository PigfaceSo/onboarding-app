import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const PhotosStep = ({ villaId }) => {
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);
  const [photoType, setPhotoType] = useState('Exterior'); // Example default type
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null); // Specific error for upload
  const [fetchError, setFetchError] = useState(null); // Specific error for fetching
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  // Define photo types (can be expanded)
  const photoTypes = [
    'Exterior', 'Living Room', 'Kitchen', 'Bedroom', 
    'Bathroom', 'Pool', 'Garden', 'View', 'Other'
  ];

  const fetchPhotos = useCallback(async () => {
    if (!villaId) return;
    try {
      // Assuming photos are stored as VillaDocuments with a specific category or naming convention
      // Or a dedicated /photos endpoint if you create one.
      // For now, we'll filter documents that are images by mime_type.
      const response = await axios.get(`${API_URL}/villas/${villaId}/documents`);
      const imageDocs = response.data.filter(doc => doc.mime_type && doc.mime_type.startsWith('image/'));
      setPhotos(imageDocs);
      setFetchError(null); // Clear previous fetch errors if successful
    } catch (err) {
      console.error('Error fetching photos:', err);
      setFetchError('Failed to load photos. Please try again.');
    }
  }, [villaId, API_URL]);

  useEffect(() => {
    if (villaId) {
        fetchPhotos();
    }
  }, [villaId, fetchPhotos]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadError(null); // Clear upload error when new file is selected
    setUploadSuccessMessage(''); // Clear success message
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a photo to upload.');
      return;
    }
    if (!villaId) {
      setUploadError('Villa ID is not available. Cannot upload photo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', `Photo - ${photoType}`); // Store with a prefix or specific type
    formData.append('description', description);
    // formData.append('uploaded_by', 'current_user_id');

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccessMessage('');

    try {
      await axios.post(`${API_URL}/villas/${villaId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFile(null);
      setPhotoType('Exterior');
      setDescription('');
      // Reset file input more reliably
      if (e.target.elements.photoFileUpload) {
        e.target.elements.photoFileUpload.value = null;
      }
      fetchPhotos(); // Refresh the list
      setUploadSuccessMessage('Photo uploaded successfully!');
    } catch (err) {
      console.error('Error uploading photo:', err);
      setUploadError(err.response?.data?.error || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!villaId) {
    return <p>Please complete previous steps to provide a Villa ID before uploading photos.</p>;
  }

  return (
    <div className="photos-step documents-step"> 
      <h2>Upload Photos</h2>
      <p>Upload high-quality photos of the villa.</p>
      
      <form onSubmit={handleUpload} className="upload-form" style={{ marginBottom: '30px' }}>
        <div className="form-group">
          <label htmlFor="photoType">Photo Category</label>
          <select 
            id="photoType" 
            value={photoType} 
            onChange={(e) => setPhotoType(e.target.value)} 
            disabled={isUploading}
          >
            {photoTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="photoFileUpload">Select Photo <span className="required">*</span></label>
          <input 
            id="photoFileUpload" 
            name="photoFileUpload" 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            required 
            disabled={isUploading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="photoDescription">Description/Caption</label>
          <textarea 
            id="photoDescription" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Optional: Add a caption for this photo"
            rows={2}
            disabled={isUploading}
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={isUploading || !file}>
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </button>
        {uploadSuccessMessage && <p style={{ color: 'green', marginTop: '10px' }}>{uploadSuccessMessage}</p>}
        {uploadError && <p style={{ color: 'red', marginTop: '10px' }}>{uploadError}</p>}
      </form>

      <h3>Uploaded Photos</h3>
      {fetchError && <p style={{ color: 'red' }}>Error loading photos: {fetchError}</p>}
      {!fetchError && photos.length === 0 && (
        <p>No photos uploaded yet for this villa.</p>
      )}
      {!fetchError && photos.length > 0 && (
        <div className="documents-list photos-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {photos.map(photo => (
            <div key={photo.id} className="document-item photo-item" style={{ width: 'calc(33.333% - 10px)', flexDirection: 'column' }}>
              <img 
                src={`${API_URL}/${photo.file_path}`.replace(/\\/g, '/')}
                alt={photo.description || photo.document_type} 
                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} 
              />
              <div className="document-info" style={{ textAlign: 'center' }}>
                <h4 style={{fontSize: '0.9em'}}>{photo.document_type.replace('Photo - ', '')}</h4>
                {photo.description && <p style={{fontSize: '0.8em', color: '#555'}}>{photo.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotosStep;
