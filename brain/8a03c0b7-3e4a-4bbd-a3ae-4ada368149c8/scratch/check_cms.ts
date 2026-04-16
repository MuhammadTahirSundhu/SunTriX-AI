import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/suntrix';

async function checkCms() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const CmsContent = mongoose.model('CmsContent', new mongoose.Schema({
        key: String,
        data: mongoose.Schema.Types.Mixed
    }, { collection: 'cmscontents' }));

    const company = await CmsContent.findOne({ key: 'company' });
    console.log('Company Content:', JSON.stringify(company, null, 2));

    const introVideo = await CmsContent.findOne({ key: 'intro-video' });
     console.log('Intro Video Content:', JSON.stringify(introVideo, null, 2));

    await mongoose.disconnect();
}

checkCms();
