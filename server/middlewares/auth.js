const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authorizationHeader = req.headers['authorization']
    if (!authorizationHeader) return res.status(401).json({message: '401 Unauthorized'})

    const token = authorizationHeader.split(' ')[1]
    if (!token) return res.status(401).json({message: '401 Unauthorized'})

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, async (err, data) => {
        if (err) return res.status(403).json({message: '403 Forbidden'})
        const { userId, role } = data
        req.user = {userId: userId, role: role || 0}
        next()
    })
}

const checkRole = (permissions) => {
    return (req, res, next) => {
        const id = req.params.userId || req.query.userId
        const { role, userId } = req.user
        const { query } = req.query
        if (query) {
            const { role: roleQuery } = query
            if (roleQuery && role <= +roleQuery) return res.status(403).json({message: '403 Forbidden'})
        }

        if (!permissions.includes(role) && id !== userId) return res.status(403).json({message: '403 Forbidden'})
        next()
    }
}

const verifyUser = (req, res, next) => {
    try {
        const id = req.params.userId || req.query.userId
        const { role, userId } = req.user
        if (role > 0 || id === userId) {
            next()
        } else {
            return res.status(403).json({message: '403 Forbidden'})
        }
    } catch (error) {
        return res.status(403).json({message: '403 Forbidden'})
    }
}

const isStaff = (req, res, next) => {
    try {
        const id = req.params.userId || req.query.userId
        const { role, userId } = req.user
        if (role >= 2 || id === userId) {
            next()
        } else {
            return res.status(403).json({message: '403 Forbidden'})
        }
    } catch (error) {
        return res.status(403).json({message: '403 Forbidden'})
    }
}

const isAdmin = (req, res, next) => {
    const { role } = req.user
    if (role === 3) {
        next()
    } else {
        return res.status(403).json({message: '403 Forbidden'})
    }
}


module.exports = { verifyToken, checkRole, verifyUser, isStaff, isAdmin }