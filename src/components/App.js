import React, { Component } from 'react';
import NITP from '../NITP.png';
import './App.css';
import Web3 from 'web3';
import file from '../abis/file.json'

//For file upload using ipfs
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({host: "ipfs.infura.io", port:5001,  protocol: 'https'})

class App extends Component {

 async componentWillMount(){
   await this.loadWeb3()
   await this.loadBlockchainData()
 }

 //get account
 //get network
 //get smart contract
 //----> ABI: file.abi
 //----> Address: networkData.address
 //get file hash
 async loadBlockchainData(){
   const web3 = window.web3
   const accounts = await web3.eth.getAccounts()
   this.setState({account: accounts[0]})

   //get network id
   const networkId = await web3.eth.net.getId()
   console.log(networkId)

   const networkData = file.networks[networkId]
   if (networkData){
     const abi = file.abi
     const address = networkData.address
     //Fetch contract
     const contract = web3.eth.Contract(abi, address)
     this.setState({contract: contract})

     //call get method of contract
     const fileHash = await contract.methods.get().call()

     this.setState({fileHash})
   }
   else {
     window.alert('Smart contract not deployed to detected network !')
   }
 }

 constructor(props) {
   super(props);
   this.state = {
     account:"",
     buffer: null,
     contract: null,
     fileHash: 'QmQMjGjgLdDMYTWdr1uyLeXxxY7xzRiG6zvyDQCWPeKwEJ'
   };
 }

//Connection to blockchain
async loadWeb3(){
  if(window.ethereum){
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
  }
  if(window.web3){
    window.web3 = new Web3(window.web3.currentProvider)
  }
  else{
    window.alert("Please use metamask !")
  }
}


  //callback function for onChange event handler
  captureFile = (event) => {
    event.preventDefault()
    console.log('file captured')

    //Process file for IPFS

    //1.Capture file and read
    const file = event.target.files[0]
    const reader = new window.FileReader()

    //2.Convert file to buffer to upload/send to ipfs
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({buffer: Buffer(reader.result)})
      console.log('buffer', Buffer(reader.result))
    }
  }


  //hash = "QmQMjGjgLdDMYTWdr1uyLeXxxY7xzRiG6zvyDQCWPeKwEJ"
  //url: https://ipfs.infura.io/ipfs/QmQMjGjgLdDMYTWdr1uyLeXxxY7xzRiG6zvyDQCWPeKwEJ
 //callback function for onSubmit event handler
 onSubmit = (event) => {
    event.preventDefault()
    console.log('submiting file')

    //upload file to ipfs
    ipfs.add(this.state.buffer, (error, result) => {
    console.log('ipfs result', result)

      //getting hash of file from ipfs
      const fileHash = result[0].hash
      console.log(fileHash)
      if(error){
        console.error(error)
        return
      }

      //store hash on blockchain
      this.state.contract.methods.set(fileHash).send({from: this.state.account}).then((r) => {
        this.setState({fileHash: fileHash})
      })
    })

    
 }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            PISB
          </a>
          
          {/* display the account connected with metamask */}
          <ul className='navbar-nav px-3'>
            <li className='nav-item text-nowrap d-none d-sm-none d-sm-block'>
              <small className='text-white'>{this.state.account}</small>
            </li>
          </ul>
        </nav>

        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.nitp.ac.in/php/home.php"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={NITP} className="App-logo" alt="logo" />
                </a>
                <h1>National Institute Of Technology Patna</h1>
                <h4>
                 Personal Information Storage Using Etherium Blockchain
                </h4>
                
                 <div className="content">
                  <h3>Add your files</h3>
                  <form action="" className='form' onSubmit={this.onSubmit}>
                    <input type="file" onChange={this.captureFile}/>
                    <input type="submit" />
                  </form>
                  <a className='fileshow'  href={`https://ipfs.infura.io/ipfs/${this.state.fileHash}`}>Get file</a>
                 </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
