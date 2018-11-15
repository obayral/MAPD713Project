var DEFAULT_PORT = process.env.PORT || 8080;
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
  blood_gorup: String, 
  address: String, 
  date_of_birth: String, 
  date_admitted: String, 
  department: String, 
  doctor: String, 
  ailment:String, 
});

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'Patients' collection in the MongoDB database
var Patient = mongoose.model('Patient', patientSchema);

var restify = require('restify')
  // Create the restify server
  , server = restify.createServer({ name: SERVER_NAME})

	if (typeof ipaddress === "undefined") {
		//  Log errors on OpenShift but continue w/ 127.0.0.1 - this
		//  allows us to run/test the app locally.
		console.warn('No process.env.IP var, using default: ' + DEFAULT_HOST);
		ipaddress = DEFAULT_HOST;
	};

  
  
  server.listen(DEFAULT_PORT, ipaddress, function () {
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

    if (patients) {
      // Send the patient if no issues
      res.send(patient)
      console.log('Sending response to GET request.');
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
    blood_gorup: req.params.blood_gorup,
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