import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './FacilitiesCheckStep.css';

const FacilitiesCheckStep = ({ villaId }) => {
  const [categories, setCategories] = useState([]);
  const [villaChecklistItems, setVillaChecklistItems] = useState({}); // Store as a map: { [itemId]: { is_present: boolean, notes: string } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({ steps: [] });

  // Ensure we're using the correct API URL everywhere
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  console.log('Using API URL:', API_URL);

  const fetchFacilitiesData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDebugInfo({ steps: [] });
    const debug = { steps: [] };
    
    try {
      // Fetch categories and items (master list)
      debug.steps.push('Starting API request to fetch categories');
      console.log(`Fetching categories from: ${API_URL}/items`);
      
      const categoriesResponse = await axios.get(`${API_URL}/items`, { 
        timeout: 10000, // 10 second timeout
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      debug.steps.push('Categories API response received');
      debug.categoriesStatus = categoriesResponse.status;
      debug.categoriesData = categoriesResponse.data;
      
      console.log('Categories API response:', categoriesResponse.data);
      
      // Check if we got a valid response with categories
      if (!Array.isArray(categoriesResponse.data) || categoriesResponse.data.length === 0) {
        debug.steps.push('Warning: No categories found in response');
        console.warn('No categories found in response:', categoriesResponse.data);
        // Create a default category if needed
        setCategories([{ 
          id: 'default',
          name: 'General Facilities', 
          items: [] 
        }]);
      } else {
        setCategories(categoriesResponse.data);
      }

      // Fetch existing checklist data for this villa if villaId is present
      if (villaId) {
        debug.steps.push(`Fetching villa data for villaId: ${villaId}`);
        console.log(`Fetching villa data from: ${API_URL}/villas/${villaId}/onboarding`);
        
        const checklistResponse = await axios.get(`${API_URL}/villas/${villaId}/onboarding`, {
          timeout: 10000 // 10 second timeout
        });
        
        debug.steps.push('Villa data response received');
        debug.villaDataStatus = checklistResponse.status;
        
        const itemsLookup = {};
        // Ensure checklistItems is an array and exists
        if (checklistResponse.data && Array.isArray(checklistResponse.data.checklistItems)) {
          debug.steps.push(`Processing ${checklistResponse.data.checklistItems.length} checklist items`);
          checklistResponse.data.checklistItems.forEach(item => {
            itemsLookup[item.item_id] = {
              is_present: item.is_present,
              notes: item.notes || '' // Ensure notes is always a string
            };
          });
        } else {
          debug.steps.push('Warning: No valid checklistItems found in villa data');
          console.warn('No valid checklistItems found in villa data:', checklistResponse.data);
        }
        setVillaChecklistItems(itemsLookup);
      }
      
      setDebugInfo(debug);
      setLoading(false);
    } catch (err) {
      debug.steps.push(`Error: ${err.message || 'Unknown error'}`);
      if (err.response) {
        // Server responded with error status
        debug.errorType = 'Response Error';
        debug.status = err.response.status;
        debug.responseData = err.response.data;
        console.error(`API error ${err.response.status}:`, err.response.data);
      } else if (err.request) {
        // Request was made but no response
        debug.errorType = 'No Response';
        debug.request = 'Request was sent but no response was received';
        console.error('No response received from API:', err.request);
      } else {
        // Error in request setup
        debug.errorType = 'Request Setup Error';
        debug.message = err.message;
        console.error('Error setting up request:', err.message);
      }
      
      // Store the debug info for potential display
      setDebugInfo(debug);
      
      // User-friendly error message
      setError("Failed to load facilities data. Please try again.");
      setLoading(false);
    }
  }, [API_URL, villaId]);

  useEffect(() => {
    fetchFacilitiesData();
  }, [fetchFacilitiesData]);

  const handleUpdateChecklistItem = async (itemId, field, value) => {
    if (!villaId) {
      alert('Villa ID is not available. Cannot save checklist item.');
      return;
    }

    // Optimistically update local state for responsiveness
    const updatedItemData = {
      ...(villaChecklistItems[itemId] || { is_present: false, notes: '' }), // Ensure existing data or default
      [field]: value
    };
    
    setVillaChecklistItems(prev => ({
      ...prev,
      [itemId]: updatedItemData
    }));

    // Prepare payload for the backend
    const payload = {
      item_id: itemId,
      is_present: updatedItemData.is_present,
      notes: updatedItemData.notes,
      checked_by: 'Operations Team' // As per user spec document
    };

    try {
      // Save to backend
      const response = await axios.post(`${API_URL}/villas/${villaId}/checklist`, payload);
      console.log('Checklist item updated:', response.data);
      
    } catch (err) {
      console.error('Error updating checklist item:', err);
      alert('Failed to save checklist update. Please try again.');
      // Revert optimistic update if API call fails
      fetchFacilitiesData(); // Refetch to get consistent state from server
    }
  };

  const handleRetry = () => {
    fetchFacilitiesData();
  };

  return (
    <div className="facilities-check-container">
      <h2>Facilities Checklist</h2>
      
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading facilities data...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button className="retry-button" onClick={handleRetry}>Try Again</button>
          
          {/* Show debugging details in development environment */}
          {process.env.NODE_ENV !== 'production' && debugInfo && (
            <div className="debug-info">
              <h4>Debug Information</h4>
              <p>API URL: {API_URL}</p>
              <h5>Steps Completed:</h5>
              <ul>
                {debugInfo.steps && debugInfo.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
              {debugInfo.errorType && (
                <div>
                  <h5>Error Type: {debugInfo.errorType}</h5>
                  {debugInfo.status && <p>Status: {debugInfo.status}</p>}
                  {debugInfo.message && <p>Message: {debugInfo.message}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && !error && !villaId && (
        <div className="message">
          <p>Please complete the previous steps first to create a villa record.</p>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="message warning">
          <p>No facilities data found. Please make sure the backend is properly seeded with categories and items.</p>
          <button className="retry-button" onClick={handleRetry}>Refresh Data</button>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="categories-container">
          {categories.map(category => (
            <div className="facility-category" key={category.id || `cat-${category.name}`}>
              <h3>{category.name}</h3>
              {category.items && category.items.map(item => {
                const checklistItem = villaChecklistItems[item.id] || { is_present: false, notes: '' };
                
                return (
                  <div key={item.id} className="facility-item">
                    <div className="item-header">
                      <span className="item-name">{item.name}</span>
                      <button
                        className={`status-btn ${checklistItem.is_present ? 'present' : 'missing'}`}
                        onClick={() => handleUpdateChecklistItem(item.id, 'is_present', !checklistItem.is_present)}
                        disabled={!villaId}
                      >
                        {checklistItem.is_present ? 'Present' : 'Missing'}
                      </button>
                    </div>
                    
                    <textarea
                      className="item-notes"
                      placeholder="Add notes about condition, location, or issues..."
                      value={checklistItem.notes || ''}
                      onChange={(e) => handleUpdateChecklistItem(item.id, 'notes', e.target.value)}
                      rows={2}
                      disabled={!villaId}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacilitiesCheckStep;
