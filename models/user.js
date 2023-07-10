const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        match: /^[a-zA-Z0-9]+$/,
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
    },
});

userSchema.pre('save', async function (next) {
    // Hash the password before saving it
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
