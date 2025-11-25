const Feedback = require('../models/feedbacks.model')

const feedbackService = {
    getAll: async({page, limit, sort}) => {
        const skip = (page - 1) * limit
    
        return await Promise.all([
            Feedback.countDocuments({}), 
            Feedback.find({}).skip(skip).limit(limit).sort(sort)])
        
    },
    create: async({ name, email, content }) => {
        const newFeedback = new Feedback({ name, email, content})
        return await newFeedback.save()
    }
}

module.exports = feedbackService
