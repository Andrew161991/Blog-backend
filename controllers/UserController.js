import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from "../models/User.js";


export const register = async (req, res) => {
    try {


    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt)

    const doc = new UserModel({
        email: req.body.email,
        passwordHash: hash,
        fullName: req.body.fullName,
        avatarUrl: req.body.avatarUrl,
    });
    
    const user = await doc.save();
    
    const token = jwt.sign({
        _id : user._id,
        
    }, "secret123", {expiresIn: "3h"});

    const { passwordHash, ...userData } = user._doc

    res.json({
        ...userData,
        token,
    });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Something went wrong with your registration!'
        });

    }
};

export const login = async (req, res) => {
    try {
        const user = await UserModel.findOne({email: req.body.email});
        if(!user){
            return req.status(404).json({message: 'User not found.'});
        }
        const isValidPassword = await bcrypt.compare(req.body.password, user._doc.passwordHash);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign({
                _id : user._id,
                
            }, "secret123", {expiresIn: "30d"});

            const { passwordHash, ...userData } = user._doc

            res.json({
                ...userData,
                token,
            });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Something went wrong'
        });
    }

};

export const getMe = async (req, res) => {
    try{
        const user = await UserModel.findById(req.userId);
        if(!user){
            return res.status(404).json({
                message: 'The user was not found',
            })
        }
        const { passwordHash, ...userData } = user._doc

        res.json(userData);
    } catch(err){
        console.log(err);
        res.sendStatus(500).json({
            message: 'Internal server error'
        });
        
    }
};