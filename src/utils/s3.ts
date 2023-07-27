import AWS from 'aws-sdk';
import config from '../../config';

export const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secrectAccessKey,
})

export const uploadS3Promise = (params: AWS.S3.PutObjectRequest) => new Promise((resolve, reject) => {
  s3.upload(params, (err, data) => {
    if (err) reject(err)
    resolve(data)
  })
})