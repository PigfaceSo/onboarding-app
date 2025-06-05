import React from 'react';

const VillaInfoStep = ({ data, setData }) => {
  const updateVillaData = (field, value) => {
    setData(prev => ({
      ...prev,
      villa: { ...prev.villa, [field]: value }
    }));
  };

  return (
    <div className="step-form">
      <h2>Villa Information</h2>
      
      <div className="form-group">
        <label htmlFor="villaName">Villa Name <span className="required">*</span></label>
        <input
          id="villaName"
          type="text"
          value={data.villa.name}
          onChange={(e) => updateVillaData('name', e.target.value)}
          placeholder="Enter villa name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="villaAddress">Address <span className="required">*</span></label>
        <textarea
          id="villaAddress"
          value={data.villa.address}
          onChange={(e) => updateVillaData('address', e.target.value)}
          placeholder="Enter full address"
          rows={3}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="villaCity">City <span className="required">*</span></label>
          <input
            id="villaCity"
            type="text"
            value={data.villa.city}
            onChange={(e) => updateVillaData('city', e.target.value)}
            placeholder="City"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="villaPostalCode">Postal Code</label>
          <input
            id="villaPostalCode"
            type="text"
            value={data.villa.postal_code}
            onChange={(e) => updateVillaData('postal_code', e.target.value)}
            placeholder="Postal code"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="villaBedrooms">Bedrooms</label>
          <input
            id="villaBedrooms"
            type="number"
            value={data.villa.bedrooms}
            onChange={(e) => updateVillaData('bedrooms', e.target.valueAsNumber || '')}
            placeholder="e.g., 3"
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="villaBathrooms">Bathrooms</label>
          <input
            id="villaBathrooms"
            type="number"
            value={data.villa.bathrooms}
            onChange={(e) => updateVillaData('bathrooms', e.target.valueAsNumber || '')}
            placeholder="e.g., 2.5"
            min="0"
            step="0.5"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="villaMaxGuests">Max Guests</label>
          <input
            id="villaMaxGuests"
            type="number"
            value={data.villa.max_guests}
            onChange={(e) => updateVillaData('max_guests', e.target.valueAsNumber || '')}
            placeholder="e.g., 6"
            min="1"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="villaPropertyType">Property Type</label>
        <select
          id="villaPropertyType"
          value={data.villa.property_type}
          onChange={(e) => updateVillaData('property_type', e.target.value)}
        >
          <option value="villa">Villa</option>
          <option value="condo">Condominium</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="resort">Resort Unit</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );
};

export default VillaInfoStep;
