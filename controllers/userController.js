const user = require('../models/userModel');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const twilio = require('twilio');
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.createNewUser = async (req, res) => {
    try {
        const { name, email, password, mobileno } = req.body;

        let checkUser = await user.findOne({ email });

        if (checkUser) {
            return res.json({ status: 400, message: "User Already Exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000);

        const tempUserData = {
            name,
            email,
            password: hashedPassword,
            mobileno,
            otp,
            isVerified: false
        };

        let tempUser;
        if (!checkUser && !checkUser?.isVerified) {
            tempUser = await user.create(tempUserData);
        }


        // const newUser = await user.create({
        //     name,
        //     email,
        //     password: hashedPassword,
        //     mobileno,
        //     otp
        // });

        await twilioClient.messages.create({
            body: `Your OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: mobileno
        });

        return res.json({
            status: 200,
            message: "User Register Successfully... OTP sent to your mobile...",
            user: { mobileno: tempUser?.mobileno }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
};


exports.verifyOtp = async (req, res) => {
    try {
        const { mobileno, otp } = req.body;

        const userData = await user.findOne({ mobileno });

        if (!userData) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        if (userData.otp !== otp) {
            // await user.deleteOne({ email });
            return res.status(400).json({ status: 400, message: "Invalid OTP" });
        }

        userData.isVerified = true;

        userData.otp = undefined;
        await userData.save();

        // let token = await jwt.sign({ _id: userData._id }, process.env.SECRET_KEY, { expiresIn: "1D" })

        return res.status(200).json({ status: 200, message: "OTP Verified Successfully", user: userData });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.resendRegisterOtp = async (req, res) => {
    try {
        let { mobileno } = req.body;

        let chekcEmail = await user.findOne({ mobileno });

        if (!chekcEmail) {
            return res.status(404).json({ status: 404, success: false, message: "Mobile Number Not Found" });
        }

        let otp = Math.floor(100000 + Math.random() * 900000);

        await twilioClient.messages.create({
            body: `Resend Register OTP is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: chekcEmail.mobileno
        });

        chekcEmail.otp = otp;
        await chekcEmail.save();

        return res.status(200).json({
            status: 200,
            success: true,
            message: "OTP sent successfully via SMS...",
        });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ status: 500, success: false, message: error.message });
    }
};


exports.updateUser = async (req, res) => {
    try {
        let id = req.params.id;
        let userData = req.body;
        const filePath = req.file ? req.file.path : null;

        let userUpdateById = await user.findById(id);

        if (!userUpdateById) {
            return res.json({ status: 400, message: "User Not Found" });
        }

        const updateData = { ...userData };
        if (filePath) {
            updateData.photo = filePath;
        } else if (updateData.photo === "null") {
            updateData.photo = null;
        }
        console.log("updateData", updateData);

        userUpdateById = await user.findByIdAndUpdate(id, updateData, { new: true });

        return res.json({ status: 200, message: "User Updated Successfully", user: userUpdateById });
    } catch (error) {
        console.log(error);
        res.json({ status: 500, message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        let paginatedUser;

        paginatedUser = await user.find()

        let count = paginatedUser.length;

        if (count === 0) {
            return res.json({ status: 400, message: "Users Not Found" })
        }

        return res.json({ status: 200, totalUsers: count, message: "All User Found SuccessFully", user: paginatedUser })

    } catch (error) {
        res.json({ status: 500, message: error.message });
        console.log(error);
    }
};

exports.getUserById = async (req, res) => {
    try {
        let id = req.params.id

        let userFindById = await user.findById(id);

        if (!userFindById) {
            return res.json({ status: 400, message: "User Not Found" })
        }

        return res.json({ status: 200, message: "User Found SuccessFully", user: userFindById })

    } catch (error) {
        res.json({ status: 500, message: error.message });
        console.log(error);
    }
};

exports.userLogin = async (req, res) => {
    try {
        let { email, password, rememberMe } = req.body;

        let checkEmailIsExist = await user.findOne({ email });

        if (!checkEmailIsExist) {
            return res.status(404).json({ status: 404, message: "Email Not found" });
        }

        if (!checkEmailIsExist.isVerified) {
            return res.status(404).json({ status: false, message: "Please verify your email First" });
        }

        let comparePassword = await bcrypt.compare(password, checkEmailIsExist.password);

        if (!comparePassword) {
            return res.status(404).json({ status: 404, message: "Password Not Match" });
        }

        // Access Token (short expiry)
        let accessToken = await jwt.sign(
            { _id: checkEmailIsExist._id },
            process.env.SECRET_KEY,
            { expiresIn: '2h' }
        );

        // If rememberMe, set refresh token in DB and as cookie
        let refreshToken
        if (rememberMe) {
            // Refresh Token (long expiry, e.g., 7 days)
            refreshToken = jwt.sign(
                { _id: checkEmailIsExist._id },
                process.env.REFRESH_SECRET_KEY,
                { expiresIn: '15d' }
            );

            checkEmailIsExist.refreshToken = refreshToken;
            await checkEmailIsExist.save();

        }

        return res.status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 2 * 60 * 60 * 1000 })
            .cookie("refreshToken", refreshToken, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 15 * 24 * 60 * 60 * 1000 })
            .json({
                status: 200,
                message: "User Login SuccessFully...",
                user: checkEmailIsExist,
                token: accessToken
            });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: error.message });
    }
};

exports.refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) return res.status(404).json({ message: 'No Refresh Token' });

        // Verify token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
        const existingUser = await user.findById(decoded._id);

        const accessToken = await jwt.sign(
            {_id: existingUser._id},
            process.env.SECRET_KEY,
            { expiresIn: '2h' }
        );

        const refreshToken1 = await jwt.sign(
            {_id: existingUser._id},
            process.env.REFRESH_SECRET_KEY,
            { expiresIn: '15d' }
        );

        existingUser.refreshToken = refreshToken1;
        await existingUser.save({ validateBeforeSave: false });

        return res.status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 2 * 60 * 60 * 1000 })
            .cookie("refreshToken", refreshToken1, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: 15 * 24 * 60 * 60 * 1000 })
            .json({
                status: 200,
                message: "User Login SuccessFully...",
                user: existingUser,
                token: accessToken
            });
    } catch (err) {
        return res.status(403).json({ message: 'Refresh Failed', error: err.message });
    }
};


exports.googleLogin = async (req, res) => {
    try {
        let { uid, name, email, photo } = req.body;

        let [firstName, ...lastNameArr] = (name || '').trim().split(' ');
        let lastName = lastNameArr.join(' ');

        let checkUser = await user.findOne({ email });
        if (!checkUser) {
            checkUser = await user.create({
                name: firstName,
                lastname: lastName,
                email,
                photo
            });
        }
       
        checkUser.isVerified = true;
        await checkUser.save(); 
        checkUser = checkUser.toObject();

        let token = await jwt.sign({ _id: checkUser._id }, process.env.SECRET_KEY)
        return res.status(200).json({ message: 'Google Login successfully...', success: true, user: checkUser, token: token });
    } catch (error) {
        return res.status(500).json({ status: 500, message: error.message })
    }
};

exports.mobileLogin = async (req, res) => {
    try {
        let { mobileno, password } = req.body

        let checkEmailIsExist = await user.findOne({ mobileno })

        if (!checkEmailIsExist) {
            return res.status(404).json({ status: 404, message: "Mobile Number Not found" })
        }

        if (!checkEmailIsExist.isVerified) {
            return res.status(400).json({ status: false, message: "Please verify your Mobile No First" });
        }

        let comparePassword = await bcrypt.compare(password, checkEmailIsExist.password)

        if (!comparePassword) {
            return res.status(404).json({ status: 404, message: "Password Not Match" })
        }

        let token = await jwt.sign({ _id: checkEmailIsExist._id }, process.env.SECRET_KEY)

        // After successful login
        checkEmailIsExist.rememberMe = req.body.rememberMe || false;
        await checkEmailIsExist.save();

        return res.status(200).json({ status: 200, message: "User Login SuccessFully...!", user: checkEmailIsExist, token: token })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}


exports.changePassword = async (req, res) => {
    try {
        let id = req.user._id;

        let { oldPassword, newPassword, confirmPassword } = req.body;

        let getUser = await user.findById(id);

        if (!getUser) {
            return res.status(404).json({ status: 404, success: false, message: "User Not Found" });
        }

        let correctPassword = await bcrypt.compare(oldPassword, getUser.password);

        if (!correctPassword) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Old Password Not Match",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "New Password And ConfirmPassword Not Match",
            });
        }

        let salt = await bcrypt.genSalt(10);
        let hasPssword = await bcrypt.hash(newPassword, salt);

        await user.findByIdAndUpdate(id, { password: hasPssword }, { new: true });

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Password Change SuccessFully...",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        let { data } = req.body;
        console.log("type", typeof (data[1]))

        // if (!email && !mobileno) {
        //     return res.status(400).json({
        //         status: 400,
        //         success: false,
        //         message: "Email or Mobile number is required",
        //     });
        // }

        let checkEmail;
        const isMobile = /^\+\d{10,15}$/.test(data); // supports + followed by 10-15 digits
        console.log('ismoblie', isMobile)
        if (isMobile) {
            checkEmail = await user.findOne({ mobileno: data });
        } else {
            checkEmail = await user.findOne({ email: data });
        }

        if (!checkEmail) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "User not found",
            });
        }

        let otp = Math.floor(100000 + Math.random() * 900000);
        checkEmail.otp = otp;
        await checkEmail.save();

        if (!isMobile) {
            const transport = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                tls: {
                    // Allows self-signed or intercepting corporate proxies
                    rejectUnauthorized: false,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: data,
                subject: "Forgot Password OTP",
                text: `Your OTP is ${otp}`,
            };

            transport.sendMail(mailOptions, (error) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({
                        status: 500,
                        success: false,
                        message: error.message,
                    });
                }
                return res.status(200).json({
                    status: 200,
                    success: true,
                    message: "OTP sent via email successfully",
                });
            });
        } else {
            await twilioClient.messages.create({
                body: `Your OTP is ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: data,
            });

            return res.status(200).json({
                status: 200,
                success: true,
                message: "OTP sent via SMS successfully",
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

exports.emailOtpVerify = async (req, res) => {
    try {
        let { data, otp } = req.body;

        let email;
        let mobileno;

        const isMobile = /^\+\d{10,15}$/.test(data); // supports + followed by 10-15 digits
        console.log('ismoblie', isMobile)
        if (isMobile) {
            mobileno = data;
        } else {
            email = data;
        }

        if (!otp || (!email && !mobileno)) {
            return res.status(400).json({ status: 400, success: false, message: "Email or Mobile No and OTP are required" });
        }

        const checkEmailIsExist = email ? await user.findOne({ email }) : await user.findOne({ mobileno });

        if (!checkEmailIsExist) {
            return res.status(404).json({ status: 404, success: false, message: "User Not Found" });
        }

        if (checkEmailIsExist.otp != otp) {
            return res.status(404).json({ status: 200, success: false, message: "Invalid Otp" });
        }

        checkEmailIsExist.otp = undefined;

        await checkEmailIsExist.save();

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Otp Verified Successfully",
            data: checkEmailIsExist,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, success: false, message: error.message });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        let { data } = req.body;

        let email;
        let mobileno;

        const isMobile = /^\+\d{10,15}$/.test(data); // supports + followed by 10-15 digits
        console.log('ismoblie', isMobile)
        if (isMobile) {
            mobileno = data;
        } else {
            email = data;
        }

        if (!email && !mobileno) {
            return res.status(400).json({ status: 400, success: false, message: "Email or Mobile No is required" });
        }

        let checkUser = email ? await user.findOne({ email }) : await user.findOne({ mobileno });

        if (!checkUser) {
            return res
                .status(404)
                .json({ status: 404, success: false, message: "User Not Found" });
        }

        let otp = Math.floor(100000 + Math.random() * 900000);
        checkUser.otp = otp;
        await checkUser.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Resend Forgot Password Otp",
            text: `Your Code is ${otp}`,
        };

        if (email) {
            const transport = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                tls: {
                    // Allows self-signed or intercepting corporate proxies
                    rejectUnauthorized: false,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Resend Forgot Password Otp",
                text: `Your OTP is ${otp}`,
            };

            transport.sendMail(mailOptions, (error) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ status: 500, success: false, message: error.message });
                }
                return res.status(200).json({ status: 200, success: true, message: "OTP Sent via Email Successfully" });
            });

        } else {
            await twilioClient.messages.create({
                body: `Your OTP is ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: mobileno,
            });

            return res.status(200).json({ status: 200, success: true, message: "OTP Sent via SMS Successfully" });
        }
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ status: 500, success: false, message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { data, newPassword, confirmPassword } = req.body;

        let email;
        let mobileno;

        const isMobile = /^\+\d{10,15}$/.test(data); // supports + followed by 10-15 digits
        console.log('ismoblie', isMobile)
        if (isMobile) {
            mobileno = data;
        } else {
            email = data;
        }

        if (!email && !mobileno) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Email or Mobile No is required",
            });
        }

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Password fields are required",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Passwords do not match",
            });
        }

        const getUser = email ? await user.findOne({ email }) : await user.findOne({ mobileno });;

        if (!getUser) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "User Not Found",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        if (email && mobileno) {
            await user.findOneAndUpdate({ $or: [{ email }, { mobileno }] }, { password: hashedPassword }, { new: true });
        } else if (email) {
            await user.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
        } else if (mobileno) {
            await user.findOneAndUpdate({ mobileno }, { password: hashedPassword }, { new: true });
        }


        return res.status(200).json({
            status: 200,
            success: true,
            message: "Password Reset Successfully..!",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message,
        });
    }
};


exports.userLogout = async (req, res) => {
    try {
        // Clear the token from client side
        res.setHeader('Authorization', '');

        return res.status(200).json({
            status: 200,
            success: true,
            message: "User Logged Out Successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message
        });
    }
}
