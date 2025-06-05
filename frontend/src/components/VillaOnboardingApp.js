import React, { useState, useEffect } from 'react';
import './VillaOnboardingApp.css';
import logo from '../assets/inspiring-logo.svg';

// Import actual step components
import VillaInfoStep from './VillaInfoStep';
import OwnerDetailsStep from './OwnerDetailsStep';
import FacilitiesCheckStep from './FacilitiesCheckStep';
import DocumentsStep from './DocumentsStep';
import PhotosStep from './PhotosStep';
import ReviewStep from './ReviewStep';


const VillaOnboardingApp = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const [currentStep, setCurrentStep] = useState(1);
  const [villaData, setVillaData] = useState({
    villa: {
      id: null, // Will be set after creation
      name: '',
      address: '',
      city: '',
      postal_code: '',
      bedrooms: '',
      bathrooms: '',
      max_guests: '',
      property_type: 'villa',
      onboarding_status: 'pending' // Added onboarding_status
    },
    owner: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: 'Thailand'
    }
  });

  const steps = [
    { id: 1, name: 'Villa Information', component: VillaInfoStep },
    { id: 2, name: 'Owner Details', component: OwnerDetailsStep },
    { id: 3, name: 'Facilities Check', component: FacilitiesCheckStep },
    { id: 4, name: 'Documents', component: DocumentsStep },
    { id: 5, name: 'Photos', component: PhotosStep },
    { id: 6, name: 'Review & Submit', component: ReviewStep }
  ];

  const handleUpdateVillaAndOwner = async () => {
    if (!villaData.villa.id) {
      alert('Cannot update: Villa ID is missing.');
      return false;
    }
    // Basic validation, similar to create but less strict as we're updating
    if (!villaData.villa.name || !villaData.owner.first_name || !villaData.owner.email) {
      alert('Villa name, owner first name, and email are required.');
      return false;
    }
    try {
      const response = await fetch(`${API_URL}/villas/${villaData.villa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(villaData) // Send full villaData for update
      });
      if (!response.ok) {
        const errorData = await response.json();
        // Check for specific validation error from backend (like unique email on another owner)
        if (response.status === 400 && errorData.error && errorData.error.includes('Validation error') && errorData.fields) {
            alert(`Validation Error: ${errorData.error} on field ${Object.keys(errorData.fields)[0]}`);
        } else if (errorData.error) {
            alert(`Error: ${errorData.error}`);
        } else {
            alert('Failed to update villa and owner. Status: ' + response.status);
        }
        throw new Error(errorData.error || 'Failed to update villa and owner');
      }
      const updatedVilla = await response.json();
      // Update local state with potentially updated data from backend (e.g., updatedAt timestamps)
      setVillaData(prev => ({
        ...prev,
        villa: { ...prev.villa, ...updatedVilla, onboarding_status: updatedVilla.onboarding_status || prev.villa.onboarding_status },
        // Assuming owner data might also be part of updatedVilla response if backend sends it
        owner: updatedVilla.owner ? { ...prev.owner, ...updatedVilla.owner } : prev.owner
      }));
      console.log('Villa and Owner updated:', updatedVilla);
      return true; // Indicate success
    } catch (error) {
      console.error('Error updating villa and owner:', error);
      // Alert is handled above for specific cases
      if (!error.message.includes('Failed to update villa and owner')) {
        // Avoid double alert if already handled
        alert(`Error: ${error.message}`);
      }
      return false;
    }
  };

  const handleCreateVillaAndOwner = async () => {
    if (!villaData.villa.name || !villaData.owner.first_name || !villaData.owner.email) {
      alert('Villa name, owner first name, and email are required to save progress.');
      return false;
    }
    try {
      const response = await fetch(`${API_URL}/villas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(villaData) 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create villa and owner');
      }
      const newVilla = await response.json();
      setVillaData(prev => ({
        ...prev,
        villa: { ...prev.villa, id: newVilla.id, onboarding_status: newVilla.onboarding_status || 'pending' } 
      }));
      console.log('Villa and Owner created:', newVilla);
      return newVilla.id; 
    } catch (error) {
      console.error('Error creating villa and owner:', error);
      alert(`Error: ${error.message}`);
      return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) { // After Villa Info, before Owner Details
        // Potentially save villa draft if needed, or just proceed
    }
    if (currentStep === 2) { // After Owner Details, before Facilities Check
      let success = false;
      if (villaData.villa.id) { // If villa already exists, update it
        success = await handleUpdateVillaAndOwner();
      } else { // Otherwise, create it
        const newVillaId = await handleCreateVillaAndOwner();
        if (newVillaId) {
          success = true;
        }
      }

      if (success) {
        setCurrentStep(currentStep + 1);
      } else {
        // Error messages are handled within create/update functions
        return; 
      }
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!villaData.villa.id) {
        alert("Villa data not saved yet. Please ensure villa and owner details are submitted.");
        return;
    }
    try {
        const response = await fetch(`${API_URL}/villas/${villaData.villa.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ villa: { ...villaData.villa, onboarding_status: 'completed' } })
        });
        if (!response.ok) throw new Error('Failed to complete onboarding');
        alert('Onboarding Completed Successfully!');
        setCurrentStep(1);
        setVillaData({
            villa: { id: null, name: '', address: '', city: '', postal_code: '', bedrooms: '', bathrooms: '', max_guests: '', property_type: 'villa', onboarding_status: 'pending' },
            owner: { first_name: '', last_name: '', email: '', phone: '', address: '', city: '', country: 'Thailand' }
        });
    } catch (error) {
        console.error('Error completing onboarding:', error);
        alert(`Error: ${error.message}`);
    }
  };

  const CurrentStepComponent = steps.find(step => step.id === currentStep)?.component;

  return (
    <div className="onboarding-container">
      <div className="logo-container">
        <img src={logo} alt="Inspiring Living Solutions" className="company-logo" />
        
      </div>
      
      <div className="onboarding-card">
        <div className="progress-bar">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
            >
              <div className="step-number">{step.id}</div>
              <div className="step-name">{step.name}</div>
            </div>
          ))}
        </div>

        <div className="step-content">
          {CurrentStepComponent && <CurrentStepComponent data={villaData} setData={setVillaData} villaId={villaData.villa.id} />}
        </div>

        <div className="navigation-buttons">
          {currentStep > 1 && (
            <button 
              className="btn btn-secondary"
              onClick={handlePrevious}
            >
              Previous
            </button>
          )}
          
          {currentStep < steps.length && (
            <button 
              className="btn btn-primary"
              onClick={handleNext}
            >
              Next
            </button>
          )}
          
          {currentStep === steps.length && (
            <button className="btn btn-success" onClick={handleCompleteOnboarding}>
              Complete Onboarding
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VillaOnboardingApp;
