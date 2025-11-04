const jwt = require("jsonwebtoken")
const User = require('../models/userModel');

exports.auth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    // console.log(token);
    
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
    try {
      const decoded = jwt.verify(token,process.env.SECRET_KEY);
      let user = await User.findById(decoded._id);
      req.user =user 
      next();
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  };

 
  // exports.refreshAccessToken = async (req, res) => {
  //   try {
  //     const { refreshToken } = req.cookies;

  //     console.log("refrehtoken",req.cookies)
  
  //     if (!refreshToken) return res.status(401).json({ message: 'No Refresh Token' });
  
  //     // Verify token
  //     const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
  //     const existingUser = await user.findById(decoded._id);
  
  //     if (!existingUser || existingUser.refreshToken !== refreshToken) {
  //       return res.status(403).json({ message: 'Invalid Refresh Token' });
  //     }
  
  //     // Generate new access token
  //     const newAccessToken = jwt.sign(
  //       { _id: existingUser._id },
  //       process.env.SECRET_KEY,
  //       { expiresIn: '15m' }
  //     );

  //     console.log("newAccessTOken",newAccessToken)
  
  //     return res.status(200).json({ token: newAccessToken });
  //   } catch (err) {
  //     return res.status(403).json({ message: 'Refresh Failed', error: err.message });
  //   }
  // };