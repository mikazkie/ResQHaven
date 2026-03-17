import React from 'react'

function Needs() {
  return (
    <div>
      {/* ── Needs Section ── */}
                <div className='fw-semibold
                  text-muted border-bottom pb-2 mt-2'
                  style={{ fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: 1 }}
                >
                  Medical &amp; Food Needs
                </div>

                {/* ── Allergies ── */}
                <div>
                  <label className='form-label fw-medium'>
                    Allergies
                  </label>
                  <div className='d-flex gap-2 mb-2'>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='e.g. Chicken'
                      value={allergyInput}
                      onChange={(e) =>
                        setAllergyInput(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddAllergy()
                        }
                      }}
                    />
                    <button
                      type='button'
                      className='btn btn-danger flex-shrink-0'
                      onClick={handleAddAllergy}
                    >
                      + Add
                    </button>
                  </div>

                  {allergies.length > 0 && (
                    <div className='d-flex flex-column gap-1'>
                      {allergies.map(item => (
                        <ListItem
                          key={item.id}
                          item={item}
                          onRemove={handleRemoveAllergy}
                          showQty={false}
                          color={{
                            bg: '#fff1f2',
                            border: '#fecdd3',
                            remove: '#ef4444'
                          }}
                        />
                      ))}
                      <div className='text-muted mt-1'
                        style={{ fontSize: 12 }}
                      >
                        {allergies.length} allerg
                        {allergies.length > 1 ? 'ies' : 'y'} added
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Medicines ── */}
                <div>
                  <label className='form-label fw-medium'>
                    Medicine
                  </label>
                  <div className='d-flex gap-2 mb-2'>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='e.g. Bioflu'
                      value={medicineInput.name}
                      onChange={(e) => setMedicineInput({
                        ...medicineInput,
                        name: e.target.value
                      })}
                    />
                    <input
                      type='number'
                      className='form-control'
                      placeholder='Qty'
                      style={{ maxWidth: 90 }}
                      value={medicineInput.quantity}
                      min={1}
                      onChange={(e) => setMedicineInput({
                        ...medicineInput,
                        quantity: e.target.value
                      })}
                    />
                    <button
                      type='button'
                      className='btn btn-danger flex-shrink-0'
                      onClick={handleAddMedicine}
                    >
                      + Add
                    </button>
                  </div>

                  {medicines.length > 0 && (
                    <div className='d-flex flex-column gap-1'>
                      {medicines.map(item => (
                        <ListItem
                          key={item.id}
                          item={item}
                          onRemove={handleRemoveMedicine}
                          showQty={true}
                          color={{
                            bg: '#eff6ff',
                            border: '#bfdbfe',
                            badge: '#dbeafe',
                            badgeText: '#1d4ed8',
                            remove: '#3b82f6'
                          }}
                        />
                      ))}
                      <div className='text-muted mt-1'
                        style={{ fontSize: 12 }}
                      >
                        {medicines.length} medicine
                        {medicines.length > 1 ? 's' : ''} added
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Special Foods ── */}
                <div>
                  <label className='form-label fw-medium'>
                    Special Foods
                  </label>
                  <div className='d-flex gap-2 mb-2'>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='e.g. Milk'
                      value={specialInput.name}
                      onChange={(e) => setSpecialInput({
                        ...specialInput,
                        name: e.target.value
                      })}
                    />
                    <input
                      type='number'
                      className='form-control'
                      placeholder='Qty'
                      style={{ maxWidth: 90 }}
                      value={specialInput.quantity}
                      min={1}
                      onChange={(e) => setSpecialInput({
                        ...specialInput,
                        quantity: e.target.value
                      })}
                    />
                    <button
                      type='button'
                      className='btn btn-danger flex-shrink-0'
                      onClick={handleAddSpecial}
                    >
                      + Add
                    </button>
                  </div>

                  {specialFoods.length > 0 && (
                    <div className='d-flex flex-column gap-1'>
                      {specialFoods.map(item => (
                        <ListItem
                          key={item.id}
                          item={item}
                          onRemove={handleRemoveSpecial}
                          showQty={true}
                          color={{
                            bg: '#f0fdf4',
                            border: '#bbf7d0',
                            badge: '#dcfce7',
                            badgeText: '#15803d',
                            remove: '#22c55e'
                          }}
                        />
                      ))}
                      <div className='text-muted mt-1'
                        style={{ fontSize: 12 }}
                      >
                        {specialFoods.length} item
                        {specialFoods.length > 1 ? 's' : ''} added
                      </div>
                    </div>
                  )}
                </div>
    </div>
  )
}

export default Needs
