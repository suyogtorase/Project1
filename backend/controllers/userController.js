

export const getUserData = async(req, res)=> {
    const user = req.user;
    
    try {
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }

        res.status(200).json({
            success: true,
            UserData: {
                name: user.name,
                email: user.email,
                userId: user._id,
                userVerified: user.isAccountVerified
            }
        });
        
    } catch (error) {
        console.log("Error in getUserData, ", error);
        res.status(500).json({success: false, message: "Internal server error"});
    }
}