'use strict'
// https://strapi.io/documentation/v3.x/plugins/upload.html#create-providers
// Copy of strapi-provider-upload-aws-s3 but uses cloudfront cdn
// https://github.com/strapi/strapi/tree/master/packages/strapi-provider-upload-aws-s3
/**
 * Module dependencies
 */

/* eslint-disable no-unused-vars */
// Public node modules.
const _ = require('lodash');
const AWS = require('aws-sdk');

module.exports = {
  init(providerOptions) {
    const S3 = new AWS.S3({
	  region: providerOptions.region,
      accessKeyId: providerOptions.accessKeyId,
      secretAccessKey: providerOptions.secretAccessKey,
    });
    const Bucket = providerOptions.params.Bucket;

    return {
      upload(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // upload file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          S3.upload(
            {
              Key: `${path}${file.hash}${file.ext}`,
              Body: Buffer.from(file.buffer, 'binary'),
              //ACL: 'public-read',
              ContentType: file.mime,
			  Bucket,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              // set the bucket file url
              if (providerOptions.cdn) {
                file.url = `${providerOptions.cdn}/${data.Key}`;
              } else {
                file.url = data.Location;
              }

              resolve();
            }
          );
        });
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          S3.deleteObject(
            {
              Key: `${path}${file.hash}${file.ext}`,
			  Bucket,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve();
            }
          );
        });
      },
    };
  },
};