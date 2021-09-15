import * as my_dongle from 'bleuio'
import 'regenerator-runtime/runtime'

let co2Arr =[]
document.getElementById('connect').addEventListener('click', function(){
  my_dongle.at_connect()
})

document.getElementById('central').addEventListener('click', function(){
    my_dongle.at_central().then((data)=>console.log(data))
  })
//read txt file
document.getElementById("myForm").addEventListener("submit", readFile);
function readFile(e) {
  e.preventDefault();
  var fr=new FileReader();
    fr.onload=function(){
                let deviceArr = fr.result.split("\r\n")
                //const deviceArr = da.filter(x => x != '')
                console.log(deviceArr);
                my_dongle.stop();
                co2Arr=[]
    my_dongle.at_gapstatus().then((gs) => {
        if (gs[1].includes("Central")) {
            //checkData('054CC0')

            for (let x in deviceArr){
                setTimeout(() => {
                    checkData(deviceArr[x]);
                    if((deviceArr.length)===Number(x)+1){
                      
                        document.getElementById("complete").innerHTML ='<hr/> Done. Min CO2 = '+Math.min(...co2Arr)+ ' Max CO2 = '+Math.max(...co2Arr)+' Average = '+co2Arr.reduce((a,b) => a + b, 0)/ co2Arr.length
                        document.getElementById("resultData").innerHTML +='<hr/>'
                    }
                  }, 2000*x);
                
            }    
        } else {
          my_dongle.at_central().then(() => {
            for (let x in deviceArr){
                
              setTimeout(() => {
                  checkData(deviceArr[x]);
                  if((deviceArr.length)===Number(x)+1){
                    
                      document.getElementById("complete").innerHTML ='<hr/> Done. Min CO2 = '+Math.min(...co2Arr)+ ' Max CO2 = '+Math.max(...co2Arr)+' Average = '+co2Arr.reduce((a,b) => a + b, 0)/ co2Arr.length+'<hr/>'
                      document.getElementById("resultData").innerHTML +='<hr/>'
                  }
                }, 2000*x);
              
          } 
          });
        }
      });
    }
        
    fr.readAsText( document.getElementById("inputfile").files[0]);
}
  

/* const deviceArr=[
'05886B',
'0578EC',
'054CC0',
'05735B',
'04410E',
'0578C1',
'056EAB',
'021879',
'0578CF'
] */
/* document.getElementById('testDevice').addEventListener('click', function(){
    my_dongle.stop();
    my_dongle.at_gapstatus().then((gs) => {
        if (gs[1].includes("Central")) {
            //checkData('054CC0')
            for (let x in deviceArr){
                setTimeout(() => {
                    checkData(deviceArr[x]);
                  }, 2000*x);
            }          
        } else {
          my_dongle.at_central().then(() => {
            checkData(deviceArr[0]);
          });
        }
      });
}) */

const checkData = (sensorID) => {
    //console.log(sensorID)
    if(!sensorID) return false

    my_dongle
      .at_findscandata(sensorID, 4)
      .then((data) => {
        let scannedData = data[data.length - 1];
        scannedData = scannedData.split(" ");
        console.log(scannedData)
        //getData(parseSensorData(scannedData[4]));
       getData(parseSensorData(scannedData[4])).then((x) => {
          let allData = parseSensorData(scannedData[4]);
          if (
            (allData.type === "PM" && x === 5) ||
            (allData.type === "CO2" && x === 6)
          ) {
            document.getElementById("resultData").innerHTML += '<span class="passed"> Test Passed. </span>'+JSON.stringify(allData)+'<br><br>';	

          } else {
            document.getElementById("resultData").innerHTML += "<span class='failed'>Test Failed. </span>"+JSON.stringify(allData)+'<br><br>';
            }

        }); // end get data
        //my_dongle.stop();
      })
      .catch((er) => {
        //my_dongle.stop();
        console.log(er + 
          "Error : Scan Failed ! Check device ID or connection and try again."
        );
      });
    /* setTimeout(() => {
      my_dongle.stop();
    }, 1000); */
  };

  const getData = async (scannedData) => {

        let ct = 0;
        if (scannedData.p >= 0) ct++;
        if (scannedData.t >= 0 ) ct++;
        if (scannedData.h >= 0) ct++;
        if (scannedData.als >= 0) ct++;
        if (scannedData.voc >= 0) ct++;
        if (scannedData.co2 >= 0) ct++;
        /* if (scannedData.pm1 >= 0) ct++;
        if (scannedData.pm25 >= 0) ct++;
        if (scannedData.pm10 >= 0) ct++; */
        co2Arr.push(scannedData.co2)
        return ct;
  };

  const parseSensorData = (input) => {
    let counter = 13;
    if (input.includes("5B0705")) {
      counter = 17;
    }
    let sensorData = {
      sensorid:
        input[counter + 1] +
        input[counter + 2] +
        input[counter + 3] +
        input[counter + 4] +
        input[counter + 5] +
        input[counter + 6],
      type: parseInt(input[counter - 1] + input[counter]) === 4 ? "CO2" : "PM",
      p:
        parseInt(
          input[counter + 13] +
            input[counter + 14] +
            input[counter + 11] +
            input[counter + 12],
          16
        ) / 10,
      t:
        parseInt(
          input[counter + 17] +
            input[counter + 18] +
            input[counter + 15] +
            input[counter + 16],
          16
        ) / 10,
      h:
        parseInt(
          input[counter + 21] +
            input[counter + 22] +
            input[counter + 19] +
            input[counter + 20],
          16
        ) / 10,
      voc: parseInt(
        input[counter + 25] +
          input[counter + 26] +
          input[counter + 23] +
          input[counter + 24],
        16
      ),
      als: parseInt(
        input[counter + 9] +
          input[counter + 10] +
          input[counter + 7] +
          input[counter + 8],
        16
      ),
      co2: parseInt(
        input[counter + 39] +
          input[counter + 40] +
          input[counter + 41] +
          input[counter + 42],
        16
      ),
      pm1:
        parseInt(
          input[counter + 29] +
            input[counter + 30] +
            input[counter + 27] +
            input[counter + 28],
          16
        ) / 10,
      pm25:
        parseInt(
          input[counter + 33] +
            input[counter + 34] +
            input[counter + 31] +
            input[counter + 32],
          16
        ) / 10,
      pm10:
        parseInt(
          input[counter + 37] +
            input[counter + 38] +
            input[counter + 35] +
            input[counter + 36],
          16
        ) / 10,
    };
    return sensorData;
  };