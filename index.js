var DEFAULT_PORT = process.env.PORT || 8000;
var DEFAULT_HOST = '127.0.0.1'
var SERVER_NAME = 'healthrecords'
var getRequestCounter = 0;
var postRequestCounter = 0;
var putRequestCounter = 0;
var deleteRequestCounter = 0;
var patientArray = [];

var http = require ('http');
var mongoose = require ("mongoose");

//var port = process.env.PORT;
var ipaddress = process.env.IP; // TODO: figure out which IP to use for the heroku

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.  
var uristring = 
  process.env.MONGODB_URI || 
  'mongodb://tekstil:teksdev07@ds151753.mlab.com:51753/mapd713groupproject';
  //'mongodb://localhost/e-health-db';

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Successfully connected to: ' + uristring);
  }
});

// This is the schema.  Note the types, validation and trim
// statements.  They enforce useful constraints on the data.
var patientSchema = new mongoose.Schema({
  first_name: String,
  last_name: String, 
  blood_group: String, 
  address: String, 
  date_of_birth: String, 
  date_admitted: String, 
  department: String, 
  doctor: String, 
  ailment:String, 
});

var patientRecordsSchema = new mongoose.Schema({
  patient_id: String,
  pulse: String,
  nurse_name: String,
  allergy: String,
  BMI: String,
  surgery: String
});

var userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  mail_address: String,
  phone: String,
  department: String,
  position: String, 
  username: String,
  password: String
});

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'Patients' collection in the MongoDB database
var Patient = mongoose.model('Patient', patientSchema);
var PatientRecord = mongoose.model('PatientRecord', patientRecordsSchema);
var User = mongoose.model('User', userSchema);

var restify = require('restify')
  // Create the restify server
  , server = restify.createServer({ name: SERVER_NAME})

	if (typeof ipaddress === "undefined") {
		//  Log errors on OpenShift but continue w/ 127.0.0.1 - this
		//  allows us to run/test the app locally.
		console.warn('No process.env.IP var, using default: ' + DEFAULT_HOST);
		ipaddress = DEFAULT_HOST;
	};

  
  //delete the ipaddress parameter while deploting to heroku. Otherwise, use the ipaddress parameter in local.
  server.listen(DEFAULT_PORT,function () {
  console.log('Server %s listening at %s', server.name, server.url)
  console.log('Resources:')
  console.log(' /patients')
  console.log(' /patients/:id')
})


  server
    // Allow the use of POST
    .use(restify.plugins.fullResponse())

    // Maps req.body to req.params so there is no switching between them
    .use(restify.plugins.bodyParser())


// Get a single patient by its patient id
server.get('/login/:username', function (req, res, next) {
  getRequestCounter++;
  console.log('received GET request.');
  console.log("Processed Request Counter --> GET: " +  getRequestCounter + ", POST: " + postRequestCounter + ", PUT: " + putRequestCounter +", DELETE: " +deleteRequestCounter);
  // Find a single patient by their id within save
  User.findOne({ username: req.params.username}, function (error, user) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

    if (user) {
      // Send the patient if no issues
      res.send(user)
      console.log('Sending response to GET request.');
      console.log('OK');
    } else {
      // Send 404 header if the patient doesn't exist
      res.send(404)
      console.log("Error occurred in sending Response.");
    }
  })
})
// Create a new user
server.post('/register', function (req, res, next) {
  postRequestCounter++;
  console.log('received POST request.');
  console.log("new user request");
  console.log("Processed Request Counter --> GET: " +  getRequestCounter + ", POST: " + postRequestCounter + ", PUT: " + putRequestCounter +", DELETE: " +deleteRequestCounter);
  
  
  // Make sure first_name is defined
  if (req.params.first_name === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('first_name must be supplied'))
  }
  // Make sure last_name is defined
  if (req.params.last_name === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('last_name must be supplied'))
  }
  // Make sure mail_address is defined
  if (req.params.mail_address === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('mail_address must be supplied'))
  }
  // Make sure phone is defined
  if (req.params.phone === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('phone must be supplied'))
  }
  // Make sure department is defined
  if (req.params.department === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('department must be supplied'))
  }
  // Make sure position is defined
  if (req.params.position === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('department must be supplied'))
  }
  // Make sure username is defined
  if (req.params.username === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('username must be supplied'))
  }
  if (req.params.password === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('password must be supplied'))
  }
  
 var newuser = {
    first_name: req.params.first_name,
    last_name: req.params.last_name,
    mail_address: req.params.mail_address,
    phone: req.params.phone,
    department: req.params.department,
    position: req.params.position,
    username: req.params.username, 
    password: req.params.password
  }
  
  // Create the user using the persistence engine
  User.create( newuser, function (error, user) {
    
    // If there are any errors, pass them to next in the correct format
    if (error) {
      console.log('Error on creating user.');
      return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    }
    
    // Send the patient if no issues
    res.send(201, user)
  })
  console.log('Sending response to POST request.');
})

  
  
   // Get all patients in the system
server.get('/patients', function (req, res, next) {
  getRequestCounter++;
  console.log('received GET request.');
  console.log("Processed Request Counter --> GET: " +  getRequestCounter + ", POST: " + postRequestCounter + ", PUT: " + putRequestCounter +", DELETE: " +deleteRequestCounter);

  // Find every entity within the given collection
  Patient.find({}, function (error, patients) {

    // Return all of the patients in the system
    res.send(patients)
    console.log('Sending response to GET request.');
  })
})

// Get a single patient by its patient id
server.get('/patients/:id', function (req, res, next) {
  getRequestCounter++;
  console.log('received GET request.');
  console.log("Processed Request Counter --> GET: " +  getRequestCounter + ", POST: " + postRequestCounter + ", PUT: " + putRequestCounter +", DELETE: " +deleteRequestCounter);
  // Find a single patient by their id within save
  Patient.findOne({ _id: req.params.id }, function (error, patient) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

    if (patient) {
      // Send the patient if no issues
      res.send(patient)
      console.log('Sending response to GET request.');
      console.log('OK');
    } else {
      // Send 404 header if the patient doesn't exist
      res.send(404)
      console.log("Error occurred in sending Response.");
    }
  })
})

// Create a new patient
server.post('/patients', function (req, res, next) {
  postRequestCounter++;
  console.log('received POST request.');
  console.log("Processed Request Counter --> GET: " +  getRequestCounter + ", POST: " + postRequestCounter + ", PUT: " + putRequestCounter +", DELETE: " +deleteRequestCounter);
  
  // Make sure first_name is defined
  if (req.params.first_name === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('first_name must be supplied'))
  }
  if (req.params.last_name === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('last_name must be supplied'))
  }
  if (req.params.blood_group === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('blood_group must be supplied'))
  }
  if (req.params.address === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('address must be supplied'))
  }
  if (req.params.date_of_birth === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('date_of_birth must be supplied'))
  }
  if (req.params.date_admitted === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('date_admitted must be supplied'))
  }
  if (req.params.department === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('department must be supplied'))
  }
  if (req.params.doctor === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('doctor must be supplied'))
  }
  if (req.params.ailment === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('ailment must be supplied'))
  }
  var newpatient = {
		first_name: req.params.first_name, 
    last_name: req.params.last_name,
    blood_group: req.params.blood_group,
    address: req.params.address,
    date_of_birth: req.params.date_of_birth,
    date_admitted: req.params.date_admitted,
    department: req.params.department,
    doctor: req.params.doctor,
    ailment:req.params.ailment
	}
  
  // Create the patient using the persistence engine
  Patient.create( newpatient, function (error, patient) {
    
    // If there are any errors, pass them to next in the correct format
    if (error) {
      console.log('Error on creating patient.');
      return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    }
    
    // Send the patient if no issues
    res.send(201, patient)
    patientArray.push(patient);
    console.log('patient Array: ' + patientArray);
    
  })
  console.log('Sending response to POST request.');
})

// Update a patient by their id
server.put('/patients/:id', function (req, res, next) {
  putRequestCounter++;
  console.log('received PUT request.');
  console.log("Processed Request Counter --> GET: " +  getRequestCounter + ", POST: " + postRequestCounter + ", PUT: " + putRequestCounter +", DELETE: " +deleteRequestCounter);
  
  // Make sure first_name is defined
  if (req.params.first_name === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('first_name must be supplied'))
  }
  if (req.params.last_name === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('last_name must be supplied'))
  }
  if (req.params.blood_group === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('blood_group must be supplied'))
  }
  if (req.params.address === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('address must be supplied'))
  }
  if (req.params.date_of_birth === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('date_of_birth must be supplied'))
  }
  if (req.params.date_admitted === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('date_admitted must be supplied'))
  }
  if (req.params.department === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('department must be supplied'))
  }
  if (req.params.doctor === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('doctor must be supplied'))
  }
  if (req.params.ailment === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('ailment must be supplied'))
  }
  
  var newpatient = {
		first_name: req.params.first_name, 
    last_name: req.params.last_name,
    blood_group: req.params.blood_group,
    address: req.params.address,
    date_of_birth: req.params.date_of_birth,
    date_admitted: req.params.date_admitted,
    department: req.params.department,
    doctor: req.params.doctor,
    ailment:req.params.ailment
	}
  
  // Update the patient with the persistence engine
  Patient.update(newpatient, function (error, patient) {
    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

    console.log('Sending response to PUT request.');
    // Send a 200 OK response
    res.send(200)
  })
})

// Delete patient with the given id
server.del('/patients/:id', function (req, res, next) {
  
  deleteRequestCounter++;
  console.log('received DELETE request.');
  console.log("Processed Request Counter --> GET: " +  getRequestCounter + ", POST: " + postRequestCounter + ", PUT: " + putRequestCounter +", DELETE: " +deleteRequestCounter);
  
  // Delete the patient with the persistence engine
  Patient.delete(req.params.id, function (error, patient) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

    // Send a 200 OK response
    res.send()
    console.log('Sending response to DELETE request.');
  })
})

// Delete all patients in the system
server.del('/patients', function (req, res) {
  
  deleteRequestCounter++;
  console.log('received DELETE request.');
  console.log("Processed Request Counter --> GET: " +  getRequestCounter + ", POST: " + postRequestCounter + ", PUT: " + putRequestCounter +", DELETE: " +deleteRequestCounter);
  
  // Find every entity within the given collection
  Patient.deleteMany({}, function (error) {

    // Return all of the patients in the system
    res.send()
    console.log('Sending response to DELETE request.');
  })
})




// Create a new patient record by patients it
server.post('/patients/:id/records', function (req, res, next) {
  console.log('RECORDS POSTTTT LOLOLOO request.');
  postRequestCounter++;
  console.log('received POST request.');
  console.log("Processed Request Counter --> GET: " +  getRequestCounter + ", POST: " + postRequestCounter + ", PUT: " + putRequestCounter +", DELETE: " +deleteRequestCounter);
  
  if (req.params.patient_id === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('patient_id must be supplied'))
  }
  if (req.params.pulse === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('pulse must be supplied'))
  }
  if (req.params.nurse_name === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('nurse_name must be supplied'))
  }
  if (req.params.allergy === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('allergy must be supplied'))
  }
  if (req.params.bmi === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('bmi must be supplied'))
  }
  if (req.params.surgery === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('surgery must be supplied'))
  }
  
  var newpatientrecord = {
      patient_id: req.body.patient_id,
      pulse: req.body.pulse,
      nurse_name: req.body.nurse_name,
      allergy: req.body.allergy,
      BMI: req.body.bmi,
      surgery: req.body.surgery
  }
  
  // Create the patient using the persistence engine
  PatientRecord.create( newpatientrecord, function (error, record) {
    
    // If there are any errors, pass them to next in the correct format
    if (error) {
      console.log('Error on creating patient record.');
      return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    }
    
    // Send the patient if no issues
    res.send(201, record)
   })
  console.log('Sending response to POST request.');
})



// Get patient records by its patient id
server.get('/patients/:id/records', function (req, res, next) {
  console.log('************GET RECORDS request. PATIENT ID =' + req.params.id);
  getRequestCounter++;
  console.log('received GET request.');
  console.log("Processed Request Counter --> GET: " +  getRequestCounter + ", POST: " + postRequestCounter + ", PUT: " + putRequestCounter +", DELETE: " +deleteRequestCounter);
  
  // Find a single patient by their id within save
  Patient.findOne({ _id: req.params.id }, function (error, patient) {

    // If there are any errors, pass them to next in the correct format
    if (error){
      console.log(error)
      return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
    } 
    if (!patient) {
      console.log(`->No patient with ID [${req.params.id}] found`);
      res.send(404)
   }else{
    console.log(`hahahah`);
      PatientRecord.find({patient_id: req.params.id}, function (error, records) {
          // If there are any errors, pass them to next in the correct format
        if (error){
          console.log(error)
          return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
        } 
        if (!records) {
          console.log(`->No patient record with Patient ID [${req.params.id}] found`);
          res.send(404)
      }
        else{
          res.send(records)
          console.log('Sending response to GET request.');
          console.log('OK');
        }
      })
    }
  })
})

// Delete all patients in the system
server.del('/patients/:id/records', function (req, res) {
  
  deleteRequestCounter++;
  console.log('received DELETE request for PATIENT RECORDS.');
  console.log("Processed Request Counter --> GET: " +  getRequestCounter + ", POST: " + postRequestCounter + ", PUT: " + putRequestCounter +", DELETE: " +deleteRequestCounter);
  
  // Find every entity within the given collection
  PatientRecord.deleteMany({patient_id: req.params.patient_id}, function (error) {

    // Return all of the patients in the system
    res.send()
    console.log('Sending response to DELETE request.');
  })
})


