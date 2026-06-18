const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user');

dotenv.config();

const createAdmin = async () => {
    console.log('🚀 Checking/Creating Admin Account...');

    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Cek apakah admin sudah ada
        const email = 'admin@graphology.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('⚠️ Admin user already exists. Updating password...');
            // Reset password explicitly just in case
            user.password = 'admin123';
            user.role = 'admin'; // Ensure role is admin
            // Ensure profile exists
            if (!user.profile) {
                user.profile = {};
            }
            user.profile.age = 30;
            user.profile.gender = 'Laki-laki';

            await user.save();
            console.log('✅ Admin password reset to: admin123');
        } else {
            console.log('✨ Creating new Admin user...');
            await User.create({
                name: 'Admin Graphology',
                email: email,
                password: 'admin123',
                phoneNumber: '08123456789',
                role: 'admin',
                profile: {
                    age: 30,
                    gender: 'Laki-laki',
                    education: 'S1',
                    dominant_hand: 'Kanan'
                }
            });
            console.log('✅ Admin created successfully!');
        }

        console.log('📧 Email: admin@graphology.com');
        console.log('🔑 Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createAdmin();
