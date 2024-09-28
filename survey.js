document.addEventListener('DOMContentLoaded', () => {
 
    const geofenceType = document.getElementById('geofenceType');
    const shapeInputField = document.querySelector('.shapeInputField');
    const getLocationButton = document.querySelector('.getLocations');
    const autoPollingButton = document.querySelector('.auto');
    const coordinatesList = document.getElementById('coordinatesList');
    const shape = document.querySelector('.shapeInputField');
    const pollingRateInput = document.getElementById('pollingRate')
    const stoppageAllowed = document.getElementById('stoppageAllowed');
    const count  = document.getElementById('coordCount');
    count.value = 0;
    

    let pollingRate = 1000;
    coordinatesList.value = '';
    

    geofenceType.addEventListener('change', () => {
        if (geofenceType.value === 'P') {
            shapeInputField.value = 'LINESTRING'; 
        } else  if (geofenceType.value === 'L') {
          shapeInputField.value = 'CIRCLE'; 
        } 
        else {
            shapeInputField.value = 'POLYGON';
        }
    });
    //shapeInputField.value = (geofenceType.value === 'P') ? 'Polyline' : ((geofenceType.value === 'L') ? 'CIRCLE' : 'POLYGON');


    // fetch geolocation
    function getLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by this browser."));
                return;
            }
    
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve({ latitude, longitude });
                },
                (error) => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            reject(new Error("User denied the request for Geolocation."));
                            break;
                        case error.POSITION_UNAVAILABLE:
                            reject(new Error("Location information is unavailable."));
                            break;
                        case error.TIMEOUT:
                            reject(new Error("The request to get user location timed out."));
                            break;
                        case error.UNKNOWN_ERROR:
                            reject(new Error("An unknown error occurred."));
                            break;
                    }
                },
                {
                    enableHighAccuracy: true, // Request high accuracy
                    timeout: 5000,            // Maximum wait time for a response
                    maximumAge: 0             // Don't use a cached position
                }
            );
        });
    }

    const coordArray = [null, null];   
 
    // TAKES LAT LONG AS INPUT AND ADDS NON DUPLICATE ENTRIES TO RECORDS.
    // FIRED WHEN GET LOCATION BUTTON IS CLICKED.
    const createRecord = (lat, long) => {
        const newEntry = `${lat} ${long},`
        if(coordArray.length != 0 && coordArray[0] != newEntry){
            coordArray.unshift(newEntry);
            //console.log(coordArray.toString());
            displayData(coordArray[0]);
        }
        else console.log(`same location!`);
    }

    // ADDS TEXT TO THE TEXT AREA FIELD
    const displayData = (location) => {
        coordinatesList.value += location;
        count.value++;
    } 

    
    getLocationButton.addEventListener('click', () => {
        getLocation()
        .then((coords) => {
            //console.log(coords.latitude, coords.longitude);
            createRecord(coords.latitude, coords.longitude)
        })
        .catch((error) => {
            console.error(error.message);
        });
    })
    
    /***********************************AUTO POLLING LOGIC****************************************/

    pollingRateInput.addEventListener('change', () => {
        pollingRate = parseInt(pollingRateInput.value);
        //console.log(pollingRate);
        
        if(pollingRate === NaN)
            alert('Polling Rate is not a valid number')
        
    })
    let intervalId = null;
    let isRunning = false;

    function startStopAutoPolling() {
        if (!isRunning) {
            intervalId = setInterval(() => {
                //console.log(`Function executed every ${pollingRate/1000} seconds`);
                
                //get locations
                getLocation()
                .then((coords) => {
                    //console.log(coords.latitude, coords.longitude);
                    createRecord(coords.latitude, coords.longitude);
                })
                .catch((error) => {
                    console.error(error.message);
                
        });
            }, pollingRate);
            autoPollingButton.style.backgroundColor = '#4caf50';
            isRunning = true;
        } 
        else {
            clearInterval(intervalId);
            intervalId = null;
            autoPollingButton.style.backgroundColor = '#1565c0';
            isRunning = false;
        }
    }
    autoPollingButton.addEventListener('click', startStopAutoPolling)
   

    /************************************Send Data to Backend************************************/
    const form = document.querySelector('.form');
    const saveButton = document.querySelector('.saveGeofence');


    saveButton.addEventListener('click', () => {
        const formData = new FormData(form);
        formData.append('shape', shape.value);
        formData.append('stoppageAllowed', stoppageAllowed.checked ? 'true' : 'false');

        for(const[values, keys] of formData.entries()){
            console.log(`${keys} : ${values}`);
        }

        /**********************POST REQUEST******************************/
        const url = 'addfence.php';
        fetch(url, {
            method: 'POST',
            body: formData
          })
          .then(response => response.text())
          .then(result => {
            if(result == "true"){
              alert("Geofence Updated Successfully");
			  location.reload();
            } else{
              alert(result);
            }
          })
          .catch(error => {
            console.error('Error:', error);
          });
    });


    


    /***************************reset logic******************************************************/
    const resetButton = document.querySelector('.resetButton');
    const resetModal = document.querySelector('.modal');
    const confirmResetButton = document.getElementById('confirmReset');
    const cancelResetButton = document.getElementById('cancelReset');

    function spinIcon() {
        const svgIcon = document.querySelector('.resetSvg');
        svgIcon.classList.add('spin');
        
        setTimeout(() => {
          svgIcon.classList.remove('spin');
        }, 500); 
      }
      
      const closeModal = () => {
        resetModal.classList.remove('show');
        console.log('close Modal called!!!!!');
        return;
      }
      resetButton.addEventListener('click', (event) => {
        event.preventDefault();
        console.log('show modal');
        
    resetModal.classList.add('show'); 
    });

    confirmResetButton.addEventListener('click', (event) => {
        event.preventDefault(); 
        spinIcon();
        form.reset();
        closeModal();
        
    });
    
    cancelResetButton.addEventListener('click', (event) => {
        event.preventDefault(); 
        closeModal();
    });

    /*************************Polling Rate Check************************/
    document.getElementById("pollingRate").addEventListener("input", function () {
        const pollingRate = this;
        const errorMessage = document.getElementById("error-message");

        const isValid = pollingRate.checkValidity();
        
        if (!isValid) {
            errorMessage.style.display = "inline";
        } else {
            errorMessage.style.display = "none";
        }
    });
});





    
   