import mongoose, { Schema } from "mongoose";

const emailTemplateSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    subject: String,
    body: {
        type: String,
        required: true,
    },
    variables: {
        type: [String]
    }
}, {
    timestamps: true,
});

emailTemplateSchema.pre("save", function (next) {
    if (this.isModified("variables") && this.variables && this.variables.length) {
        const regexErrors = this.variables.filter(variable => !/^\$__.+$/.test(variable));
        const missingVars = this.variables.filter(variable => !new RegExp(variable.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "gi").test(this.body));

        if (regexErrors.length > 0) {
            return next(new Error(`Variables ${regexErrors.join(', ')} do not conform to pattern $__variablename`));
        }

        if (missingVars.length > 0) {
            return next(new Error(`Variables ${missingVars.join(', ')} are not present in the email body`));
        }

        return next();
    }
});


export default mongoose.model('EmailTemplate', emailTemplateSchema);