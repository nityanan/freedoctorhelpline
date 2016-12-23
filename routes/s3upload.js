/**
 * Created by nitya on 20/12/16.
 */

var s3 = require('s3');

var client = s3.createClient({
    maxAsyncS3: 20,     // this is the default
    s3RetryCount: 3,    // this is the default
    s3RetryDelay: 1000, // this is the default
    multipartUploadThreshold: 20971520, // this is the default (20 MB)
    multipartUploadSize: 15728640, // this is the default (15 MB)
    s3Options: {
        accessKeyId: "AKIAIRGBLL4Q3XNLNXYQ",
        secretAccessKey: "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"
        // any other options are passed to new AWS.S3()
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
    },
});