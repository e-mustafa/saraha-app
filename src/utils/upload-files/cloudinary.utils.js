import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfig } from '../../config/env.js';

cloudinary.config({
	cloud_name: cloudinaryConfig.name,
	api_key: cloudinaryConfig.apiKey,
	api_secret: cloudinaryConfig.secret,
});

export default cloudinary;
