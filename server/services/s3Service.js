import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3 from '../s3.js';

async function generateUploadURL(key, mimeType) {
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        ContentType: mimeType
    });

    const uploadURL = await getSignedUrl(s3, command, {
        expiresIn: 300
    });
    return uploadURL;
}


export { generateUploadURL };