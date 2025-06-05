import React from 'react';

const OwnerDetailsStep = ({ data, setData }) => {
  const updateOwnerData = (field, value) => {
    setData(prev => ({
      ...prev,
      owner: { ...prev.owner, [field]: value }
    }));
  };

  return (
    <div className="step-form">
      <h2>Owner Details</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ownerFirstName">First Name <span className="required">*</span></label>
          <input
            id="ownerFirstName"
            type="text"
            value={data.owner.first_name}
            onChange={(e) => updateOwnerData('first_name', e.target.value)}
            placeholder="Owner's first name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="ownerLastName">Last Name</label>
          <input
            id="ownerLastName"
            type="text"
            value={data.owner.last_name}
            onChange={(e) => updateOwnerData('last_name', e.target.value)}
            placeholder="Owner's last name"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ownerEmail">Email <span className="required">*</span></label>
          <input
            id="ownerEmail"
            type="email"
            value={data.owner.email}
            onChange={(e) => updateOwnerData('email', e.target.value)}
            placeholder="Owner's email address"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="ownerPhone">Phone Number</label>
          <input
            id="ownerPhone"
            type="tel"
            value={data.owner.phone}
            onChange={(e) => updateOwnerData('phone', e.target.value)}
            placeholder="Owner's phone number"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="ownerAddress">Owner's Address</label>
        <textarea
          id="ownerAddress"
          value={data.owner.address}
          onChange={(e) => updateOwnerData('address', e.target.value)}
          placeholder="Owner's primary address"
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ownerCity">City</label>
          <input
            id="ownerCity"
            type="text"
            value={data.owner.city}
            onChange={(e) => updateOwnerData('city', e.target.value)}
            placeholder="City"
          />
        </div>
        <div className="form-group">
          <label htmlFor="ownerCountry">Country</label>
          <input
            id="ownerCountry"
            type="text"
            value={data.owner.country}
            onChange={(e) => updateOwnerData('country', e.target.value)}
            placeholder="Country"
          />
        </div>
      </div>

      <p style={{ fontSize: '0.9em', color: '#666', marginTop: '15px' }}>
        After completing this step, the villa and owner information will be saved.
      </p>

    </div>
  );
};

export default OwnerDetailsStep;
