import user from '../model/user.js';

// Register / Add User
const createUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const newUser = new user({ email, password });
        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                _id: newUser._id,
                email: newUser.email,
                createdAt: newUser.createdAt
            }
        });
    } catch (error) {
        console.error("createUser error:", error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const foundUser = await user.findOne({ email }).select('+password');
        if (!foundUser) {
            return res.status(404).json({ success: false, message: 'User not found. Please sign up first.' });
        }

        if (foundUser.password !== password) {
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                _id: foundUser._id,
                email: foundUser.email,
                createdAt: foundUser.createdAt
            }
        });
    } catch (error) {
        console.error("loginUser error:", error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await user.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error("getAllUsers error:", error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

export default { createUser, loginUser, getAllUsers };
