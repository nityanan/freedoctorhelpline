router.post('/uploadFile', function(req,res) {
    var db = req.app.locals.db
    //var name = req.files.upload.name
    //console.log("body >>>>",name)
    var files = [];
    console.log("body >>>>",req.body)
    console.log("params >>>>",req.params)

    var form = new Formidable.IncomingForm({
        uploadDir: __dirname + '/../uploads',
        keepExtensions: true
    });


    form.on('fileBegin', function(name, file) {
        //file.path = __dirname + '/../uploads'
        //console.log(">>>>>",file)
    });
    form.on('file', function(field, file) {
        //file.path = __dirname + '/../uploads'
        //file.name = "nitya"
        files.push([field, file]);
    })
    form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        console.log("fields .............",fields)
        console.log("files .............",files)
        files.name="nitya"
        files.name="nitya"
        res.end(util.inspect({fields: fields, files: files}));
    });

    form.on('error', function (err) {
        console.log(" form 1"+err)
    });


})