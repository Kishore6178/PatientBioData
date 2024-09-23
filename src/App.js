import { Box, Card, CardContent, Container, Paper } from '@material-ui/core'
import { useEffect, useState } from 'react'
import Web3 from 'web3'
import style from './App.module.css'
import {
  PATIENT_DATA_LIST_ADDRESS,
  PATIENT_DATA_LIST_ABI,
} from './contracts/PatientData'
import {
  SAVE_DATA_LIST_ADDRESS,
  SAVE_DATA_LIST_ABI
} from './contracts/SaveData'
import Add from './routes/Add'
import AddData from './routes/AddData'
import AddMedicalData from './routes/AddMedicalData'
import ShowData from './routes/ShowData'
import CryptoJS from 'crypto-js'
import sendToServerForSecondEncryption from './server/sendToServerForSecondEncryption'

function App() {
  // const [web3, setweb3] = useState('http://127.0.0.1:7545')
  const [account, setAccount] = useState('')
  const [patientDataList, setPatientDataList] = useState([])
  const [patientDataContract, setPatientDataContract] = useState([])
  const [saveDataContract, setSaveDataContract] = useState([])
  const [patientBioMedList, setPatientBioMedList] = useState([])
  const [patientMedicalDataList, setPatientMedicalDataList] = useState([])
  const [patientBio, setPatientBio] = useState({
    id: 'MEDREP2001457',
    name: 'Kishore Kumar',
    birthDate: '17 nov 2001',
    phoneNumber: '1234567890',
    _address: 'sangadigunta L R colony 4th lane guntur',
  })
  const [patientMedicalData, setPatientMedicalData] = useState({
    medReportId: 'MEDREP' + Math.ceil(Math.random() * 1000000000),
    weight: '70',
    height: '178',
    bloodGroup: 'B+',
    diseaseName: 'Hyper Myopia',
    diseaseDescription:
      'caused by long exposure to harmful artificial blue light',
    diseaseStartedOn: '1 apr 2016',
  })

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
  
        // Get connected account
        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);
  
        // Initialize patient data contract
        const patientDataContractCopy = new web3.eth.Contract(
          PATIENT_DATA_LIST_ABI,
          PATIENT_DATA_LIST_ADDRESS,
        );
  
        // Initialize save data contract
        const saveDataContractCopy = new web3.eth.Contract(
          SAVE_DATA_LIST_ABI,
          SAVE_DATA_LIST_ADDRESS,
        );
  
        setPatientDataContract(patientDataContractCopy);
        setSaveDataContract(saveDataContractCopy);
  
        // Ensure saveDataContract is initialized before calling methods
        if (saveDataContractCopy && saveDataContractCopy.methods) {
          // Call saveData method on the contract
          const data = await saveDataContractCopy.methods.saveData().call();
          console.log('Saved Data:', data);
        } else {
          console.error('saveDataContract is not initialized properly');
        }
  
      } catch (error) {
        console.error('Error loading blockchain data:', error);
      }
    };
  
    loadBlockchainData();
  }, []); // Empty dependency array ensures this runs once on component mount
   // Empty dependency array ensures this runs once on component mount
  

  const updateList = async (patientDataContract, acc) => {
    const senders = await patientDataContract.methods.senders(acc).call()
    // const medicalReports = await patientDataContract.methods.medicalReports(0).call()
    // let countMedicalReports = await patientDataContract.methods
    //   .countMedicalReports()
    //   .call()
    let countMedicalReports = senders.patientCount

    console.log(countMedicalReports)

    let patientBioMedList = []

    for (let i = 0; i < countMedicalReports; ++i) {
      console.log(await patientDataContract.methods.getPatientsList(i).call())
      let patientBio = await patientDataContract.methods
        .getPatientsList(i)
        .call()
      let patientMedicalReport = await patientDataContract.methods
        .medicalReports(parseInt(parseInt(patientBio[4])))
        .call()

      let patientBioMedObj = {
        name: patientBio[0],
        birthDate: patientBio[1],
        phoneNumber: patientBio[2],
        _address: patientBio[3],
        medicalReportNo: patientBio[4],
        senderId: patientMedicalReport.senderId,
        medReportId: patientMedicalReport.medReportId,
        weight: patientMedicalReport.weight,
        height: patientMedicalReport.height,
        bloodGroup: patientMedicalReport.bloodGroup,
        diseaseName: patientMedicalReport.diseaseName,
        diseaseDescription: patientMedicalReport.diseaseDescription,
        diseaseStartedOn: patientMedicalReport.diseaseStartedOn,
      }
      patientBioMedList.push(patientBioMedObj)
    }
    setPatientBioMedList(patientBioMedList)
    console.log(senders, patientBioMedList)
  }

  const decryptEncryptedList = async (saveDataContract) => {
    let patientBioMedList = []

    const totalMedicalReports = await saveDataContract.methods.totalMedicalReports().call()
    for(let i = 0; i < totalMedicalReports; ++i)
    {
      const {
        hashOfOriginalDataString,
        secondTimeEncryptedString,
        sender,
        medReportId
      } = await saveDataContract.methods.data(i).call()
      let firstCiphertext = sendToServerForSecondEncryption
              .decryptSecondCipherText(secondTimeEncryptedString, sender, medReportId)
      let originalDataObject = JSON.parse(CryptoJS.AES.decrypt(firstCiphertext, hashOfOriginalDataString).toString(CryptoJS.enc.Utf8));
      console.log(originalDataObject)
      let rowData = {...originalDataObject.patientBio, ...originalDataObject.patientMedicalData}
      patientBioMedList.push(rowData)
    }
    console.log(patientBioMedList)
    setPatientBioMedList(patientBioMedList)
  }

  // const addUpdatePatientBio = () => {
  //   patientDataContract.methods
  //     .addUpdatePatientBio(
  //       patientBio.name,
  //       patientBio.birthDate,
  //       patientBio.phoneNumber,
  //       patientBio._address,
  //     )
  //     .send({ from: account })
  //     .once('receipt', (receipt) => {
  //       console.log('saved')
  //       updateList(patientDataContract, account)
  //     })
  // }

  const addUpdatePatientMedicalData = async() => {
    console.log(patientBio, patientMedicalData)
    patientDataContract.methods
      .addMedicalReport(
        patientBio.id,
        patientBio.name,
        patientBio.birthDate,
        patientBio.phoneNumber,
        patientBio._address,
        patientMedicalData.medReportId,
        parseInt(patientMedicalData.weight),
        parseInt(patientMedicalData.height),
        patientMedicalData.bloodGroup,
        patientMedicalData.diseaseName,
        patientMedicalData.diseaseDescription,
        patientMedicalData.diseaseStartedOn,
      )
      .send({ from: account })
      .once('receipt', (receipt) => {
        console.log('saved', receipt)
        updateList(patientDataContract, account)
      })
    let JSONStringData = JSON.stringify({patientBio, patientMedicalData})
    let hash = CryptoJS.SHA256(JSONStringData).toString(CryptoJS.enc.Hex)
    console.log(hash)
    let firstCiphertext = CryptoJS.AES.encrypt(JSONStringData, hash).toString();
    console.log(firstCiphertext)
    let secondCiphertext = sendToServerForSecondEncryption.encryptFirstCipherText(firstCiphertext, account, patientMedicalData.medReportId)
    console.log(secondCiphertext)
    saveDataContract.methods
      .saveData(secondCiphertext, hash, patientMedicalData.medReportId).send({ from: account})
      .once('receipt', receipt => {
        console.log('saved', receipt)
        // updateList(patientDataContract, account)
    setPatientMedicalData({...patientMedicalData, medReportId: 'MEDREP' + Math.ceil(Math.random() * 1000000000)})
    decryptEncryptedList(saveDataContract)
      })
  }

  return (
    <Container maxWidth="md" className={style.container}>
      <Add
        patientBio={patientBio}
        setPatientBio={(obj) => setPatientBio(obj)}
        // addUpdatePatientBio={addUpdatePatientBio}
        patientMedicalData={patientMedicalData}
        setPatientMedicalData={(obj) => setPatientMedicalData(obj)}
        addUpdatePatientMedicalData={addUpdatePatientMedicalData}
      />
      <ShowData patientBioMedList={patientBioMedList} />
    </Container>
  )
}

export default App


// import { Container } from '@material-ui/core';
// import { useEffect, useState } from 'react';
// import Web3 from 'web3';
// import style from './App.module.css';
// import {
//   PATIENT_DATA_LIST_ADDRESS,
//   PATIENT_DATA_LIST_ABI,
// } from './contracts/PatientData';
// import {
//   SAVE_DATA_LIST_ADDRESS,
//   SAVE_DATA_LIST_ABI,
// } from './contracts/SaveData';
// import Add from './routes/Add';
// import ShowData from './routes/ShowData';
// import CryptoJS from 'crypto-js';
// import sendToServerForSecondEncryption from './server/sendToServerForSecondEncryption';

// function App() {
//   const [account, setAccount] = useState('');
//   const [patientBioMedList, setPatientBioMedList] = useState([]);
//   const [patientBio, setPatientBio] = useState({
//     id: 'MEDREP2001457',
//     name: 'Kishore Kumar',
//     birthDate: '17 nov 2001',
//     phoneNumber: '1234567890',
//     _address: 'sangadigunta L R colony 4th lane guntur',
//   });
//   const [patientMedicalData, setPatientMedicalData] = useState({
//     medReportId: 'MEDREP' + Math.ceil(Math.random() * 1000000000),
//     weight: '70',
//     height: '178',
//     bloodGroup: 'B+',
//     diseaseName: 'Hyper Myopia',
//     diseaseDescription: 'caused by long exposure to harmful artificial blue light',
//     diseaseStartedOn: '1 apr 2016',
//   });
//   const [patientDataContract, setPatientDataContract] = useState(null);
//   const [saveDataContract, setSaveDataContract] = useState(null);

//   useEffect(() => {
//     const loadBlockchainData = async () => {
//       try {
//         const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
//         const accounts = await web3.eth.requestAccounts();
//         setAccount(accounts[0]);

//         const patientDataContractCopy = new web3.eth.Contract(
//           PATIENT_DATA_LIST_ABI,
//           PATIENT_DATA_LIST_ADDRESS,
//         );
//         const saveDataContractCopy = new web3.eth.Contract(
//           SAVE_DATA_LIST_ABI,
//           SAVE_DATA_LIST_ADDRESS,
//         );

//         setPatientDataContract(patientDataContractCopy);
//         setSaveDataContract(saveDataContractCopy);

//       } catch (error) {
//         console.error('Error loading blockchain data:', error);
//       }
//     };

//     loadBlockchainData();
//   }, []);

//   const decryptEncryptedList = async (saveDataContract) => {
//     let patientBioMedList = [];

//     const totalMedicalReports = await saveDataContract.methods.totalMedicalReports().call();
//     for(let i = 0; i < totalMedicalReports; ++i) {
//       const {
//         hashOfOriginalDataString,
//         secondTimeEncryptedString,
//         sender,
//         medReportId
//       } = await saveDataContract.methods.data(i).call();
//       let firstCiphertext = sendToServerForSecondEncryption
//               .decryptSecondCipherText(secondTimeEncryptedString, sender, medReportId);
//       let originalDataObject = JSON.parse(CryptoJS.AES.decrypt(firstCiphertext, hashOfOriginalDataString).toString(CryptoJS.enc.Utf8));
//       let rowData = {...originalDataObject.patientBio, ...originalDataObject.patientMedicalData};
//       patientBioMedList.push(rowData);
//     }
//     setPatientBioMedList(patientBioMedList);
//   }

//   const addUpdatePatientMedicalData = () => {
//     let JSONStringData = JSON.stringify({ patientBio, patientMedicalData });
//     let hash = CryptoJS.SHA256(JSONStringData).toString(CryptoJS.enc.Hex);
//     let firstCiphertext = CryptoJS.AES.encrypt(JSONStringData, hash).toString();
//     let secondCiphertext = sendToServerForSecondEncryption.encryptFirstCipherText(firstCiphertext, account, patientMedicalData.medReportId);

//     if (saveDataContract && saveDataContract.methods && saveDataContract.methods.saveData) {
//       saveDataContract.methods
//         .saveData(secondCiphertext, hash, patientMedicalData.medReportId)
//         .send({ from: account })
//         .once('receipt', (receipt) => {
//           setPatientMedicalData({
//             ...patientMedicalData,
//             medReportId: 'MEDREP' + Math.ceil(Math.random() * 1000000000),
//           });
//           decryptEncryptedList(saveDataContract);
//         });
//     } else {
//       console.error('saveDataContract or saveData method is not available');
//     }
//   };

//   return (
//     <Container maxWidth="md" className={style.container}>
//       <Add
//         patientBio={patientBio}
//         setPatientBio={(obj) => setPatientBio(obj)}
//         patientMedicalData={patientMedicalData}
//         setPatientMedicalData={(obj) => setPatientMedicalData(obj)}
//         addUpdatePatientMedicalData={addUpdatePatientMedicalData}
//       />
//       <ShowData patientBioMedList={patientBioMedList} />
//     </Container>
//   );
// }

// export default App;
