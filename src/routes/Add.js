import React, { useRef, useEffect } from 'react'
import AddData from './AddData'
import AddMedicalData from './AddMedicalData'
import style from './AddData.module.css'
import { Card } from '@material-ui/core'

export default function Add(props) {
    const cardRef = useRef()
  const {
    patientBio,
    setPatientBio,
    addUpdatePatientBio,
    patientMedicalData,
    setPatientMedicalData,
    addUpdatePatientMedicalData,
  } = props

  useEffect(() => {
    if(cardRef.current.scrollLeft > 0)
    window.addEventListener('resize', correctPosition)
    return () => {
      window.removeEventListener('resize', correctPosition)
    }
  }, [])

  const correctPosition = () => {
    cardRef.current.scrollTo(cardRef.current.scrollWidth/2,0)
  }

  const next = () => {
    cardRef.current.scrollBy(1000000,0)
  }
  const handleBack = () => {
    console.log(cardRef.current.scrollWidth)
    cardRef.current.scrollTo(0,0)
}
  return (
    <div>
      <Card className={style.cardsContainer} ref={cardRef}>
      <AddData
        patientBio={patientBio}
        setPatientBio={(obj) => setPatientBio(obj)}
        addUpdatePatientBio={addUpdatePatientBio}
        next={next}
      />
      <AddMedicalData
        patientMedicalData={patientMedicalData}
        setPatientMedicalData={(obj) => setPatientMedicalData(obj)}
        addUpdatePatientMedicalData={addUpdatePatientMedicalData}
        handleBack={handleBack}
      />
      </Card>
    </div>
  )
}


// import React from 'react';

// const Add = ({
//   patientBio,
//   setPatientBio,
//   patientMedicalData,
//   setPatientMedicalData,
//   addUpdatePatientMedicalData
// }) => {
//   const handleChange = (e, type) => {
//     const { name, value } = e.target;
//     if (type === 'bio') {
//       setPatientBio({ ...patientBio, [name]: value });
//     } else {
//       setPatientMedicalData({ ...patientMedicalData, [name]: value });
//     }
//   };

//   return (
//     <div>
//       <h2>Add Patient Bio</h2>
//       <input name="name" value={patientBio.name} onChange={(e) => handleChange(e, 'bio')} placeholder="Name" />
//       <input name="birthDate" value={patientBio.birthDate} onChange={(e) => handleChange(e, 'bio')} placeholder="Birth Date" />
//       <input name="phoneNumber" value={patientBio.phoneNumber} onChange={(e) => handleChange(e, 'bio')} placeholder="Phone Number" />
//       <input name="_address" value={patientBio._address} onChange={(e) => handleChange(e, 'bio')} placeholder="Address" />
      
//       <h2>Add Medical Data</h2>
//       <input name="diseaseName" value={patientMedicalData.diseaseName} onChange={(e) => handleChange(e, 'medical')} placeholder="Disease Name" />
//       <input name="diseaseDescription" value={patientMedicalData.diseaseDescription} onChange={(e) => handleChange(e, 'medical')} placeholder="Description" />
//       <button onClick={addUpdatePatientMedicalData}>Save Patient Data</button>
//     </div>
//   );
// };

// export default Add;
